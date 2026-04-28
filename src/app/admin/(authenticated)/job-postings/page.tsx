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
import { Briefcase, Pencil } from "lucide-react";
import { JobPostingActiveToggle } from "./job-posting-toggle";
import { JobPostingDeleteButton } from "./job-posting-delete-button";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";

export const metadata = { title: "채용공고", description: "채용공고 관리", robots: "noindex, nofollow" };

export default async function JobPostingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; active?: string }>;
}) {
  const { q, active } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("job_postings")
    .select("id, title_ko, department, employment_type, is_active, deadline, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("title_ko", `%${q}%`);
  if (active === "true") query = query.eq("is_active", true);
  if (active === "false") query = query.eq("is_active", false);

  const { data: postings } = await query;

  return (
    <div className="space-y-6">
      <ListPageHeader title="채용공고" count={postings?.length} createHref="/admin/job-postings/new" createLabel="새 공고 작성" />

      <SearchFilterBar
        searchPlaceholder="공고 제목 검색..."
        resultCount={postings?.length}
        filters={[
          {
            key: "active",
            label: "전체 상태",
            options: [
              { value: "true", label: "활성" },
              { value: "false", label: "비활성" },
            ],
          },
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table className="admin-card-table">
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>부서</TableHead>
              <TableHead>고용형태</TableHead>
              <TableHead>활성</TableHead>
              <TableHead>마감일</TableHead>
              <TableHead className="w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postings && postings.length > 0 ? (
              postings.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-semibold text-brand-charcoal">{p.title_ko}</TableCell>
                  <TableCell data-label="부서" className="font-medium">{p.department || "-"}</TableCell>
                  <TableCell data-label="고용형태" className="font-medium">{p.employment_type || "-"}</TableCell>
                  <TableCell data-label="활성">
                    <JobPostingActiveToggle
                      postingId={p.id}
                      isActive={p.is_active}
                    />
                  </TableCell>
                  <TableCell data-label="마감일" className="text-sm text-gray-600 font-medium tabular-nums">
                    {p.deadline
                      ? new Date(p.deadline).toLocaleDateString("ko-KR")
                      : "-"}
                  </TableCell>
                  <TableCell data-label="관리">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/job-postings/${p.id}/edit`}>
                        <Button variant="ghost" size="icon-sm" aria-label="편집">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <JobPostingDeleteButton postingId={p.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState message="채용공고가 없습니다." description="새 채용공고를 작성하여 인재를 모집하세요." icon={Briefcase} action={{ label: "새 공고 작성", href: "/admin/job-postings/new" }} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {postings && postings.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-100 text-[13px] text-gray-500 tabular-nums font-medium">
            총 {postings.length}건
          </div>
        )}
      </div>
    </div>
  );
}
