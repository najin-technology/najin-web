"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * 거래처 표시 순서 일괄 업데이트.
 * id 배열 인덱스 기반으로 display_order 재배정 ((i+1)*10).
 */
export async function reorderClientCustomers(ids: string[]) {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length === 0) return { error: "reorder: empty list" };

  const supabase = await createSupabaseServerClient();
  await Promise.all(
    ids.map((id, index) =>
      supabase.from("customers").update({ display_order: (index + 1) * 10 }).eq("id", id)
    )
  );

  await logAudit({
    action: "reorder",
    targetTable: "customers",
    details: { count: ids.length, first: ids[0] },
  });

  revalidatePath("/admin/customers");
  revalidatePath("/", "layout"); // home + portfolio + clients/*
  return { success: true };
}
