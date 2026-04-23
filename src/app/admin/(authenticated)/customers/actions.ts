"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function normalizeCompany(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\(주\)|㈜|주식회사|inc\.?|co\.?,?\s*ltd\.?|llc/gi, "");
}

type CreateState = { error?: string; success?: boolean };

export async function createCustomer(
  _prev: CreateState,
  formData: FormData
): Promise<CreateState> {
  await requireAdmin();

  const companyName = (formData.get("company_name") as string)?.trim();
  const contactName = (formData.get("primary_contact_name") as string)?.trim() || null;
  const phone = (formData.get("primary_contact_phone") as string)?.trim() || null;
  const email = (formData.get("primary_contact_email") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!companyName) return { error: "회사명은 필수 항목입니다." };

  const supabase = await createSupabaseServerClient();
  const normalized = normalizeCompany(companyName);

  // Check duplicate
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("company_name_normalized", normalized)
    .is("deleted_at", null)
    .maybeSingle();
  if (existing) {
    return { error: "이미 같은 회사명으로 등록된 고객이 있습니다." };
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      company_name: companyName,
      company_name_normalized: normalized,
      primary_contact_name: contactName,
      primary_contact_phone: phone,
      primary_contact_email: email,
      notes,
      source: "manual",
      status: "리드",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "등록 실패: " + (error?.message || "알 수 없음") };
  }

  await logAudit({
    action: "create",
    targetTable: "customers",
    targetId: data.id,
    details: { company_name: companyName, source: "manual" },
  });
  revalidatePath("/admin/customers");
  redirect(`/admin/customers/${data.id}`);
}

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
