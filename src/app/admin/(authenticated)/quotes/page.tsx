import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";

export const metadata = { title: "견적 관리" };

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("quotes")
    .select("id, company_name, contact_name, processing_type, status, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (q) query = query.or(`company_name.ilike.%${q}%,contact_name.ilike.%${q}%`);
  if (status) query = query.eq("status", status);

  const { data: quotes } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-brand-navy">견적 관리</h1>
        {quotes && quotes.length > 0 && (
          <span className="text-xs text-gray-400 tabular-nums">{quotes.length}건</span>
        )}
      </div>

      <SearchFilterBar
        searchPlaceholder="회사명/담당자 검색..."
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
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
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
                <TableRow key={q.id}>
                  <TableCell>
                    <Link
                      href={`/admin/quotes/${q.id}`}
                      className="text-brand-blue hover:text-brand-blue-hover font-medium transition-colors"
                    >
                      {q.company_name}
                    </Link>
                  </TableCell>
                  <TableCell>{q.contact_name}</TableCell>
                  <TableCell>{q.processing_type}</TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} type="quote" />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(q.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState message="견적 요청이 없습니다." description="고객이 웹사이트에서 견적을 요청하면 여기에 표시됩니다." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
