import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { ProductForm } from "../product-form";

export const metadata = { title: "제품 등록" };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <DetailPageHeader backHref="/admin/products" title="새 제품 등록" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
