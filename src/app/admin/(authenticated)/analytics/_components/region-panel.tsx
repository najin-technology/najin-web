import type { RegionRow } from "@/lib/analytics/queries";

function flag(country: string): string {
  if (country === "KR") return "🇰🇷";
  if (country === "US") return "🇺🇸";
  if (country === "CN") return "🇨🇳";
  if (country === "JP") return "🇯🇵";
  if (country === "VN") return "🇻🇳";
  if (country === "Unknown") return "📍";
  return "🌐";
}

function countryLabel(country: string): string {
  const labels: Record<string, string> = {
    KR: "대한민국", US: "미국", CN: "중국", JP: "일본", VN: "베트남",
    Unknown: "미확인", DE: "독일", GB: "영국", FR: "프랑스", IN: "인도",
  };
  return labels[country] ?? country;
}

export function RegionPanel({ rows }: { rows: RegionRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.visits));

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
          지역 분포 · 최근 30일
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">아직 데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r, i) => {
            const pct = (r.visits / max) * 100;
            return (
              <li key={`${r.country}-${r.city}-${i}`} className="space-y-1.5">
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="text-base">{flag(r.country)}</span>
                  <span className="font-semibold text-brand-charcoal truncate">{r.city}</span>
                  <span className="text-[13px] text-gray-500 truncate">{countryLabel(r.country)}</span>
                  <span className="ml-auto tabular-nums text-[13px] text-brand-navy font-bold">{r.visits.toLocaleString("ko-KR")}</span>
                </div>
                <div className="h-1 bg-surface-warm-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-navy rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
