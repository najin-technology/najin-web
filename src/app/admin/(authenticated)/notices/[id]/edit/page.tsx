import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NoticeForm } from "../../notice-form";

export const metadata = { title: "공지사항 수정" };

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
      <div className="flex items-center gap-3">
        <Link href="/admin/notices">
          <Button variant="ghost" size="icon-sm" className="rounded-lg" aria-label="뒤로 가기">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-brand-navy">공지사항 수정</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <NoticeForm mode="edit" notice={notice} />
      </div>
    </div>
  );
}
