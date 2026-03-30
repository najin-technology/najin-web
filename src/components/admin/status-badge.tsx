const quoteStatusColors: Record<string, string> = {
  접수: "bg-gray-100 text-gray-700",
  검토중: "bg-blue-100 text-blue-700",
  견적발송: "bg-yellow-100 text-yellow-700",
  완료: "bg-green-100 text-green-700",
};

const applicationStatusColors: Record<string, string> = {
  서류검토: "bg-gray-100 text-gray-700",
  면접예정: "bg-blue-100 text-blue-700",
  합격: "bg-green-100 text-green-700",
  불합격: "bg-red-100 text-red-700",
};

export function StatusBadge({
  status,
  type,
}: {
  status: string;
  type: "quote" | "application";
}) {
  const colors =
    type === "quote" ? quoteStatusColors : applicationStatusColors;
  const colorClass = colors[status] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
}
