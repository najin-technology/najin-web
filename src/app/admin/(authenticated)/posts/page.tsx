import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { BookOpen, Pencil, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PostPublishToggle } from "./post-toggle";
import { PostDeleteButton } from "./post-delete-button";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { HighlightText } from "@/components/admin/highlight-text";
import { getPostsContribution } from "@/lib/analytics/queries";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export const metadata = { title: "제작사례", description: "제작사례 관리", robots: "noindex, nofollow" };

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; published?: string; category?: string }>;
}) {
  const { q: searchQuery, published, category } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("posts")
    .select("id, slug, title_ko, content_ko, excerpt_ko, category, thumbnail_url, tags, is_published, published_at, original_date, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (searchQuery) query = query.ilike("title_ko", `%${searchQuery}%`);
  if (published === "true") query = query.eq("is_published", true);
  if (published === "false") query = query.eq("is_published", false);
  if (category) query = query.eq("category", category);

  const [{ data: posts }, contribution] = await Promise.all([
    query,
    getPostsContribution(supabase),
  ]);
  const contribBySlug = new Map(contribution.map((c) => [c.slug, c]));

  return (
    <div className="space-y-6">
      <ListPageHeader title="제작사례" count={posts?.length} createHref="/admin/posts/new" createLabel="새 제작사례 작성" />

      <SearchFilterBar
        searchPlaceholder="제목 검색..."
        resultCount={posts?.length}
        filters={[
          {
            key: "published",
            label: "전체 상태",
            options: [
              { value: "true", label: "공개" },
              { value: "false", label: "비공개" },
            ],
          },
          {
            key: "category",
            label: "전체 카테고리",
            options: [
              { value: "제작사례", label: "제작사례" },
              { value: "제품", label: "제품" },
            ],
          },
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table className="admin-card-table">
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead className="hidden md:table-cell">카테고리</TableHead>
              <TableHead className="hidden xl:table-cell">미리보기</TableHead>
              <TableHead className="hidden lg:table-cell w-[140px]">조회 · 견적 기여</TableHead>
              <TableHead>공개</TableHead>
              <TableHead>원본일자</TableHead>
              <TableHead className="w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts && posts.length > 0 ? (
              posts.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">
                    <HighlightText text={p.title_ko} query={searchQuery} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-semibold bg-gray-100 text-gray-700">
                      {p.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-[13px] text-gray-500 max-w-[200px] truncate hidden xl:table-cell">
                    {p.excerpt_ko || stripHtml(p.content_ko || "").slice(0, 60) || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell" data-label="조회·기여">
                    {(() => {
                      const c = contribBySlug.get(p.slug);
                      if (!c || c.sessions_viewed === 0) {
                        return <span className="text-[13px] text-gray-400">—</span>;
                      }
                      return (
                        <div className="flex items-center gap-3 text-[13px]">
                          <span className="inline-flex items-center gap-1 text-gray-600 tabular-nums font-medium">
                            <Eye className="w-3.5 h-3.5" />
                            {c.sessions_viewed.toLocaleString("ko-KR")}
                          </span>
                          {c.quotes_from_viewers > 0 && (
                            <span className="inline-flex items-center gap-1 text-brand-copper font-bold tabular-nums">
                              <TrendingUp className="w-3.5 h-3.5" />
                              {c.quotes_from_viewers}건
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell data-label="공개">
                    <PostPublishToggle
                      postId={p.id}
                      isPublished={p.is_published}
                    />
                  </TableCell>
                  <TableCell data-label="원본일자" className="text-sm text-gray-500">
                    {p.original_date
                      ? new Date(p.original_date).toLocaleDateString("ko-KR")
                      : p.created_at
                        ? new Date(p.created_at).toLocaleDateString("ko-KR")
                        : "-"}
                  </TableCell>
                  <TableCell data-label="관리">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/posts/${p.id}/edit`}>
                        <Button variant="ghost" size="icon-sm" aria-label="편집">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <PostDeleteButton postId={p.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    message="제작사례가 없습니다."
                    description="새 제작사례를 추가하여 제작사례를 소개해보세요."
                    icon={BookOpen}
                    action={{ label: "새 제작사례 작성", href: "/admin/posts/new" }}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {posts && posts.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-100 text-[13px] text-gray-500 tabular-nums font-medium">
            총 {posts.length}건
          </div>
        )}
      </div>
    </div>
  );
}
