import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { NoticeForm } from "../../notice-form";

export const metadata = { title: "공지사항 수정", description: "공지사항 수정", robots: "noindex, nofollow" };

export default async function EditNoticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: notice } = await supabase
    .from("notices")
    .select("id, title_ko, title_en, content_ko, content_en, is_published")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!notice) notFound();

  return (
    <div className="space-y-6">
      <DetailPageHeader backHref="/admin/notices" title="공지사항 수정" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <NoticeForm mode="edit" notice={notice} />
      </div>
    </div>
  );
}
