import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { JobPostingForm } from "../job-posting-form";

export const metadata = { title: "채용공고 작성" };

export default function NewJobPostingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/job-postings">
          <Button variant="ghost" size="icon-sm" className="rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-[#1B2A4A]">새 채용공고 작성</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <JobPostingForm mode="create" />
      </div>
    </div>
  );
}
