import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { JobPostingForm } from "../../job-posting-form";

export const metadata = { title: "공고 수정", description: "채용공고 수정", robots: "noindex, nofollow" };

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
      <DetailPageHeader backHref="/admin/job-postings" title="공고 수정" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <JobPostingForm mode="edit" posting={posting} />
      </div>
    </div>
  );
}
