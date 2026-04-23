import { getStatusStyle, type StatusType } from "@/lib/status-colors";

/**
 * Distribution bar showing relative status counts.
 * Pass `type` so colors come from the same source as StatusBadge.
 */
export function StatusProgress({
  items,
  type = "quote",
  statusKey = "status",
}: {
  items: Array<Record<string, unknown>>;
  type?: StatusType;
  statusKey?: string;
}) {
  if (!items.length) return null;

  const counts: Record<string, number> = {};
  for (const item of items) {
    const s = (item[statusKey] as string) || "기타";
    counts[s] = (counts[s] || 0) + 1;
  }

  const total = items.length;
  const segments = Object.entries(counts).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
        {segments.map(([status, count]) => (
          <div
            key={status}
            className={`${getStatusStyle(type, status).dot} transition-all`}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${status}: ${count}건 (${Math.round((count / total) * 100)}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {segments.map(([status, count]) => (
          <span key={status} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`w-2 h-2 rounded-full ${getStatusStyle(type, status).dot}`} />
            {status} {count}
          </span>
        ))}
      </div>
    </div>
  );
}
