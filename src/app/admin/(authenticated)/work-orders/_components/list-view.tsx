import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/admin/empty-state";
import { HighlightText } from "@/components/admin/highlight-text";
import { StatusBadge } from "@/components/admin/status-badge";
import { ClipboardList } from "lucide-react";
import { dDayLabel } from "@/lib/format-date";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  processing_type: string | null;
  material: string | null;
  quantity: string | null;
  deadline: string | null;
  priority: string;
  status: string;
  assignee: string | null;
  created_at: string;
};

function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    "낮음": "bg-gray-50 text-gray-600",
    "보통": "bg-blue-50 text-blue-700",
    "높음": "bg-rose-50 text-rose-700 font-bold",
  };
  const cls = map[priority] ?? map["보통"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      {priority}
    </span>
  );
}

function dDayBadge(deadline: string | null, status: string) {
  if (!deadline) return <span className="text-gray-400">—</span>;
  const closed = status === "완료" || status === "출하";
  const dd = dDayLabel(deadline);
  const dateStr = new Date(deadline).toLocaleDateString("ko-KR");
  if (closed) {
    return <span className="text-xs tabular-nums text-gray-400">{dateStr}</span>;
  }
  const toneCls =
    dd.tone === "overdue"
      ? "bg-rose-50 text-rose-700 font-bold"
      : dd.tone === "urgent"
        ? "bg-amber-50 text-amber-700 font-bold"
        : dd.tone === "soon"
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "bg-gray-50 text-gray-600 font-semibold";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] tabular-nums ${toneCls}`}>
        {dd.label}
      </span>
      <span className="text-[13px] tabular-nums text-gray-600">{dateStr}</span>
    </span>
  );
}

export function ListView({
  orders,
  searchQuery,
}: {
  orders: Order[];
  searchQuery?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table className="admin-card-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">발주번호</TableHead>
            <TableHead>고객사</TableHead>
            <TableHead>제품명</TableHead>
            <TableHead className="hidden md:table-cell">가공유형</TableHead>
            <TableHead className="hidden lg:table-cell">수량</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="hidden lg:table-cell">우선순위</TableHead>
            <TableHead>마감일</TableHead>
            <TableHead className="hidden xl:table-cell">담당자</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((o) => (
              <TableRow key={o.id} className="hover:bg-gray-50/50 cursor-pointer">
                <TableCell className="font-mono text-[13px] text-brand-copper font-bold" data-label="발주번호">
                  <Link href={`/admin/work-orders/${o.id}`} className="block">
                    {o.order_number}
                  </Link>
                </TableCell>
                <TableCell className="font-semibold text-brand-charcoal" data-label="고객사">
                  <Link href={`/admin/work-orders/${o.id}`} className="block">
                    <HighlightText text={o.customer_name} query={searchQuery} />
                  </Link>
                </TableCell>
                <TableCell data-label="제품명" className="font-medium">
                  <Link href={`/admin/work-orders/${o.id}`} className="block">
                    <HighlightText text={o.product_name} query={searchQuery} />
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-gray-600 font-medium" data-label="가공유형">
                  {o.processing_type || "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-gray-600 font-medium tabular-nums" data-label="수량">
                  {o.quantity || "—"}
                </TableCell>
                <TableCell data-label="상태">
                  <StatusBadge type="work_order" status={o.status} />
                </TableCell>
                <TableCell className="hidden lg:table-cell" data-label="우선순위">
                  {priorityBadge(o.priority)}
                </TableCell>
                <TableCell data-label="마감일" className="text-sm">
                  {dDayBadge(o.deadline, o.status)}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-sm text-gray-600 font-medium" data-label="담당자">
                  {o.assignee || "—"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9}>
                <EmptyState
                  message="발주가 없습니다."
                  description="견적을 발주로 변환하거나 새 발주를 작성해보세요."
                  icon={ClipboardList}
                  action={{ label: "새 발주 작성", href: "/admin/work-orders/new" }}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
