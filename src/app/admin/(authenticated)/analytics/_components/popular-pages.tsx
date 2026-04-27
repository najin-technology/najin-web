import type { PopularPage } from "@/lib/analytics/queries";

function prettyPath(path: string): { locale: string | null; label: string } {
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) return { locale: null, label: "홈" };
  const maybeLocale = ["ko", "en", "zh"].includes(parts[0]) ? parts[0] : null;
  const rest = maybeLocale ? parts.slice(1) : parts;
  if (rest.length === 0) return { locale: maybeLocale, label: "홈" };

  const labels: Record<string, string> = {
    about: "회사 소개",
    business: "사업 영역",
    portfolio: "포트폴리오",
    clients: "거래처",
    posts: "제작 사례",
    notices: "공지",
    quote: "견적 문의",
    careers: "채용",
    faq: "FAQ",
    privacy: "개인정보처리방침",
  };
  const head = labels[rest[0]] ?? rest[0];
  return {
    locale: maybeLocale,
    label: rest.length === 1 ? head : `${head} · ${rest.slice(1).join("/")}`,
  };
}

export function PopularPages({ pages }: { pages: PopularPage[] }) {
  const max = Math.max(1, ...pages.map((p) => p.count));

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
          인기 페이지 TOP {pages.length || 10}
        </p>
      </div>

      {pages.length === 0 ? (
        <p className="text-sm text-gray-400">아직 방문 기록이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {pages.map((p, i) => {
            const pretty = prettyPath(p.path);
            const barWidth = (p.count / max) * 100;
            return (
              <li key={p.path} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                <span className="text-xs font-mono font-semibold tabular-nums text-gray-400 w-6 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-charcoal truncate">
                    {pretty.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate font-mono">
                    {pretty.locale && <span className="mr-1 text-gray-400 font-semibold">{pretty.locale.toUpperCase()}</span>}
                    {p.path}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-16 sm:w-24 h-1.5 bg-surface-warm-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-navy rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-sm font-semibold text-brand-navy min-w-[3.5ch] text-right">
                    {p.count.toLocaleString("ko-KR")}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
