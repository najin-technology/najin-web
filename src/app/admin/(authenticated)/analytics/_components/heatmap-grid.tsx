import type { HeatmapCell } from "@/lib/analytics/queries";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export function HeatmapGrid({ cells }: { cells: HeatmapCell[] }) {
  const max = Math.max(1, ...cells.map((c) => c.visits));
  const byKey = new Map(cells.map((c) => [`${c.day_of_week}-${c.hour}`, c.visits]));
  const total = cells.reduce((sum, c) => sum + c.visits, 0);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
            요일 × 시간 방문 패턴 · 최근 30일
          </p>
        </div>
        <p className="text-[13px] text-gray-600 tabular-nums font-semibold">총 <span className="text-brand-charcoal font-bold">{total.toLocaleString("ko-KR")}</span> 방문</p>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="grid" style={{ gridTemplateColumns: "2rem repeat(24, minmax(1rem, 1fr))", gap: "2px", minWidth: "640px" }}>
          <div />
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className={`text-[10px] tabular-nums text-center font-medium ${h % 3 === 0 ? "text-gray-500" : "text-transparent"}`}
            >
              {h}
            </div>
          ))}
          {DAY_LABELS.map((label, dayIdx) => (
            <>
              <div
                key={`label-${dayIdx}`}
                className="text-[11px] font-bold tabular-nums flex items-center justify-end pr-2 text-gray-600"
              >
                {label}
              </div>
              {Array.from({ length: 24 }, (_, h) => {
                const visits = byKey.get(`${dayIdx + 1}-${h}`) ?? 0;
                const intensity = visits === 0 ? 0 : Math.min(1, 0.1 + (visits / max) * 0.9);
                const isWeekend = dayIdx >= 5;
                const isBusinessHour = h >= 9 && h <= 17;
                return (
                  <div
                    key={`${dayIdx}-${h}`}
                    className={`aspect-square rounded-[2px] relative group ${
                      visits === 0 ? "bg-surface-warm-100/60" : ""
                    }`}
                    style={
                      visits > 0
                        ? {
                            backgroundColor: isWeekend
                              ? `oklch(0.3 0.1 30 / ${intensity})`
                              : `oklch(0.25 0.1 250 / ${intensity})`,
                          }
                        : undefined
                    }
                    title={`${DAY_LABELS[dayIdx]} ${h}시 · ${visits}회 방문`}
                  >
                    {isBusinessHour && !isWeekend && visits === 0 && (
                      <div className="absolute inset-0 border border-dashed border-gray-200/50 rounded-[2px]" />
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
          <span>적음</span>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
              <div
                key={o}
                className="w-3 h-3 rounded-[2px]"
                style={{ backgroundColor: `oklch(0.25 0.1 250 / ${o})` }}
              />
            ))}
          </div>
          <span>많음</span>
        </div>
        <p className="text-xs text-gray-600 font-medium">브랜드 블루=평일 · 카퍼=주말</p>
      </div>
    </div>
  );
}
