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
