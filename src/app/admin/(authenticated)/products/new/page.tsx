import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { ProductForm } from "../product-form";

export const metadata = { title: "새 제품 등록", description: "새 제품 등록", robots: "noindex, nofollow" };

export default async function NewProductPage() {
  const supabase = await createSupabaseServerClient();
  const { data: cats } = await supabase
    .from("product_categories")
    .select("name")
    .order("sort_order");
  const categories = (cats ?? []).map((c) => c.name);

  return (
    <div className="space-y-6">
      <DetailPageHeader backHref="/admin/products" title="새 제품 등록" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <ProductForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
