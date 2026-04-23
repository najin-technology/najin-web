import { requireAdmin } from "@/lib/auth";
import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { NewCustomerForm } from "./client";

export const metadata = { title: "새 고객 등록", robots: "noindex, nofollow" };

export default async function NewCustomerPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <DetailPageHeader title="새 고객 등록" backHref="/admin/customers" />
      <div className="max-w-2xl">
        <NewCustomerForm />
      </div>
    </div>
  );
}
