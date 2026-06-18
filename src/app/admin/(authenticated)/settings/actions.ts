"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CACHE_TAGS } from "@/lib/queries";

type Result = { ok: boolean; error?: string };

export async function saveQuoteIntakeSettings(input: {
  quotes_paused: boolean;
  pause_message_ko: string;
  pause_message_en: string;
  pause_message_zh: string;
}): Promise<Result> {
  const user = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      quotes_paused: input.quotes_paused,
      pause_message_ko: input.pause_message_ko,
      pause_message_en: input.pause_message_en,
      pause_message_zh: input.pause_message_zh,
      updated_by: user.id,
    })
    .eq("id", 1);

  if (error) return { ok: false, error: `저장 실패: ${error.message}` };

  await logAudit({
    action: "update",
    targetTable: "site_settings",
    targetId: "1",
    details: { quotes_paused: input.quotes_paused },
  });

  // 공개 견적 페이지(getSiteSettings 캐시 태그)를 즉시 무효화.
  updateTag(CACHE_TAGS.siteSettings);
  revalidatePath("/admin/settings");

  return { ok: true };
}
