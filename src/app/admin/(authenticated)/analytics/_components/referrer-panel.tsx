import type { ReferrerRow } from "@/lib/analytics/queries";

export function ReferrerPanel({ rows }: { rows: ReferrerRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
          유입 소스
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">아직 데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-3.5">
          {rows.slice(0, 7).map((r) => {
            const barWidth = Math.max(6, (r.count / max) * 100);
            return (
              <li key={r.category} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold text-brand-charcoal truncate">{r.label}</span>
                  <span className="flex items-baseline gap-2 flex-shrink-0">
                    <span className="tabular-nums text-brand-charcoal font-bold">
                      {r.count.toLocaleString("ko-KR")}
                    </span>
                    <span className="tabular-nums text-[13px] text-gray-500 min-w-[3.5ch] text-right">
                      {r.percent}%
                    </span>
                  </span>
                </div>
                <div className="h-1.5 bg-surface-warm-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      r.category.startsWith("search-naver")
                        ? "bg-[#03C75A]"
                        : r.category.startsWith("search-google")
                          ? "bg-[#4285F4]"
                          : r.category === "direct"
                            ? "bg-brand-navy"
                            : r.category === "social"
                              ? "bg-brand-copper"
                              : "bg-gray-400"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-baseline justify-between text-[13px]">
        <span className="text-gray-500 uppercase tracking-widest font-semibold">총 방문</span>
        <span className="tabular-nums text-brand-navy font-bold text-base">{total.toLocaleString("ko-KR")}</span>
      </div>
    </div>
  );
}
