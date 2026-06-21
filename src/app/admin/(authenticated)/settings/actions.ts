"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin, loginMethods, canDisconnect } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
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

export async function disconnectNaver(): Promise<Result> {
  const user = await requireAdmin();
  if (!user.app_metadata?.naver_id) return { ok: true }; // 이미 해제됨 (idempotent)

  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: "서버 설정 오류로 해제할 수 없습니다." };

  // 락아웃 방지: 네이버 외 다른 로그인 수단이 남아야 해제 허용.
  const { data: full } = await admin.auth.admin.getUserById(user.id);
  if (!canDisconnect("naver", loginMethods(full?.user?.identities, user.app_metadata))) {
    return { ok: false, error: "마지막 로그인 수단은 해제할 수 없습니다." };
  }

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, naver_id: null, naver_email: null },
  });
  if (error) return { ok: false, error: `해제 실패: ${error.message}` };

  await logAudit({
    action: "unlink_identity",
    targetTable: "auth",
    details: { provider: "naver" },
  });
  revalidatePath("/admin/settings");

  return { ok: true };
}
