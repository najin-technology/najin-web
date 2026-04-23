import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { HighlightText } from "@/components/admin/highlight-text";
import { CsvExportButton } from "@/components/admin/csv-export";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Phone, Mail, Tag } from "lucide-react";

export const metadata = { title: "고객 관리", description: "고객 통합 관리", robots: "noindex, nofollow" };

const STATUS_COLORS: Record<string, string> = {
  "리드": "bg-gray-100 text-gray-700",
  "검토중": "bg-blue-100 text-blue-700",
  "견적전송": "bg-amber-100 text-amber-700",
  "진행중": "bg-violet-100 text-violet-700",
  "완료": "bg-emerald-100 text-emerald-700",
  "보류": "bg-yellow-100 text-yellow-700",
  "거절": "bg-rose-100 text-rose-700",
};

const SOURCE_LABELS: Record<string, string> = {
  quote: "견적",
  application: "지원서",
  manual: "수동",
  client_delivery: "거래처",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; source?: string }>;
}) {
  const { q: searchQuery, status, source } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("customers")
    .select("id, company_name, display_name, primary_contact_name, primary_contact_phone, primary_contact_email, status, source, client_slug, tags, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (searchQuery)
    query = query.or(
      `company_name.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%,primary_contact_name.ilike.%${searchQuery}%`
    );
  if (status) query = query.eq("status", status);
  if (source) query = query.eq("source", source);

  const { data: customers } = await query;
  const list = customers || [];

  return (
    <div className="space-y-6">
      <ListPageHeader title="고객 관리" count={list.length} />

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchFilterBar
            searchPlaceholder="회사명/담당자 검색..."
            resultCount={list.length}
            filters={[
              {
                key: "status",
                label: "전체 상태",
                options: Object.keys(STATUS_COLORS).map((s) => ({ value: s, label: s })),
              },
              {
                key: "source",
                label: "전체 출처",
                options: Object.entries(SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l })),
              },
            ]}
          />
        </div>
        <CsvExportButton
          filename="customers"
          headers={["회사명", "담당자", "전화", "이메일", "상태", "출처", "태그", "등록일"]}
          rows={list.map((c) => [
            c.company_name || "",
            c.primary_contact_name || "",
            c.primary_contact_phone || "",
            c.primary_contact_email || "",
            c.status || "",
            SOURCE_LABELS[c.source] || c.source || "",
            (c.tags || []).join(", "),
            new Date(c.created_at).toLocaleDateString("ko-KR"),
          ])}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table className="admin-card-table">
          <TableHeader>
            <TableRow>
              <TableHead>회사 / 고객</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>출처</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>등록일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={Building2}
                    message="고객이 없습니다"
                    description="견적/지원서가 들어오면 자동으로 등록됩니다."
                  />
                </TableCell>
              </TableRow>
            ) : (
              list.map((c) => (
                <TableRow key={c.id} className="group hover:bg-gray-50/50">
                  <TableCell>
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="text-brand-blue hover:text-brand-blue-hover group-hover:underline font-medium transition-colors"
                    >
                      <HighlightText text={c.display_name || c.company_name} query={searchQuery} />
                    </Link>
                    {c.client_slug && (
                      <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                        거래처
                      </span>
                    )}
                  </TableCell>
                  <TableCell data-label="담당자" className="text-sm">
                    {c.primary_contact_name ? (
                      <HighlightText text={c.primary_contact_name} query={searchQuery} />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </TableCell>
                  <TableCell data-label="연락처" className="text-xs text-gray-500">
                    {c.primary_contact_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {c.primary_contact_phone}
                      </div>
                    )}
                    {c.primary_contact_email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {c.primary_contact_email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell data-label="출처">
                    <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded bg-gray-50">
                      {SOURCE_LABELS[c.source] || c.source}
                    </span>
                  </TableCell>
                  <TableCell data-label="상태">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell data-label="등록일" className="text-sm text-gray-500 tabular-nums">
                    {new Date(c.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {list.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400 tabular-nums flex items-center gap-3">
            <Tag className="w-3 h-3" />총 {list.length}명
          </div>
        )}
      </div>
    </div>
  );
}
