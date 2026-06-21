import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAdmin() {
  const user = await getSession();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/admin/login");
  }

  return user;
}

export function isAdmin(user: { app_metadata?: Record<string, unknown> }) {
  return user.app_metadata?.role === "admin";
}

export type LoginMethods = {
  hasEmailIdentity: boolean;
  hasGoogleIdentity: boolean;
  hasNaver: boolean;
};

/** 이 사용자가 보유한 로그인 수단(email/google native identity + 커스텀 naver). */
export function loginMethods(
  identities: { provider: string }[] | null | undefined,
  appMetadata: Record<string, unknown> | null | undefined
): LoginMethods {
  const ids = identities ?? [];
  return {
    hasEmailIdentity: ids.some((i) => i.provider === "email"),
    hasGoogleIdentity: ids.some((i) => i.provider === "google"),
    hasNaver: Boolean(appMetadata?.naver_id),
  };
}

/** 해당 provider 해제 후에도 로그인 수단이 1개 이상 남는지(락아웃 방지). */
export function canDisconnect(provider: "naver" | "google", m: LoginMethods): boolean {
  return provider === "naver"
    ? m.hasEmailIdentity || m.hasGoogleIdentity
    : m.hasEmailIdentity || m.hasNaver;
}
