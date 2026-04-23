"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const STATUSES = ["리드", "검토중", "견적전송", "진행중", "완료", "보류", "거절"] as const;

export async function updateCustomerStatus(id: string, status: string) {
  await requireAdmin();
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return { error: "잘못된 상태값" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("customers").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    targetTable: "customers",
    targetId: id,
    details: { status },
  });
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/customers");
  return { success: true };
}

export async function updateCustomerTags(id: string, tags: string[]) {
  await requireAdmin();
  const cleaned = tags.map((t) => t.trim()).filter(Boolean).slice(0, 20);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("customers").update({ tags: cleaned }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    targetTable: "customers",
    targetId: id,
    details: { tags: cleaned },
  });
  revalidatePath(`/admin/customers/${id}`);
  return { success: true };
}

export async function updateCustomerNotes(id: string, notes: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("customers").update({ notes }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    targetTable: "customers",
    targetId: id,
    details: { notes_len: notes.length },
  });
  revalidatePath(`/admin/customers/${id}`);
  return { success: true };
}
