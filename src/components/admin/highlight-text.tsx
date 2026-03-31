export function HighlightText({
  text,
  query,
}: {
  text: string;
  query?: string | null;
}) {
  if (!query || !text) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-100 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
