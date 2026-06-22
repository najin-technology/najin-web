"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";
import { loginLimiter, getClientIp } from "@/lib/ratelimit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { PERSIST_COOKIE, PERSIST_DURATION_MS, PERSIST_DURATION_SEC } from "@/lib/session";

type LoginState = {
  error: string;
};

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const h = await headers();
  const ip = getClientIp(h);

  const { success } = await loginLimiter.limit(ip);
  if (!success) {
    return { error: "로그인 시도가 너무 잦습니다. 15분 후 다시 시도해주세요." };
  }

  const turnstileToken = formData.get("turnstileToken");
  const tokenStr = typeof turnstileToken === "string" ? turnstileToken : null;
  const ok = await verifyTurnstileToken(tokenStr, ip);
  if (!ok) {
    return { error: "봇 검증에 실패했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요." };
  }

  // 자동 로그인 선택 시 persist 쿠키를 먼저 세팅 → 이어지는 세션 쿠키가 긴 maxAge로 발급됨.
  const persist = formData.get("persist") === "on";
  const cookieStore = await cookies();
  if (persist) {
    cookieStore.set(PERSIST_COOKIE, String(Date.now() + PERSIST_DURATION_MS), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PERSIST_DURATION_SEC,
    });
  } else {
    cookieStore.delete(PERSIST_COOKIE);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    cookieStore.delete(PERSIST_COOKIE);
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  if (data.user?.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    cookieStore.delete(PERSIST_COOKIE);
    return { error: "관리자 권한이 없습니다." };
  }

  await logAudit({
    action: "login",
    targetTable: "auth",
    details: { email },
  });

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();

  await logAudit({
    action: "logout",
    targetTable: "auth",
  });

  await supabase.auth.signOut();
  redirect("/admin/login");
}
