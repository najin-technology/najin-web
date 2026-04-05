const quoteStatusStyles: Record<string, { dot: string; bg: string; text: string }> = {
  접수: { dot: "bg-gray-500", bg: "bg-gray-100", text: "text-gray-800" },
  검토중: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  견적발송: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  완료: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
};

const applicationStatusStyles: Record<string, { dot: string; bg: string; text: string }> = {
  서류검토: { dot: "bg-gray-500", bg: "bg-gray-100", text: "text-gray-800" },
  면접예정: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  합격: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  불합격: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
};

export function StatusBadge({
  status,
  type,
}: {
  status: string;
  type: "quote" | "application";
}) {
  const styles = type === "quote" ? quoteStatusStyles : applicationStatusStyles;
  const style = styles[status] || { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600" };

  const typeLabel = type === "quote" ? "견적" : "지원서";

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
