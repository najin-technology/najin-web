"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "webp"];
const ALLOWED_PDF_EXT = ["pdf"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PDF_SIZE = 30 * 1024 * 1024; // 30MB

type ActionResult = { ok: boolean; error?: string; id?: string };

function fileExt(name: string): string | null {
  const parts = name.split(".");
  if (parts.length < 2) return null;
  return parts.pop()?.toLowerCase() ?? null;
}

export async function upsertCertification(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const idRaw = formData.get("id") as string | null;
  const id = idRaw && idRaw !== "new" ? idRaw : null;

  const title_ko = (formData.get("title_ko") as string)?.trim() ?? "";
  const title_en = (formData.get("title_en") as string)?.trim() ?? "";
  const title_zh = (formData.get("title_zh") as string)?.trim() ?? "";
  const sortOrderRaw = formData.get("sort_order") as string;
  const sort_order = Number(sortOrderRaw) || 0;
  const is_published = formData.get("is_published") === "on";
  const imageFile = formData.get("image") as File | null;
  const pdfFile = formData.get("pdf") as File | null;

  if (!title_ko) return { ok: false, error: "한국어 제목은 필수입니다." };

  // Validate images/pdfs ahead of any DB ops.
  if (imageFile && imageFile.size > 0) {
    const ext = fileExt(imageFile.name);
    if (!ext || !ALLOWED_IMAGE_EXT.includes(ext)) {
      return { ok: false, error: "이미지는 jpg/jpeg/png/webp 만 허용됩니다." };
    }
    if (imageFile.size > MAX_IMAGE_SIZE) {
      return { ok: false, error: "이미지 크기는 10MB 이하만 허용됩니다." };
    }
  }
  if (pdfFile && pdfFile.size > 0) {
    const ext = fileExt(pdfFile.name);
    if (!ext || !ALLOWED_PDF_EXT.includes(ext)) {
      return { ok: false, error: "PDF 만 허용됩니다." };
    }
    if (pdfFile.size > MAX_PDF_SIZE) {
      return { ok: false, error: "PDF 크기는 30MB 이하만 허용됩니다." };
    }
  }

  const supabase = await createSupabaseServerClient();

  // Step 1: ensure we have a row (insert with placeholder image_path if new — required column).
  let certId = id;
  let existingImagePath: string | null = null;
  let existingPdfPath: string | null = null;

  if (!certId) {
    if (!imageFile || imageFile.size === 0) {
      return { ok: false, error: "신규 등록 시 이미지는 필수입니다." };
    }
    // Use placeholder path; we'll update right after upload.
    const { data: inserted, error: insertError } = await supabase
      .from("certifications")
      .insert({
        title_ko,
        title_en,
        title_zh,
        image_path: "__pending__",
        sort_order,
        is_published,
      })
      .select("id")
      .single();
    if (insertError || !inserted) {
      return { ok: false, error: `생성 실패: ${insertError?.message ?? "unknown"}` };
    }
    certId = inserted.id as string;
  } else {
    const { data: existing } = await supabase
      .from("certifications")
      .select("image_path, pdf_path")
      .eq("id", certId)
      .maybeSingle();
    existingImagePath = existing?.image_path ?? null;
    existingPdfPath = existing?.pdf_path ?? null;
  }

  let newImagePath: string | null = null;
  let newPdfPath: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const ext = fileExt(imageFile.name)!;
    const path = `certifications/${certId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, imageFile, { upsert: false, contentType: imageFile.type });
    if (uploadError) {
      return { ok: false, error: `이미지 업로드 실패: ${uploadError.message}` };
    }
    newImagePath = path;
  }

  if (pdfFile && pdfFile.size > 0) {
    const ext = fileExt(pdfFile.name)!;
    const path = `certifications/${certId}-brochure-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, pdfFile, { upsert: false, contentType: "application/pdf" });
    if (uploadError) {
      return { ok: false, error: `PDF 업로드 실패: ${uploadError.message}` };
    }
    newPdfPath = path;
  }

  // Step 2: update row
  const updatePayload: Record<string, unknown> = {
    title_ko,
    title_en,
    title_zh,
    sort_order,
    is_published,
  };
  if (newImagePath) updatePayload.image_path = newImagePath;
  if (newPdfPath) updatePayload.pdf_path = newPdfPath;

  const { error: updateError } = await supabase
    .from("certifications")
    .update(updatePayload)
    .eq("id", certId);

  if (updateError) {
    return { ok: false, error: `저장 실패: ${updateError.message}` };
  }

  // Best-effort: clean up replaced files.
  const toDelete: string[] = [];
  if (newImagePath && existingImagePath && existingImagePath !== "__pending__") toDelete.push(existingImagePath);
  if (newPdfPath && existingPdfPath) toDelete.push(existingPdfPath);
  if (toDelete.length > 0) {
    await supabase.storage.from("documents").remove(toDelete).catch(() => {});
  }

  await logAudit({
    action: id ? "update" : "create",
    targetTable: "certifications",
    targetId: certId,
    details: { title_ko, is_published },
  });

  revalidatePath("/admin/certifications");
  revalidatePath("/ko/about");
  revalidatePath("/en/about");
  revalidatePath("/zh/about");

  return { ok: true, id: certId };
}

export async function deleteCertification(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "id 누락" };

  const supabase = await createSupabaseServerClient();

  // Fetch paths so we can clean up storage too.
  const { data: row } = await supabase
    .from("certifications")
    .select("image_path, pdf_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("certifications").delete().eq("id", id);
  if (error) return { ok: false, error: `삭제 실패: ${error.message}` };

  if (row) {
    const paths = [row.image_path, row.pdf_path].filter(
      (p): p is string => typeof p === "string" && p.length > 0 && p !== "__pending__",
    );
    if (paths.length > 0) {
      await supabase.storage.from("documents").remove(paths).catch(() => {});
    }
  }

  await logAudit({
    action: "delete",
    targetTable: "certifications",
    targetId: id,
  });

  revalidatePath("/admin/certifications");
  revalidatePath("/ko/about");
  revalidatePath("/en/about");
  revalidatePath("/zh/about");

  return { ok: true };
}
