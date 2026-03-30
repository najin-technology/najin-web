"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createHistoryItem(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const year = parseInt(formData.get("year") as string);
  const monthStr = formData.get("month") as string;
  const month = monthStr ? parseInt(monthStr) : null;
  const descriptionKo = formData.get("description_ko") as string;
  const descriptionEn = formData.get("description_en") as string;
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

  if (!year || !descriptionKo) {
    return { error: "연도와 설명(한국어)은 필수 항목입니다." };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("history_items")
    .insert({
      year,
      month,
      description_ko: descriptionKo,
      description_en: descriptionEn || null,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "연혁 등록에 실패했습니다." };
  }

  await logAudit({
    action: "create",
    targetTable: "history_items",
    targetId: data.id,
    details: { year, description_ko: descriptionKo },
  });

  revalidatePath("/admin/history");

  return { success: true };
}

export async function updateHistoryItem(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const year = parseInt(formData.get("year") as string);
  const monthStr = formData.get("month") as string;
  const month = monthStr ? parseInt(monthStr) : null;
  const descriptionKo = formData.get("description_ko") as string;
  const descriptionEn = formData.get("description_en") as string;
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

  if (!id || !year || !descriptionKo) {
    return { error: "연도와 설명(한국어)은 필수 항목입니다." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("history_items")
    .update({
      year,
      month,
      description_ko: descriptionKo,
      description_en: descriptionEn || null,
      sort_order: sortOrder,
    })
    .eq("id", id);

  if (error) {
    return { error: "연혁 수정에 실패했습니다." };
  }

  await logAudit({
    action: "update",
    targetTable: "history_items",
    targetId: id,
    details: { year, description_ko: descriptionKo },
  });

  revalidatePath("/admin/history");

  return { success: true };
}

export async function deleteHistoryItem(id: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  // Hard delete — no deleted_at on this table
  const { error } = await supabase
    .from("history_items")
    .delete()
    .eq("id", id);

  if (error) return;

  await logAudit({
    action: "delete",
    targetTable: "history_items",
    targetId: id,
  });

  revalidatePath("/admin/history");
}
