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
          <dt className="text-[13px] text-gray-600 font-bold tracking-[0.02em]">{item.label}</dt>
          <dd className="mt-1 text-base font-semibold text-brand-charcoal leading-relaxed">
            {item.value || <span className="text-gray-400 font-normal">&mdash;</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
