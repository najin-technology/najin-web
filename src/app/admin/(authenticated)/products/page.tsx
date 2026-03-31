import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Pencil } from "lucide-react";
import { ProductActiveToggle } from "./product-toggle";
import { ProductDeleteButton } from "./product-delete-button";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";

const CATEGORY_LABELS: Record<string, string> = {
  우레탄: "우레탄",
  합성수지: "합성수지",
  CNC: "CNC",
  금형: "금형",
  EV: "EV",
};

const CATEGORY_COLORS: Record<string, string> = {
  우레탄: "bg-orange-100 text-orange-800",
  합성수지: "bg-purple-100 text-purple-800",
  CNC: "bg-blue-100 text-blue-800",
  금형: "bg-green-100 text-green-800",
  EV: "bg-teal-100 text-teal-800",
};

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

  const { data: products } = await query;

  // Group by category
  const grouped: Record<string, typeof products> = {};
  if (products) {
    for (const p of products) {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category]!.push(p);
    }
  }

  const categories = Object.keys(grouped);

  return (
    <div className="space-y-6">
      <ListPageHeader title="제품 관리" count={products?.length} createHref="/admin/products/new" createLabel="새 제품 등록" />

      <SearchFilterBar
        searchPlaceholder="제품명 검색..."
        filters={[
          {
            key: "category",
            label: "전체 카테고리",
            options: [
              { value: "우레탄", label: "우레탄" },
              { value: "합성수지", label: "합성수지" },
              { value: "CNC", label: "CNC" },
              { value: "금형", label: "금형" },
              { value: "EV", label: "EV" },
            ],
          },
        ]}
      />

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#category-${cat}`}
              className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:text-brand-navy hover:border-brand-navy/30 transition-colors"
            >
              {CATEGORY_LABELS[cat] || cat}
            </a>
          ))}
        </div>
      )}

      {categories.length > 0 ? (
        categories.map((cat) => (
          <div key={cat} id={`category-${cat}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-20">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2.5">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-700"}`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </span>
              <span className="text-xs text-gray-400 tabular-nums">{grouped[cat]?.length || 0}개</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제품명</TableHead>
                  <TableHead>정렬순서</TableHead>
                  <TableHead>활성</TableHead>
                  <TableHead className="w-[100px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped[cat]!.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-300" />
                        </div>
                        <span className="font-medium">{p.name_ko}</span>
                      </div>
                    </TableCell>
                    <TableCell>{p.sort_order}</TableCell>
                    <TableCell>
                      <ProductActiveToggle
                        productId={p.id}
                        isActive={p.is_active}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Button variant="ghost" size="icon-sm" aria-label="편집">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <ProductDeleteButton productId={p.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
