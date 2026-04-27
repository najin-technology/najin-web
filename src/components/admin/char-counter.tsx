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
        ? "text-amber-600"
        : "text-gray-500";

  return (
    <span className={`text-xs tabular-nums ${color}`}>
      {current}/{max}
    </span>
  );
}
