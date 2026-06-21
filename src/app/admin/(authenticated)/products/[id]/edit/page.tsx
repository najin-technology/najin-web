import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { ProductForm } from "../../product-form";

export const metadata = { title: "제품 수정", description: "제품 정보 수정", robots: "noindex, nofollow" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const [{ data: product }, { data: cats }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name_ko, name_en, description_ko, description_en, category, image_urls, is_active"
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single(),
    supabase.from("product_categories").select("name").order("sort_order"),
  ]);

  if (!product) notFound();

  const categories = (cats ?? []).map((c) => c.name);

  return (
    <div className="space-y-6">
      <DetailPageHeader backHref="/admin/products" title="제품 수정" />

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 overflow-hidden">
        <ProductForm mode="edit" product={product} categories={categories} />
      </div>
    </div>
  );
}
