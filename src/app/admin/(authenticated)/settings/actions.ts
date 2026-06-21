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

export async function changePassword(input: {
  currentPassword?: string;
  newPassword: string;
}): Promise<Result> {
  const user = await requireAdmin();

  if (input.newPassword.length < 8) {
    return { ok: false, error: "비밀번호는 8자 이상이어야 합니다." };
  }

  const supabase = await createSupabaseServerClient();

  // 기존 비밀번호(email identity)가 있으면 현재 비밀번호 확인을 요구해 세션 탈취 시 무단 변경을 막는다.
  // ponytail: email identity 유무를 "비밀번호 보유"로 근사 — SSO 전용 계정은 현재 비번 없이 새로 설정(=비밀번호 추가).
  // identities는 admin API가 권위 있으므로 그걸 우선 사용(세션 user.identities는 누락될 수 있음).
  const admin = getSupabaseAdmin();
  const fullUser = admin ? (await admin.auth.admin.getUserById(user.id)).data?.user : null;
  const identities = fullUser?.identities ?? user.identities ?? [];
  const hasPassword = identities.some((i) => i.provider === "email");
  if (hasPassword) {
    if (!input.currentPassword) {
      return { ok: false, error: "현재 비밀번호를 입력해주세요." };
    }
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email ?? "",
      password: input.currentPassword,
    });
    if (verifyErr) {
      return { ok: false, error: "현재 비밀번호가 올바르지 않습니다." };
    }
  }

  const { error } = await supabase.auth.updateUser({ password: input.newPassword });
  if (error) {
    return { ok: false, error: `변경 실패: ${error.message}` };
  }

  await logAudit({
    action: "update",
    targetTable: "auth",
    details: { field: "password" },
  });

  return { ok: true };
}
