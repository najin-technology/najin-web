import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { PostForm } from "../../post-form";

export const metadata = { title: "포트폴리오 수정", description: "포트폴리오 수정", robots: "noindex, nofollow" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id, slug, title_ko, title_en, content_ko, content_en, excerpt_ko, excerpt_en, category, thumbnail_url, tags, is_published")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <DetailPageHeader backHref="/admin/posts" title="포트폴리오 수정" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <PostForm mode="edit" post={post} />
      </div>
    </div>
  );
}
