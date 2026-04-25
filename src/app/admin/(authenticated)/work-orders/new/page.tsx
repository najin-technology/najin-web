import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { NewWorkOrderForm } from "./new-form";

export const metadata = { title: "새 발주 작성", robots: "noindex, nofollow" };

export default async function NewWorkOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let prefill: {
    quote_id: string | null;
    customer_id: string | null;
    customer_name: string;
    contact_name: string | null;
    phone: string | null;
    product_name: string;
    processing_type: string | null;
    material: string | null;
    quantity: string | null;
    deadline: string | null;
    description: string | null;
  } = {
    quote_id: null,
    customer_id: null,
    customer_name: "",
    contact_name: null,
    phone: null,
    product_name: "",
    processing_type: null,
    material: null,
    quantity: null,
    deadline: null,
    description: null,
  };

  if (from) {
    const { data: quote } = await supabase
      .from("quotes")
      .select(
        "id, company_name, contact_name, phone, processing_type, material, quantity, deadline, description"
      )
      .eq("id", from)
      .is("deleted_at", null)
      .maybeSingle();

    if (!quote) notFound();

    // 이미 발주가 존재하면 그쪽으로
    const { data: existing } = await supabase
      .from("work_orders")
      .select("id")
      .eq("quote_id", from)
      .is("deleted_at", null)
      .maybeSingle();
    if (existing) redirect(`/admin/work-orders/${existing.id}`);

    prefill = {
      quote_id: quote.id,
      customer_id: null,
      customer_name: quote.company_name,
      contact_name: quote.contact_name,
      phone: quote.phone,
      product_name: quote.processing_type ?? "제품명을 입력하세요",
      processing_type: quote.processing_type,
      material: quote.material,
      quantity: quote.quantity,
      deadline: quote.deadline,
      description: quote.description,
    };
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/admin/work-orders"
        title="새 발주 작성"
        subtitle={from ? "견적에서 변환 — 정보가 자동으로 채워졌습니다" : "직접 입력"}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-3xl">
        <NewWorkOrderForm prefill={prefill} />
      </div>
    </div>
  );
}
