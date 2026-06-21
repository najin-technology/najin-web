import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { Package } from "lucide-react";
import { SortableProductTable } from "./sortable-products";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";

export const metadata = { title: "제품 관리", description: "제품 목록 관리", robots: "noindex, nofollow" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("products")
    .select("id, name_ko, category, sort_order, is_active, created_at")
    .is("deleted_at", null)
    .order("category")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name_ko", `%${q}%`);
  if (category) query = query.eq("category", category);

  const [{ data: products }, { data: catRows }] = await Promise.all([
    query,
    supabase.from("product_categories").select("name, color, sort_order").order("sort_order"),
  ]);

  const colorByName: Record<string, string> = {};
  for (const c of catRows ?? []) colorByName[c.name] = c.color ?? "";
  const categoryOrder = (catRows ?? []).map((c) => c.name);

  // Group by category
  const grouped: Record<string, typeof products> = {};
  if (products) {
    for (const p of products) {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category]!.push(p);
    }
  }

  // 카테고리 관리 순서대로 그룹 표시 (등록된 순서) + 미등록 카테고리는 뒤에
  const categories = [
    ...categoryOrder.filter((name) => grouped[name]),
    ...Object.keys(grouped).filter((name) => !categoryOrder.includes(name)),
  ];

  return (
    <div className="space-y-6">
      <ListPageHeader title="제품 관리" count={products?.length} createHref="/admin/products/new" createLabel="새 제품 등록" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchFilterBar
          searchPlaceholder="제품명 검색..."
          filters={[
            {
              key: "category",
              label: "전체 카테고리",
              options: categoryOrder.map((name) => ({ value: name, label: name })),
            },
          ]}
        />
        <Link
          href="/admin/categories"
          className="text-[13px] font-semibold px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:text-brand-navy hover:border-brand-navy/30 transition-colors whitespace-nowrap"
        >
          카테고리 관리
        </Link>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#category-${cat}`}
              className="text-[13px] font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:text-brand-navy hover:border-brand-navy/30 transition-colors"
            >
              {cat}
            </a>
          ))}
        </div>
      )}

      {categories.length > 0 ? (
        categories.map((cat) => (
          <div key={cat} id={`category-${cat}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-20">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2.5">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[13px] font-bold ${colorByName[cat] || "bg-gray-100 text-gray-700"}`}
              >
                {cat}
              </span>
              <span className="text-[13px] text-gray-700 tabular-nums font-bold">{grouped[cat]?.length || 0}개</span>
              <span className="text-xs text-gray-500 ml-auto font-medium">← 좌측 핸들을 드래그해 순서 변경</span>
            </div>
            <SortableProductTable items={grouped[cat]!} />
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <EmptyState message="등록된 제품이 없습니다." description="새 제품을 등록하여 웹사이트에 제품을 소개하세요." icon={Package} action={{ label: "새 제품 등록", href: "/admin/products/new" }} />
        </div>
      )}
    </div>
  );
}
