"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ActionState = {
  error?: string;
  success?: boolean;
};

export async function updateSiteAbout(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();

  const payload = {
    ceo_name_ko: String(formData.get("ceo_name_ko") ?? ""),
    ceo_name_en: String(formData.get("ceo_name_en") ?? ""),
    ceo_name_zh: String(formData.get("ceo_name_zh") ?? ""),
    ceo_greeting_ko: String(formData.get("ceo_greeting_ko") ?? ""),
    ceo_greeting_en: String(formData.get("ceo_greeting_en") ?? ""),
    ceo_greeting_zh: String(formData.get("ceo_greeting_zh") ?? ""),
    updated_by: user.id,
  };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("site_about")
    .update(payload)
    .eq("id", 1);

  if (error) {
    return { error: `저장 실패: ${error.message}` };
  }

  await logAudit({
    action: "update",
    targetTable: "site_about",
    targetId: "1",
    details: { fields: Object.keys(payload) },
  });

  revalidatePath("/ko/about");
  revalidatePath("/en/about");
  revalidatePath("/zh/about");

  return { success: true };
}
