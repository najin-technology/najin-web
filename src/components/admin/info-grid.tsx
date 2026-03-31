type InfoItem = {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
};

export function InfoGrid({
  items,
  cols = 2,
}: {
  items: InfoItem[];
  cols?: 1 | 2 | 3;
}) {
  const colsClass =
    cols === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : cols === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1";

  return (
    <dl className={`grid ${colsClass} gap-4 p-6`}>
      {items.map((item) => (
        <div key={item.label} className={item.fullWidth ? "sm:col-span-full" : ""}>
          <dt className="text-xs text-gray-400 font-medium">{item.label}</dt>
          <dd className="mt-1 text-sm font-medium">
            {item.value || <span className="text-gray-300 font-normal">&mdash;</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
