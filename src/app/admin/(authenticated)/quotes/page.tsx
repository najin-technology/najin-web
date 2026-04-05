import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPageHeader } from "@/components/admin/list-page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { HighlightText } from "@/components/admin/highlight-text";
import { CsvExportButton } from "@/components/admin/csv-export";
import { FileText } from "lucide-react";

export const metadata = { title: "견적 관리", description: "고객 견적 요청 관리", robots: "noindex, nofollow" };

function formatElapsed(createdAt: string, status: string) {
  const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / 3600000);
  const isPending = status === "접수";
  if (!isPending) return { text: new Date(createdAt).toLocaleDateString("ko-KR"), overdue: false, pending: false };
  const text = hours < 1 ? "방금" : hours < 24 ? `${hours}시간 전` : `${Math.floor(hours / 24)}일 ${hours % 24}시간 전`;
  return { text, overdue: hours >= 24, pending: true };
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>;
}) {
  const { q: searchQuery, status, type } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("quotes")
    .select("id, company_name, contact_name, phone, email, processing_type, status, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (searchQuery) query = query.or(`company_name.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%`);
  if (status) query = query.eq("status", status);
  if (type) query = query.eq("processing_type", type);

  const { data: quotes } = await query;

  return (
    <div className="space-y-6">
      <ListPageHeader title="견적 관리" count={quotes?.length} />

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchFilterBar
            searchPlaceholder="회사명/담당자 검색..."
            resultCount={quotes?.length}
            filters={[
              {
                key: "status",
                label: "전체 상태",
                options: [
                  { value: "접수", label: "접수" },
                  { value: "검토중", label: "검토중" },
                  { value: "견적발송", label: "견적발송" },
                  { value: "완료", label: "완료" },
                ],
              },
              {
                key: "type",
                label: "전체 유형",
                options: [
                  { value: "콜백요청", label: "📞 콜백요청" },
                  { value: "우레탄 성형", label: "우레탄 성형" },
                  { value: "합성수지 가공", label: "합성수지 가공" },
                  { value: "CNC 정밀가공", label: "CNC 정밀가공" },
                  { value: "금형 제작", label: "금형 제작" },
                  { value: "EV 부품", label: "EV 부품" },
                ],
              },
            ]}
          />
        </div>
        <CsvExportButton
          filename="quotes"
          headers={["회사명", "담당자", "연락처", "이메일", "가공종류", "상태", "접수일"]}
          rows={(quotes || []).map((q) => [
            q.company_name || "",
            q.contact_name || "",
            q.phone || "",
            q.email || "",
            q.processing_type || "",
            q.status || "",
            new Date(q.created_at).toLocaleDateString("ko-KR"),
          ])}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table className="admin-card-table">
          <TableHeader>
            <TableRow>
              <TableHead>회사명</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>가공종류</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>접수일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes && quotes.length > 0 ? (
              quotes.map((q) => (
                <TableRow key={q.id} className="group hover:bg-gray-50/50">
                  <TableCell>
                    <Link
                      href={`/admin/quotes/${q.id}`}
                      className="text-brand-blue hover:text-brand-blue-hover group-hover:underline font-medium transition-colors"
                    >
                      <HighlightText text={q.company_name} query={searchQuery} />
                    </Link>
                  </TableCell>
                  <TableCell data-label="담당자"><HighlightText text={q.contact_name} query={searchQuery} /></TableCell>
                  <TableCell data-label="가공종류">
                    {q.processing_type === "콜백요청" ? (
                      <span className="inline-flex items-center gap-1 text-purple-700 font-medium">📞 콜백</span>
                    ) : (
                      q.processing_type
                    )}
                  </TableCell>
                  <TableCell data-label="상태">
                    <StatusBadge status={q.status} type="quote" />
                  </TableCell>
                  <TableCell data-label="접수일" className="text-sm">
                    {(() => {
                      const e = formatElapsed(q.created_at, q.status);
                      if (!e.pending) return <span className="text-gray-500">{e.text}</span>;
                      return (
                        <span className={e.overdue ? "text-red-600 font-medium" : "text-amber-600"}>
                          {e.text}
                          {e.overdue && <span className="ml-1 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">초과</span>}
                        </span>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState message="견적 요청이 없습니다." description="고객이 웹사이트에서 견적을 요청하면 여기에 표시됩니다." icon={FileText} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {quotes && quotes.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400 tabular-nums">
            총 {quotes.length}건
          </div>
        )}
      </div>
    </div>
  );
}
