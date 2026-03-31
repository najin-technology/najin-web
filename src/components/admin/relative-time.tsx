function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    if (hours < 1) return "방금";
    return `오늘 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }
  if (isYesterday) return "어제";
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR");
}

export function RelativeTime({
  date,
  className,
}: {
  date: string;
  className?: string;
}) {
  const absolute = new Date(date).toLocaleString("ko-KR");

  return (
    <time
      dateTime={date}
      title={absolute}
      className={className}
    >
      {formatRelative(date)}
    </time>
  );
}
