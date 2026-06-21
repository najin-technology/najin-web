import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { CategoryAdmin } from "./category-admin";

export const metadata = { title: "카테고리 관리", description: "제품 카테고리 관리", robots: "noindex, nofollow" };

export default async function CategoriesPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: cats }, { data: products }] = await Promise.all([
    supabase.from("product_categories").select("id, name, color, sort_order").order("sort_order"),
    supabase.from("products").select("category").is("deleted_at", null),
  ]);

  // 활성 제품 수 집계
  const counts: Record<string, number> = {};
  for (const p of products ?? []) counts[p.category] = (counts[p.category] ?? 0) + 1;

  const categories = (cats ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    count: counts[c.name] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <ListPageHeader title="카테고리 관리" count={categories.length} />
      <p className="text-sm text-gray-600 -mt-2 font-medium">
        제품 카테고리를 추가·삭제하고 순서를 조정합니다. 제품이 연결된 카테고리는 삭제할 수 없습니다.
      </p>
      <CategoryAdmin categories={categories} />
    </div>
  );
}
