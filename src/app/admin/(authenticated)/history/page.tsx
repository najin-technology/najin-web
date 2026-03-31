import { createSupabaseServerClient } from "@/lib/supabase-server";
import { HistoryAddForm } from "./history-form";
import { HistoryTable } from "./history-table";

export const metadata = { title: "연혁 관리" };

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient();

  const { data: items } = await supabase
    .from("history_items")
    .select("id, year, month, description_ko, description_en, sort_order")
    .order("year", { ascending: false })
    .order("month", { ascending: false, nullsFirst: false })
    .order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-[#1B2A4A]">연혁 관리</h1>

      <HistoryAddForm />

      <HistoryTable items={items || []} />
    </div>
  );
}
