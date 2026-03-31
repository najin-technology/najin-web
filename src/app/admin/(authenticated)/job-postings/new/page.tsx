import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { JobPostingForm } from "../job-posting-form";

export const metadata = { title: "채용공고 작성" };

export default function NewJobPostingPage() {
  return (
    <div className="space-y-6">
      <DetailPageHeader backHref="/admin/job-postings" title="새 공고 작성" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <JobPostingForm mode="create" />
      </div>
    </div>
  );
}
