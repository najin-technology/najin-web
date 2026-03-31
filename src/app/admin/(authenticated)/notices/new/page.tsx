import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { NoticeForm } from "../notice-form";

export const metadata = { title: "새 공지 작성", description: "새 공지 작성", robots: "noindex, nofollow" };

export default function NewNoticePage() {
  return (
    <div className="space-y-6">
      <DetailPageHeader backHref="/admin/notices" title="새 공지 작성" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <NoticeForm mode="create" />
      </div>
    </div>
  );
}
