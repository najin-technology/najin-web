import { Smartphone, Tablet, Monitor } from "lucide-react";
import type { DeviceSplit } from "@/lib/analytics/queries";

export function DevicePanel({ split }: { split: DeviceSplit }) {
  const total = split.mobile + split.tablet + split.desktop;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 1000) / 10);
  const cells = [
    { icon: Smartphone, label: "모바일", count: split.mobile, pct: pct(split.mobile) },
    { icon: Monitor, label: "데스크탑", count: split.desktop, pct: pct(split.desktop) },
    { icon: Tablet, label: "태블릿", count: split.tablet, pct: pct(split.tablet) },
  ];
  const primary = cells.reduce((a, b) => (a.count >= b.count ? a : b));

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-1 rounded-full bg-brand-copper" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
          기기 분포
        </p>
      </div>

      <div className="flex items-baseline gap-3 mb-6">
        <primary.icon className="w-7 h-7 text-brand-navy" strokeWidth={1.5} />
        <div>
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-brand-navy leading-none">
            {primary.pct}
            <span className="text-xl font-normal text-gray-400 ml-0.5">%</span>
          </p>
          <p className="text-xs text-gray-400 mt-1.5">주 이용: {primary.label}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {cells.map((c) => (
          <div key={c.label} className="flex items-center gap-3 text-sm">
            <c.icon className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-brand-charcoal flex-1">{c.label}</span>
            <span className="tabular-nums text-gray-500 font-medium">{c.count.toLocaleString("ko-KR")}</span>
            <span className="tabular-nums text-xs text-gray-400 min-w-[3.5ch] text-right">
              {c.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
