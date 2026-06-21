"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ActionState = { error?: string; success?: boolean };

// 카테고리 추가 시 색상 자동 배정 (순환). 색상 관리 UI는 생략.
const PALETTE = [
  "bg-orange-100 text-orange-800",
  "bg-purple-100 text-purple-800",
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-teal-100 text-teal-800",
  "bg-rose-100 text-rose-800",
  "bg-amber-100 text-amber-800",
  "bg-indigo-100 text-indigo-800",
];

export async function createCategory(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "카테고리 이름을 입력하세요." };

  const supabase = await createSupabaseServerClient();

  // 정렬순서: 맨 뒤에 추가 (max + 10)
  const { data: last } = await supabase
    .from("product_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (last?.sort_order ?? 0) + 10;

  // 색상 자동 배정
  const { count } = await supabase
    .from("product_categories")
    .select("id", { count: "exact", head: true });
  const color = PALETTE[(count ?? 0) % PALETTE.length];

  const { error } = await supabase
    .from("product_categories")
    .insert({ name, color, sort_order: sortOrder });

  if (error) {
    if (error.code === "23505") return { error: "이미 존재하는 카테고리입니다." };
    return { error: "카테고리 추가에 실패했습니다." };
  }

  await logAudit({ action: "create", targetTable: "product_categories", details: { name } });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionState> {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { data: cat } = await supabase
    .from("product_categories")
    .select("name")
    .eq("id", id)
    .single();
  if (!cat) return { error: "카테고리를 찾을 수 없습니다." };

  // 사용 중인(활성) 제품이 있으면 삭제 차단
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category", cat.name)
    .is("deleted_at", null);
  if (count && count > 0) {
    return { error: `이 카테고리를 쓰는 제품이 ${count}개 있습니다. 먼저 제품의 카테고리를 옮겨주세요.` };
  }

  const { error } = await supabase.from("product_categories").delete().eq("id", id);
  if (error) return { error: "카테고리 삭제에 실패했습니다." };

  await logAudit({
    action: "delete",
    targetTable: "product_categories",
    targetId: id,
    details: { name: cat.name },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  return { success: true };
}

// 드래그 정렬: id 배열 순서대로 sort_order = (index+1)*10
export async function reorderCategories(ids: string[]): Promise<ActionState> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length === 0) return { error: "reorder: empty list" };

  const supabase = await createSupabaseServerClient();
  await Promise.all(
    ids.map((id, index) =>
      supabase
        .from("product_categories")
        .update({ sort_order: (index + 1) * 10 })
        .eq("id", id)
    )
  );

  await logAudit({
    action: "reorder",
    targetTable: "product_categories",
    details: { count: ids.length },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  return { success: true };
}
