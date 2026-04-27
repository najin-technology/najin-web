import type { FunnelStats } from "@/lib/analytics/queries";

export function FunnelCard({ funnel }: { funnel: FunnelStats }) {
  const steps = [
    { label: "사이트 방문자", value: funnel.visitors },
    { label: "견적 페이지 조회", value: funnel.quoteViews },
    { label: "견적 제출 완료", value: funnel.quoteSubmits },
  ];
  const maxValue = Math.max(1, steps[0].value);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
            견적 전환
          </p>
        </div>
        <span className="text-[13px] text-gray-500 font-medium">방문 → 제출</span>
      </div>

      <div className="space-y-5">
        {steps.map((step, i) => {
          const pct = step.value === 0 ? 0 : Math.round((step.value / maxValue) * 1000) / 10;
          const prevStep = i > 0 ? steps[i - 1] : null;
          const stepConversion =
            prevStep && prevStep.value > 0
              ? Math.round((step.value / prevStep.value) * 1000) / 10
              : null;

          return (
            <div key={step.label}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-semibold text-brand-charcoal">{step.label}</span>
                <span className="text-2xl font-bold tabular-nums tracking-tight text-brand-navy">
                  {step.value.toLocaleString("ko-KR")}
                </span>
              </div>
              <div className="h-2 bg-surface-warm-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    i === steps.length - 1 ? "bg-brand-copper" : "bg-brand-navy"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {stepConversion !== null && (
                <p className="text-xs text-gray-500 mt-1.5 tabular-nums font-medium">
                  ↓ {stepConversion}% 진입 · {prevStep!.value - step.value > 0 ? `${(prevStep!.value - step.value).toLocaleString("ko-KR")} 이탈` : "이탈 없음"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {funnel.visitors > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-baseline justify-between">
          <span className="text-[13px] text-gray-500 uppercase tracking-widest font-semibold">전체 전환율</span>
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-brand-copper">
            {Math.round((funnel.quoteSubmits / funnel.visitors) * 10000) / 100}
            <span className="text-base text-gray-400 font-normal ml-0.5">%</span>
          </span>
        </div>
      )}
    </div>
  );
}
