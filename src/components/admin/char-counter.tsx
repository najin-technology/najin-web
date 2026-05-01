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
      ? "text-red-600 font-bold"
      : ratio >= 0.8
        ? "text-amber-700 font-bold"
        : "text-gray-600 font-medium";

  return (
    <span className={`text-[13px] tabular-nums ${color}`}>
      {current}/{max}
    </span>
  );
}
