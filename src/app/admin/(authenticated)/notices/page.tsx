import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil } from "lucide-react";
import { NoticePublishToggle } from "./notice-toggle";
import { NoticeDeleteButton } from "./notice-delete-button";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { HighlightText } from "@/components/admin/highlight-text";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export const metadata = { title: "공지사항", description: "공지사항 관리", robots: "noindex, nofollow" };

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; published?: string }>;
}) {
  const { q: searchQuery, published } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("notices")
    .select("id, title_ko, content_ko, is_published, published_at, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (searchQuery) query = query.ilike("title_ko", `%${searchQuery}%`);
  if (published === "true") query = query.eq("is_published", true);
  if (published === "false") query = query.eq("is_published", false);

  const { data: notices } = await query;

  return (
    <div className="space-y-6">
      <ListPageHeader title="공지사항" count={notices?.length} createHref="/admin/notices/new" createLabel="새 공지 작성" />

      <SearchFilterBar
        searchPlaceholder="제목 검색..."
        resultCount={notices?.length}
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
        <Table className="admin-card-table">
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead className="hidden md:table-cell">미리보기</TableHead>
              <TableHead>공개</TableHead>
              <TableHead>게시일</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices && notices.length > 0 ? (
              notices.map((n) => (
                <TableRow key={n.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium"><HighlightText text={n.title_ko} query={searchQuery} /></TableCell>
                  <TableCell className="text-xs text-gray-400 max-w-[200px] truncate hidden md:table-cell">
                    {stripHtml(n.content_ko || "").slice(0, 60) || "—"}
                  </TableCell>
                  <TableCell data-label="공개">
                    <NoticePublishToggle
                      noticeId={n.id}
                      isPublished={n.is_published}
                    />
                  </TableCell>
                  <TableCell data-label="게시일" className="text-sm text-gray-500">
                    {n.published_at
                      ? new Date(n.published_at).toLocaleDateString("ko-KR")
                      : "-"}
                  </TableCell>
                  <TableCell data-label="작성일" className="text-sm text-gray-500">
                    {new Date(n.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell data-label="관리">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/notices/${n.id}/edit`}>
                        <Button variant="ghost" size="icon-sm" aria-label="편집">
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
                <TableCell colSpan={6}>
                  <EmptyState
                    message="공지사항이 없습니다."
                    description="새 공지를 작성하여 웹사이트에 소식을 알려보세요."
                    icon={Megaphone}
                    action={{ label: "새 공지 작성", href: "/admin/notices/new" }}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {notices && notices.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400 tabular-nums">
            총 {notices.length}건
          </div>
        )}
      </div>
    </div>
  );
}
