import { getStatusStyle, type StatusType } from "@/lib/status-colors";

const TYPE_LABELS: Record<StatusType, string> = {
  quote: "견적",
  application: "지원서",
  customer: "고객",
  work_order: "발주",
  work_order_priority: "우선순위",
};

export function StatusBadge({
  status,
  type,
}: {
  status: string;
  type: StatusType;
}) {
  const style = getStatusStyle(type, status);
  const typeLabel = TYPE_LABELS[type];

  return (
    <span
      role="status"
      aria-label={`${typeLabel} 상태: ${status}`}
      title={`현재 상태: ${status}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}
