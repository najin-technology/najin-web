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
import { Users } from "lucide-react";

export const metadata = { title: "채용 관리", description: "채용 지원서 관리", robots: "noindex, nofollow" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q: searchQuery, status } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("applications")
    .select("id, name, phone, email, position, status, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (searchQuery) query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
  if (status) query = query.eq("status", status);

  const { data: applications } = await query;

  return (
    <div className="space-y-6">
      <ListPageHeader title="채용 관리" count={applications?.length} />

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchFilterBar
            searchPlaceholder="이름/이메일 검색..."
            resultCount={applications?.length}
            filters={[
              {
                key: "status",
                label: "전체 상태",
                options: [
                  { value: "서류검토", label: "서류검토" },
                  { value: "면접예정", label: "면접예정" },
                  { value: "합격", label: "합격" },
                  { value: "불합격", label: "불합격" },
                ],
              },
            ]}
          />
        </div>
        <CsvExportButton
          filename="applications"
          headers={["이름", "포지션", "연락처", "이메일", "상태", "지원일"]}
          rows={(applications || []).map((a) => [
            a.name || "",
            a.position || "",
            a.phone || "",
            a.email || "",
            a.status || "",
            new Date(a.created_at).toLocaleDateString("ko-KR"),
          ])}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table className="admin-card-table">
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>포지션</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>지원일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications && applications.length > 0 ? (
              applications.map((a) => (
                <TableRow key={a.id} className="group">
                  <TableCell>
                    <Link
                      href={`/admin/applications/${a.id}`}
                      className="text-brand-blue hover:text-brand-blue-hover group-hover:underline font-medium transition-colors"
                    >
                      <HighlightText text={a.name} query={searchQuery} />
                    </Link>
                  </TableCell>
                  <TableCell data-label="연락처">{a.phone || "-"}</TableCell>
                  <TableCell data-label="포지션"><HighlightText text={a.position || "-"} query={searchQuery} /></TableCell>
                  <TableCell data-label="상태">
                    <StatusBadge status={a.status} type="application" />
                  </TableCell>
                  <TableCell data-label="지원일" className="text-sm text-gray-500">
                    {new Date(a.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState message="지원서가 없습니다." description="구직자가 채용 지원서를 제출하면 여기에 표시됩니다." icon={Users} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {applications && applications.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400 tabular-nums">
            총 {applications.length}건
          </div>
        )}
      </div>
    </div>
  );
}
