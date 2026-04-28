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
import { SortableClientsPanel } from "./sortable-clients";
import { CUSTOMER_STATUS_STYLES } from "@/lib/status-colors";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata = { title: "고객 관리", description: "고객 통합 관리", robots: "noindex, nofollow" };

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

  // Fetch client-type customers for the sortable grid panel (uses extra columns).
  // Only show when NOT filtered (full list) — otherwise the filter intent is unclear.
  const showClientsPanel = !searchQuery && !status && !source;
  let clientRows: Array<{
    id: string;
    client_slug: string | null;
    company_name: string;
    name_en: string | null;
    logo_url: string | null;
    needs_dark_bg: boolean;
    display_category: string | null;
  }> = [];
  if (showClientsPanel) {
    const { data } = await supabase
      .from("customers")
      .select("id, client_slug, company_name, name_en, logo_url, needs_dark_bg, display_category, display_order")
      .not("client_slug", "is", null)
      .is("deleted_at", null)
      .order("display_order", { ascending: true });
    clientRows = (data || []).map((r) => ({
      id: r.id,
      client_slug: r.client_slug,
      company_name: r.company_name,
      name_en: r.name_en,
      logo_url: r.logo_url,
      needs_dark_bg: !!r.needs_dark_bg,
      display_category: r.display_category,
    }));
  }

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="고객 관리"
        count={list.length}
        createHref="/admin/customers/new"
        createLabel="새 고객 등록"
      />

      {showClientsPanel && clientRows.length > 0 && (
        <SortableClientsPanel items={clientRows} />
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchFilterBar
            searchPlaceholder="회사명/담당자 검색..."
            resultCount={list.length}
            filters={[
              {
                key: "status",
                label: "전체 상태",
                options: Object.keys(CUSTOMER_STATUS_STYLES).map((s) => ({ value: s, label: s })),
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
                      <span className="ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        거래처
                      </span>
                    )}
                  </TableCell>
                  <TableCell data-label="담당자" className="text-sm font-medium">
                    {c.primary_contact_name ? (
                      <HighlightText text={c.primary_contact_name} query={searchQuery} />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell data-label="연락처" className="text-[13px] text-gray-700 font-medium">
                    {c.primary_contact_phone && (
                      <div className="flex items-center gap-1.5 tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        {c.primary_contact_phone}
                      </div>
                    )}
                    {c.primary_contact_email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        {c.primary_contact_email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell data-label="출처">
                    <span className="text-[13px] text-gray-700 px-2 py-0.5 rounded bg-gray-100 font-semibold">
                      {SOURCE_LABELS[c.source] || c.source}
                    </span>
                  </TableCell>
                  <TableCell data-label="상태">
                    <StatusBadge status={c.status} type="customer" />
                  </TableCell>
                  <TableCell data-label="등록일" className="text-sm text-gray-600 tabular-nums font-medium">
                    {new Date(c.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {list.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-100 text-[13px] text-gray-600 tabular-nums flex items-center gap-2 font-medium">
            <Tag className="w-3.5 h-3.5" />총 <span className="font-bold text-brand-charcoal">{list.length}</span>명
          </div>
        )}
      </div>
    </div>
  );
}
