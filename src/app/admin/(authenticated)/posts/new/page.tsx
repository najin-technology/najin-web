import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { PostForm } from "../post-form";

export const metadata = { title: "새 포스트 작성", description: "새 포스트 작성", robots: "noindex, nofollow" };

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <DetailPageHeader backHref="/admin/posts" title="새 포스트 작성" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
