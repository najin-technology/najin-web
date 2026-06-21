"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";
import { loginLimiter, getClientIp } from "@/lib/ratelimit";

type SignupState = { error?: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 초대 토큰으로 이메일/비밀번호 관리자 계정을 생성하고 바로 로그인시킨다.
// (SSO 없이 가입하는 경로. SSO 연동은 가입 후 설정 > 계정 연결에서 가능.)
export async function signUpWithInvite(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!UUID_RE.test(token)) return { error: "유효하지 않은 초대입니다." };
  if (!email || !password) return { error: "이메일과 비밀번호를 입력해주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
  if (password !== confirm) return { error: "비밀번호가 일치하지 않습니다." };

  const ip = getClientIp(await headers());
  const { success } = await loginLimiter.limit(ip);
  if (!success) return { error: "시도가 너무 잦습니다. 잠시 후 다시 시도해주세요." };

  const admin = getSupabaseAdmin();
  if (!admin) return { error: "서버 설정 오류로 가입할 수 없습니다." };

  // 초대 서버측 재검증 (클라이언트 값 신뢰 안 함)
  const { data: invite } = await admin
    .from("admin_invites")
    .select("id, used_at, revoked_at, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!invite) return { error: "유효하지 않은 초대입니다." };
  if (invite.used_at) return { error: "이미 사용된 초대입니다." };
  if (invite.revoked_at) return { error: "취소된 초대입니다." };
  if (new Date(invite.expires_at) <= new Date()) return { error: "만료된 초대입니다." };

  // 이미 가입된 이메일이면 차단 — 남의 계정에 비밀번호를 심는 탈취 방지.
  const { data: usersList, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) return { error: "가입 처리 중 오류가 발생했습니다. 다시 시도해주세요." };
  if (usersList.users.some((u) => u.email?.toLowerCase() === email)) {
    return {
      error: "이미 등록된 이메일입니다. 기존 로그인 방식으로 로그인한 뒤 초대를 수락하세요.",
    };
  }

  // 관리자 계정 생성 (이메일 확인 완료 처리 → 컨펌메일 설정과 무관하게 즉시 로그인 가능)
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (createErr || !created.user) {
    return { error: "가입에 실패했습니다. 다시 시도해주세요." };
  }

  // 초대 사용 처리
  await admin
    .from("admin_invites")
    .update({
      used_at: new Date().toISOString(),
      used_by_user_id: created.user.id,
      used_by_email: email,
    })
    .eq("id", invite.id);

  // 세션 설정(로그인)
  const supabase = await createSupabaseServerClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) {
    // 계정은 생성됨 — 자동 로그인만 실패. 로그인 페이지로 안내.
    return {
      error: "가입은 완료되었지만 자동 로그인에 실패했습니다. 로그인 페이지에서 로그인해주세요.",
    };
  }

  await logAudit({
    action: "signup",
    targetTable: "auth",
    details: { email, provider: "password", via_invite: true },
  });

  redirect("/admin");
}
