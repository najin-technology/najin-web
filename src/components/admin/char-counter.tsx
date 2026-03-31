export function CharCounter({
  current,
  max,
}: {
  current: number;
  max: number;
}) {
  const ratio = current / max;
  const color =
    ratio >= 1
      ? "text-red-500"
      : ratio >= 0.8
        ? "text-amber-500"
        : "text-gray-400";

  return (
    <span className={`text-[11px] tabular-nums ${color}`}>
      {current}/{max}
    </span>
  );
}
