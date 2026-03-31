import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EmptyState } from "@/components/admin/empty-state";
import { FileText } from "lucide-react";
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
import { NoticePublishToggle } from "./notice-toggle";
import { NoticeDeleteButton } from "./notice-delete-button";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";

export const metadata = { title: "공지사항" };

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; published?: string }>;
}) {
  const { q, published } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("notices")
    .select("id, title_ko, is_published, published_at, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("title_ko", `%${q}%`);
  if (published === "true") query = query.eq("is_published", true);
  if (published === "false") query = query.eq("is_published", false);

  const { data: notices } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[#1B2A4A]">공지사항</h1>
          {notices && notices.length > 0 && (
            <span className="text-xs text-gray-400 tabular-nums">{notices.length}건</span>
          )}
        </div>
        <Link href="/admin/notices/new">
          <Button className="bg-[#1B2A4A] hover:bg-[#243456] text-white gap-1.5 rounded-lg shadow-sm">
            <Plus className="w-4 h-4" />
            새 공지 작성
          </Button>
        </Link>
      </div>

      <SearchFilterBar
        searchPlaceholder="제목 검색..."
        filters={[
          {
            key: "published",
            label: "전체 상태",
            options: [
              { value: "true", label: "공개" },
              { value: "false", label: "비공개" },
            ],
          },
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>공개</TableHead>
              <TableHead>게시일</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices && notices.length > 0 ? (
              notices.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.title_ko}</TableCell>
                  <TableCell>
                    <NoticePublishToggle
                      noticeId={n.id}
                      isPublished={n.is_published}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {n.published_at
                      ? new Date(n.published_at).toLocaleDateString("ko-KR")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(n.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/notices/${n.id}/edit`}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <NoticeDeleteButton noticeId={n.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    message="공지사항이 없습니다."
                    icon={FileText}
                    action={{ label: "새 공지 작성", href: "/admin/notices/new" }}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
