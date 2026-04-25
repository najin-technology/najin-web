import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { ListView } from "./_components/list-view";
import { BoardView } from "./_components/board-view";
import { ViewTabs } from "./_components/view-tabs";
import { WORK_ORDER_STATUSES } from "@/lib/status-colors";
import { escapePostgrestFilter } from "@/lib/format-date";

export const metadata = {
  title: "발주 관리",
  description: "발주 상태 추적 및 작업 지시 관리",
  robots: "noindex, nofollow",
};

type SP = { view?: string; q?: string; status?: string; type?: string };

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const { view: viewParam, q, status, type } = await searchParams;
  const view: "board" | "list" = viewParam === "board" ? "board" : "list";

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("work_orders")
    .select(
      "id, order_number, customer_name, product_name, processing_type, material, quantity, deadline, priority, status, assignee, quote_id, customer_id, created_at, status_started_at, status_completed_at"
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (q) {
    const safe = escapePostgrestFilter(q);
    if (safe) {
      query = query.or(
        `order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,product_name.ilike.%${safe}%`
      );
    }
  }
  if (status) query = query.eq("status", status);
  if (type) query = query.eq("processing_type", type);

  const { data: orders } = await query;
  const list = orders ?? [];

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="발주 관리"
        count={list.length}
        createHref="/admin/work-orders/new"
        createLabel="새 발주 작성"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewTabs active={view} />
        <p className="text-xs text-gray-400">
          견적 → 가공 → 출하 진행 상태를 한곳에서 관리합니다.
        </p>
      </div>

      <SearchFilterBar
        searchPlaceholder="발주번호 / 고객사 / 제품명 검색..."
        resultCount={list.length}
        filters={[
          {
            key: "status",
            label: "전체 상태",
            options: WORK_ORDER_STATUSES.map((s) => ({ value: s, label: s })),
          },
          {
            key: "type",
            label: "전체 가공유형",
            options: [
              { value: "우레탄", label: "우레탄" },
              { value: "합성수지", label: "합성수지" },
              { value: "CNC", label: "CNC" },
              { value: "금형", label: "금형" },
              { value: "EV", label: "EV" },
            ],
          },
        ]}
      />

      {view === "board" ? (
        <BoardView orders={list} />
      ) : (
        <ListView orders={list} searchQuery={q} />
      )}
    </div>
  );
}
