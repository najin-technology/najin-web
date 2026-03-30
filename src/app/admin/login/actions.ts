"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

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

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  if (data.user?.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
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
