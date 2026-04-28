import Link from "next/link";
import { Calendar, User, AlertCircle } from "lucide-react";
import { dDayLabel } from "@/lib/format-date";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  deadline: string | null;
  priority: string;
  status: string;
  assignee: string | null;
};

function priorityClass(priority: string) {
  if (priority === "높음") return "border-l-2 border-rose-400";
  if (priority === "낮음") return "border-l-2 border-gray-200";
  return "border-l-2 border-blue-300";
}

export function WorkOrderCard({ order }: { order: Order }) {
  const closed = order.status === "완료" || order.status === "출하";
  const dd = dDayLabel(order.deadline);
  const showDday = !closed && order.deadline;
  return (
    <Link
      href={`/admin/work-orders/${order.id}`}
      className={`block bg-white rounded-lg ${priorityClass(order.priority)} hover:shadow-md transition-shadow p-3 group`}
      draggable={false}
    >
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="font-mono text-[13px] font-bold text-brand-copper">{order.order_number}</span>
        <div className="flex items-center gap-1.5">
          {order.priority === "높음" && (
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600">
              긴급
            </span>
          )}
          {showDday && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                dd.tone === "overdue"
                  ? "bg-rose-100 text-rose-700"
                  : dd.tone === "urgent"
                    ? "bg-amber-100 text-amber-700"
                    : dd.tone === "soon"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
              }`}
            >
              {dd.label}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm font-bold text-brand-navy truncate mb-0.5">
        {order.customer_name}
      </p>
      <p className="text-[13px] text-brand-charcoal truncate mb-2 font-medium">{order.product_name}</p>
      <div className="flex items-center justify-between text-[13px] text-gray-600 font-medium">
        {order.deadline ? (
          <span className="inline-flex items-center gap-1 tabular-nums">
            {dd.tone === "overdue" ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            {new Date(order.deadline).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
        {order.assignee && (
          <span className="inline-flex items-center gap-1 truncate">
            <User className="w-3.5 h-3.5" />
            {order.assignee}
          </span>
        )}
      </div>
    </Link>
  );
}
