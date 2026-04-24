import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

type Kpi = {
  label: string;
  value: number;
  prev: number | null;
  href: string;
};

function deltaBadge(value: number, prev: number | null) {
  if (prev == null) return null;
  if (prev === 0 && value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
        <Minus className="w-3 h-3" />
        변화 없음
      </span>
    );
  }
  if (prev === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <TrendingUp className="w-3 h-3" />
        신규
      </span>
    );
  }
  const pct = Math.round(((value - prev) / prev) * 100);
  if (pct === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
        <Minus className="w-3 h-3" />
        {prev} 지난 달
      </span>
    );
  }
  const Icon = pct > 0 ? TrendingUp : TrendingDown;
  const color = pct > 0 ? "text-emerald-600" : "text-red-500";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {pct > 0 ? "+" : ""}{pct}% · 지난 달 {prev}
    </span>
  );
}

export function KpiCards({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <Link
          key={k.label}
          href={k.href}
          className="group bg-white rounded-2xl border border-gray-200/80 p-5 hover:border-brand-navy/30 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-gray-500">{k.label}</p>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-navy transition-colors" />
          </div>
          <p className="text-3xl font-bold text-brand-navy mb-2 tabular-nums">
            {k.value.toLocaleString("ko-KR")}
          </p>
          <div>{deltaBadge(k.value, k.prev)}</div>
        </Link>
      ))}
    </div>
  );
}
