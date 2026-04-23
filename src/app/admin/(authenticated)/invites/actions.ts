"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ActionState = {
  error?: string;
  success?: boolean;
  token?: string;
};

const EXPIRY_PRESETS = {
  "1d": 1,
  "3d": 3,
  "7d": 7,
  "30d": 30,
} as const;

export async function createInvite(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAdmin();

  const emailHint = (formData.get("email_hint") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const expiry = (formData.get("expiry") as string) || "7d";
  const days = EXPIRY_PRESETS[expiry as keyof typeof EXPIRY_PRESETS] || 7;

  const supabase = await createSupabaseServerClient();
  const expiresAt = new Date(Date.now() + days * 86400000).toISOString();

  const { data, error } = await supabase
    .from("admin_invites")
    .insert({
      email_hint: emailHint,
      notes,
      invited_by_user_id: user.id,
      invited_by_email: user.email || "",
      expires_at: expiresAt,
    })
    .select("token")
    .single();

  if (error || !data) {
    return { error: "초대 생성 실패: " + (error?.message || "알 수 없음") };
  }

  await logAudit({
    action: "create",
    targetTable: "admin_invites",
    details: { email_hint: emailHint, expires_at: expiresAt },
  });

  revalidatePath("/admin/invites");
  return { success: true, token: data.token };
}

export async function revokeInvite(id: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("admin_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("used_at", null);

  if (error) {
    console.error("Revoke invite error:", error);
    return;
  }

  await logAudit({
    action: "revoke",
    targetTable: "admin_invites",
    targetId: id,
  });

  revalidatePath("/admin/invites");
}
