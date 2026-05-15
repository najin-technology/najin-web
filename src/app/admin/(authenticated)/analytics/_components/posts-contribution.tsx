import { FileText, Sparkles } from "lucide-react";
import type { PostContribution } from "@/lib/analytics/queries";

const ROW_LIMIT = 10;

function highlightTop(rows: PostContribution[]): string | null {
  const eligible = rows.filter((r) => r.sessions_viewed >= 20 && r.quotes_from_viewers > 0);
  if (!eligible.length) return null;
  let best = eligible[0];
  for (const r of eligible) {
    if (r.conversion_pct > best.conversion_pct) best = r;
  }
  return best.slug;
}

export function PostsContribution({ rows }: { rows: PostContribution[] }) {
  const sliced = rows
    .filter((r) => r.sessions_viewed > 0)
    .slice(0, ROW_LIMIT);
  const max = Math.max(1, ...sliced.map((r) => r.sessions_viewed));
  const topSlug = highlightTop(sliced);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-1.5">
        <FileText className="w-4 h-4 text-brand-copper" strokeWidth={2} />
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
          블로그 기여도 · 최근 90일
        </p>
      </div>
      <p className="text-[13px] text-gray-600 font-medium mb-5">
        포스트를 본 세션이 견적까지 이어진 비율 (TOP {ROW_LIMIT})
      </p>

      {sliced.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-600 font-medium">아직 분석할 포스트 방문이 없습니다.</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-100">
            <li className="pb-2 grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span>포스트</span>
              <span className="w-14 text-right">방문</span>
              <span className="w-14 text-right">세션</span>
              <span className="w-14 text-right">제출</span>
              <span className="w-16 text-right">기여율</span>
            </li>
            {sliced.map((r) => {
              const barWidth = (r.sessions_viewed / max) * 100;
              const isTop = r.slug === topSlug;
              return (
                <li
                  key={r.slug}
                  className="py-3 grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-brand-charcoal truncate font-mono">
                        {r.slug}
                      </p>
                      {isTop && (
                        <Sparkles className="w-3.5 h-3.5 text-brand-copper flex-shrink-0" strokeWidth={2} />
                      )}
                    </div>
                    <div className="mt-1 h-1 bg-surface-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-navy rounded-full"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <span className="tabular-nums text-sm font-bold text-brand-navy w-14 text-right">
                    {r.post_views.toLocaleString("ko-KR")}
                  </span>
                  <span className="tabular-nums text-sm text-gray-600 w-14 text-right">
                    {r.sessions_viewed.toLocaleString("ko-KR")}
                  </span>
                  <span className="tabular-nums text-sm font-bold text-brand-navy w-14 text-right">
                    {r.quotes_from_viewers}
                  </span>
                  <span
                    className={`tabular-nums text-sm font-bold w-16 text-right ${
                      r.conversion_pct >= 3 ? "text-brand-copper" : r.conversion_pct >= 1 ? "text-brand-navy" : "text-gray-500"
                    }`}
                  >
                    {r.conversion_pct.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
          {topSlug && (
            <p className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
              <Sparkles className="inline w-3 h-3 text-brand-copper mr-1" strokeWidth={2} />
              <strong className="font-bold text-brand-navy">{topSlug}</strong> 가 가장 높은 견적 전환율 (충분한 표본 기준)
            </p>
          )}
        </>
      )}
    </div>
  );
}
