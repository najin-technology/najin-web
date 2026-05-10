"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CACHE_TAGS } from "@/lib/queries";

type ActionState = {
  error?: string;
  success?: boolean;
};

const MAX_PDF_SIZE = 30 * 1024 * 1024;

export async function updateSiteAbout(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();

  const payload: Record<string, unknown> = {
    ceo_name_ko: String(formData.get("ceo_name_ko") ?? ""),
    ceo_name_en: String(formData.get("ceo_name_en") ?? ""),
    ceo_name_zh: String(formData.get("ceo_name_zh") ?? ""),
    ceo_greeting_ko: String(formData.get("ceo_greeting_ko") ?? ""),
    ceo_greeting_en: String(formData.get("ceo_greeting_en") ?? ""),
    ceo_greeting_zh: String(formData.get("ceo_greeting_zh") ?? ""),
    updated_by: user.id,
  };

  const supabase = await createSupabaseServerClient();

  const brochure = formData.get("brochure_pdf") as File | null;
  let oldPath: string | null = null;

  if (brochure && brochure.size > 0) {
    const ext = brochure.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      return { error: "PDF 파일만 업로드할 수 있습니다." };
    }
    if (brochure.size > MAX_PDF_SIZE) {
      return { error: "PDF 크기는 30MB 이하만 허용됩니다." };
    }

    // Fetch existing path so we can clean up after the new one is saved.
    const { data: existing } = await supabase
      .from("site_about")
      .select("brochure_pdf_path")
      .eq("id", 1)
      .maybeSingle();
    oldPath = existing?.brochure_pdf_path ?? null;

    const newPath = `brochures/${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(newPath, brochure, {
        upsert: false,
        contentType: "application/pdf",
      });
    if (uploadError) {
      return { error: `브로셔 업로드 실패: ${uploadError.message}` };
    }

    payload.brochure_pdf_path = newPath;
    payload.brochure_pdf_name = brochure.name;
  }

  const { error } = await supabase
    .from("site_about")
    .update(payload)
    .eq("id", 1);

  if (error) {
    return { error: `저장 실패: ${error.message}` };
  }

  // Best-effort cleanup of replaced PDF.
  if (oldPath && payload.brochure_pdf_path && oldPath !== payload.brochure_pdf_path) {
    await supabase.storage.from("documents").remove([oldPath]).catch(() => {});
  }

  await logAudit({
    action: "update",
    targetTable: "site_about",
    targetId: "1",
    details: { fields: Object.keys(payload) },
  });

  updateTag(CACHE_TAGS.siteAbout);
  revalidatePath("/ko/about");
  revalidatePath("/en/about");
  revalidatePath("/zh/about");

  return { success: true };
}
