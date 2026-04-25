import Link from "next/link";
import { Calendar, User, AlertCircle } from "lucide-react";

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

function isOverdue(deadline: string | null, status: string): boolean {
  if (!deadline) return false;
  if (status === "완료" || status === "출하") return false;
  return new Date(deadline) < new Date();
}

export function WorkOrderCard({ order }: { order: Order }) {
  const overdue = isOverdue(order.deadline, order.status);
  return (
    <Link
      href={`/admin/work-orders/${order.id}`}
      className={`block bg-white rounded-lg ${priorityClass(order.priority)} hover:shadow-md transition-shadow p-3 group`}
      draggable={false}
    >
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="font-mono text-[10px] text-brand-copper">{order.order_number}</span>
        {order.priority === "높음" && (
          <span className="text-[9px] font-semibold uppercase tracking-widest text-rose-600">
            긴급
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-brand-navy truncate mb-0.5">
        {order.customer_name}
      </p>
      <p className="text-xs text-brand-charcoal truncate mb-2">{order.product_name}</p>
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        {order.deadline ? (
          <span
            className={`inline-flex items-center gap-1 tabular-nums ${
              overdue ? "text-rose-600 font-semibold" : ""
            }`}
          >
            {overdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            {new Date(order.deadline).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
        {order.assignee && (
          <span className="inline-flex items-center gap-1 truncate">
            <User className="w-3 h-3" />
            {order.assignee}
          </span>
        )}
      </div>
    </Link>
  );
}
