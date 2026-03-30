import { createSupabaseServerClient } from "./supabase-server";
import { getSession } from "./auth";

export async function logAudit(params: {
  action: string;
  targetTable: string;
  targetId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const user = await getSession();
    if (!user) return;

    const supabase = await createSupabaseServerClient();
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      user_email: user.email || "",
      action: params.action,
      target_table: params.targetTable,
      target_id: params.targetId || null,
      details: params.details || null,
    });
  } catch (e) {
    console.error("Failed to write audit log:", e);
  }
}
