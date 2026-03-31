import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { JobPostingForm } from "../../job-posting-form";

export const metadata = { title: "채용공고 수정" };

export default async function EditJobPostingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: posting } = await supabase
    .from("job_postings")
    .select(
      "id, title_ko, title_en, department, employment_type, description_ko, description_en, requirements_ko, requirements_en, benefits_ko, benefits_en, is_active, deadline"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!posting) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/job-postings">
          <Button variant="ghost" size="icon-sm" className="rounded-lg" aria-label="뒤로 가기">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-brand-navy">채용공고 수정</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <JobPostingForm mode="edit" posting={posting} />
      </div>
    </div>
  );
}
