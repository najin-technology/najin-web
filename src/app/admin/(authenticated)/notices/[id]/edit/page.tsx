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
      <div className="flex items-center gap-4">
        <Link href="/admin/notices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">공지사항 수정</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <NoticeForm mode="edit" notice={notice} />
      </div>
    </div>
  );
}
