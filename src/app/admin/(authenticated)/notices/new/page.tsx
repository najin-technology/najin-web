import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NoticeForm } from "../notice-form";

export const metadata = { title: "공지사항 작성" };

export default function NewNoticePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/notices">
          <Button variant="ghost" size="icon-sm" className="rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-[#1B2A4A]">새 공지 작성</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <NoticeForm mode="create" />
      </div>
    </div>
  );
}
