import type { DailyPoint, TimeWindow } from "@/lib/analytics/queries";

const CHART_W = 800;
const CHART_H = 220;
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 24;
const PAD_B = 36;

type SeriesPoint = { day: string; visits: number; uniques: number };

function fillGaps(data: DailyPoint[], win: TimeWindow): SeriesPoint[] {
  const days = win === "30d" ? 30 : win === "7d" ? 7 : 1;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const out: SeriesPoint[] = [];
  const byDay = new Map(data.map((d) => [d.day, d]));
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const existing = byDay.get(key);
    out.push({
      day: key,
      visits: existing?.visits ?? 0,
      uniques: existing?.uniques ?? 0,
    });
  }
  return out;
}

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const prev = points[i - 1];
    const cx = prev.x + (p.x - prev.x) / 2;
    d += ` C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }
  return d;
}

function dayLabel(iso: string, win: TimeWindow): string {
  const d = new Date(iso + "T00:00:00");
  if (win === "today") return `${d.getHours()}시`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function VisitorChart({ data, win }: { data: DailyPoint[]; win: TimeWindow }) {
  const series = fillGaps(data, win);
  const max = Math.max(1, ...series.map((d) => d.visits));
  const chartW = CHART_W - PAD_L - PAD_R;
  const chartH = CHART_H - PAD_T - PAD_B;
  const stepX = series.length > 1 ? chartW / (series.length - 1) : chartW;

  const visitPts = series.map((d, i) => ({
    x: PAD_L + i * stepX,
    y: PAD_T + chartH - (d.visits / max) * chartH,
  }));
  const uniquePts = series.map((d, i) => ({
    x: PAD_L + i * stepX,
    y: PAD_T + chartH - (d.uniques / max) * chartH,
  }));

  const visitsArea = `${smoothPath(visitPts)} L ${visitPts[visitPts.length - 1]?.x ?? PAD_L} ${PAD_T + chartH} L ${visitPts[0]?.x ?? PAD_L} ${PAD_T + chartH} Z`;

  const yTicks = [0, 0.5, 1].map((ratio) => ({
    y: PAD_T + chartH - ratio * chartH,
    value: Math.round(max * ratio),
  }));

  const totalVisits = series.reduce((sum, d) => sum + d.visits, 0);
  const totalUniques = series.reduce((sum, d) => sum + d.uniques, 0);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-brand-copper" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
            방문 추이
          </p>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-0.5 bg-brand-navy rounded-full" />
            <span className="text-gray-500">총 방문</span>
            <span className="font-semibold tabular-nums text-brand-navy">{totalVisits.toLocaleString("ko-KR")}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-0.5 bg-brand-copper rounded-full" />
            <span className="text-gray-500">고유 방문자</span>
            <span className="font-semibold tabular-nums text-brand-copper">{totalUniques.toLocaleString("ko-KR")}</span>
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="none"
        className="w-full h-56"
        role="img"
        aria-label="방문 추이 차트"
      >
        <defs>
          <linearGradient id="visitor-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B2A4A" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#1B2A4A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t.y}>
            <line
              x1={PAD_L}
              x2={CHART_W - PAD_R}
              y1={t.y}
              y2={t.y}
              stroke="#E8E2D9"
              strokeWidth={1}
              strokeDasharray={t.value === 0 ? "0" : "2 4"}
            />
            <text
              x={PAD_L - 10}
              y={t.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="10"
              fill="#9CA3AF"
              className="tabular-nums"
            >
              {t.value.toLocaleString("ko-KR")}
            </text>
          </g>
        ))}

        <path d={visitsArea} fill="url(#visitor-area)" />
        <path
          d={smoothPath(visitPts)}
          fill="none"
          stroke="#1B2A4A"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={smoothPath(uniquePts)}
          fill="none"
          stroke="#B87333"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3 3"
        />

        {visitPts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill="#FAF8F5" stroke="#1B2A4A" strokeWidth={1.5} />
          </g>
        ))}

        {series.map((d, i) => {
          const step = series.length <= 10 ? 1 : Math.ceil(series.length / 10);
          if (i % step !== 0 && i !== series.length - 1) return null;
          const x = PAD_L + i * stepX;
          return (
            <text
              key={d.day}
              x={x}
              y={CHART_H - 14}
              textAnchor="middle"
              fontSize="10"
              fill="#9CA3AF"
            >
              {dayLabel(d.day, win)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
