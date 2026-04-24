import type { FormFunnelRow } from "@/lib/analytics/queries";

const FIELD_LABELS: Record<string, string> = {
  company_name: "회사명",
  contact_name: "담당자명",
  phone: "연락처",
  email: "이메일",
  processing_type: "가공 유형",
  material: "소재",
  quantity: "수량",
  deadline: "납기",
  description: "상세 내용",
  attachment: "도면/첨부",
  privacy_agreed: "개인정보 동의",
};

export function FormFunnel({ rows }: { rows: FormFunnelRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-1 rounded-full bg-brand-copper" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
            견적 폼 퍼널 · 최근 30일
          </p>
        </div>
        <p className="text-sm text-gray-400 py-6 text-center">
          아직 폼 이벤트 데이터가 없습니다.
        </p>
        <p className="text-[11px] text-gray-300 text-center">
          견적 폼에 입력이 발생하면 어느 필드에서 이탈하는지 자동으로 표시됩니다.
        </p>
      </div>
    );
  }

  const topStarts = Math.max(1, ...rows.map((r) => r.starts));

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-brand-copper" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
            견적 폼 퍼널 · 최근 30일
          </p>
        </div>
        <p className="text-xs text-gray-400">필드별 시작 → 완료 비율</p>
      </div>

      <ul className="space-y-3">
        {rows.map((r) => {
          const startWidth = (r.starts / topStarts) * 100;
          const fillWidth = (r.fills / topStarts) * 100;
          return (
            <li key={r.field} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-brand-charcoal">
                  {FIELD_LABELS[r.field] ?? r.field}
                </span>
                <span className="flex items-baseline gap-3 flex-shrink-0">
                  <span className="tabular-nums text-xs text-gray-500">
                    {r.fills}/{r.starts}
                  </span>
                  <span
                    className={`tabular-nums text-xs font-semibold min-w-[3.5ch] text-right ${
                      r.fill_pct >= 80
                        ? "text-emerald-600"
                        : r.fill_pct >= 50
                          ? "text-brand-navy"
                          : "text-red-500"
                    }`}
                  >
                    {r.fill_pct}%
                  </span>
                </span>
              </div>
              <div className="relative h-2 bg-surface-warm-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-surface-warm-200 rounded-full"
                  style={{ width: `${startWidth}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-brand-navy rounded-full"
                  style={{ width: `${fillWidth}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-400 leading-relaxed">
        밝은 회색: 필드 포커스 / 진한 네이비: 실제 입력 완료. 차이가 클수록 이탈 지점.
      </p>
    </div>
  );
}
