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
import { JobPostingActiveToggle } from "./job-posting-toggle";
import { JobPostingDeleteButton } from "./job-posting-delete-button";

export const metadata = { title: "채용공고" };

export default async function JobPostingsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: postings } = await supabase
    .from("job_postings")
    .select(
      "id, title_ko, department, employment_type, is_active, deadline, created_at"
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">채용공고</h1>
        <Link href="/admin/job-postings/new">
          <Button className="bg-[#1B2A4A] hover:bg-[#2D3748] text-white">
            <Plus className="w-4 h-4 mr-1" />
            새 공고 작성
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
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
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title_ko}</TableCell>
                  <TableCell>{p.department || "-"}</TableCell>
                  <TableCell>{p.employment_type || "-"}</TableCell>
                  <TableCell>
                    <JobPostingActiveToggle
                      postingId={p.id}
                      isActive={p.is_active}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {p.deadline
                      ? new Date(p.deadline).toLocaleDateString("ko-KR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/job-postings/${p.id}/edit`}>
                        <Button variant="ghost" size="icon-sm">
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
                  <EmptyState message="채용공고가 없습니다." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
