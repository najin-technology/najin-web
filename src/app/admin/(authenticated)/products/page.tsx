import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
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
  우레탄: "bg-orange-100 text-orange-700",
  합성수지: "bg-purple-100 text-purple-700",
  CNC: "bg-blue-100 text-blue-700",
  금형: "bg-green-100 text-green-700",
  EV: "bg-teal-100 text-teal-700",
};

export const metadata = { title: "제품 관리" };

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">제품 관리</h1>
        <Link href="/admin/products/new">
          <Button className="bg-[#1B2A4A] hover:bg-[#2D3748] text-white">
            <Plus className="w-4 h-4 mr-1" />
            새 제품 등록
          </Button>
        </Link>
      </div>

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

      {categories.length > 0 ? (
        categories.map((cat) => (
          <div key={cat} className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-700"}`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </span>
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
                    <TableCell className="font-medium">{p.name_ko}</TableCell>
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
                          <Button variant="ghost" size="icon-sm">
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
          <EmptyState message="등록된 제품이 없습니다." />
        </div>
      )}
    </div>
  );
}
