const STATUS_COLORS: Record<string, string> = {
  접수: "bg-amber-400",
  검토중: "bg-blue-400",
  견적완료: "bg-green-400",
  거절: "bg-gray-300",
  서류검토: "bg-amber-400",
  면접예정: "bg-blue-400",
  합격: "bg-green-400",
  불합격: "bg-gray-300",
};

export function StatusProgress({
  items,
  statusKey = "status",
}: {
  items: { status: string }[];
  statusKey?: string;
}) {
  if (!items.length) return null;

  const counts: Record<string, number> = {};
  for (const item of items) {
    const s = (item as Record<string, string>)[statusKey] || "기타";
    counts[s] = (counts[s] || 0) + 1;
  }

  const total = items.length;
  const segments = Object.entries(counts).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-2">
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
        {segments.map(([status, count]) => (
          <div
            key={status}
            className={`${STATUS_COLORS[status] || "bg-gray-200"} transition-all`}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${status}: ${count}건 (${Math.round((count / total) * 100)}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {segments.map(([status, count]) => (
          <span key={status} className="flex items-center gap-1 text-[11px] text-gray-500">
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status] || "bg-gray-200"}`} />
            {status} {count}
          </span>
        ))}
      </div>
    </div>
  );
}
