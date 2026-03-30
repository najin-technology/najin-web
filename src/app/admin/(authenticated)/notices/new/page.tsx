import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NoticeForm } from "../notice-form";

export const metadata = { title: "공지사항 작성" };

export default function NewNoticePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/notices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">새 공지 작성</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <NoticeForm mode="create" />
      </div>
    </div>
  );
}
