import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Metric = {
  label: string;
  value: number;
  prev: number | null;
  format?: (n: number) => string;
  suffix?: string;
  tone?: "primary" | "secondary";
  compareLabel: string;
};

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function Delta({ value, prev, compareLabel }: { value: number; prev: number | null; compareLabel: string }) {
  if (prev == null) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-gray-400">{compareLabel}</span>
      </div>
    );
  }
  if (prev === 0 && value === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Minus className="w-3 h-3" />
        <span>변화 없음</span>
      </div>
    );
  }
  if (prev === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-medium text-emerald-600">신규</span>
      </div>
    );
  }
  const diff = value - prev;
  const pct = Math.round((diff / prev) * 1000) / 10;
  if (pct === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Minus className="w-3 h-3" />
        <span>{compareLabel}</span>
      </div>
    );
  }
  const up = pct > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className={`w-3.5 h-3.5 ${up ? "text-emerald-600" : "text-red-500"}`} />
      <span className={`font-semibold tabular-nums ${up ? "text-emerald-600" : "text-red-500"}`}>
        {up ? "+" : ""}{pct}%
      </span>
      <span className="text-gray-400">· {compareLabel}</span>
    </div>
  );
}

export function HeroMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={`relative bg-white border border-gray-200/80 rounded-2xl px-6 py-5 transition-all ${
            i === 0 ? "lg:col-span-2" : ""
          } ${m.tone === "primary" ? "lg:row-start-1" : ""}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-1 rounded-full bg-brand-copper" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
              {m.label}
            </p>
          </div>
          <p
            className={`font-semibold tabular-nums tracking-tight text-brand-navy mb-3 ${
              i === 0 ? "text-5xl lg:text-6xl" : "text-4xl"
            }`}
          >
            {(m.format ?? formatNumber)(m.value)}
            {m.suffix && <span className="text-xl text-gray-400 font-normal ml-1">{m.suffix}</span>}
          </p>
          <Delta value={m.value} prev={m.prev} compareLabel={m.compareLabel} />
        </div>
      ))}
    </div>
  );
}
