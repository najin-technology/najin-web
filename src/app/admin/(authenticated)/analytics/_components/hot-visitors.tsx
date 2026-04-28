import Link from "next/link";
import { Building2, Flame, ChevronRight, CheckCircle2, Smartphone, Monitor, Tablet } from "lucide-react";
import { type HotVisitor, formatRelativeKo } from "@/lib/analytics/queries";

function stripLocale(path: string | null): string {
  if (!path) return "—";
  const parts = path.split("/").filter(Boolean);
  if (parts.length && ["ko", "en", "zh"].includes(parts[0])) {
    return "/" + parts.slice(1).join("/");
  }
  return path;
}

function scoreTone(score: number): { text: string; bg: string; border: string } {
  if (score >= 50) return { text: "text-brand-copper", bg: "bg-brand-copper/10", border: "border-brand-copper/20" };
  if (score >= 30) return { text: "text-brand-navy", bg: "bg-brand-navy/5", border: "border-brand-navy/10" };
  return { text: "text-gray-500", bg: "bg-surface-warm-100", border: "border-transparent" };
}

export function HotVisitors({ visitors }: { visitors: HotVisitor[] }) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-brand-copper" strokeWidth={2} />
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
            주목할 방문자 · 최근 7일
          </p>
        </div>
        <p className="text-[13px] text-gray-600 font-medium">
          행동 패턴 · 재방문 · 회사 식별 · 업무시간 방문을 종합한 리드 점수
        </p>
      </div>

      {visitors.length === 0 ? (
        <div className="py-10 text-center">
          <Building2 className="w-9 h-9 text-gray-400 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-600 font-medium">아직 주목할 방문자가 없습니다.</p>
          <p className="text-[13px] text-gray-500 mt-1 font-medium">데이터가 쌓이면 자동으로 표시됩니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {visitors.map((v) => {
            const tone = scoreTone(v.score);
            const loc = [v.city, v.country].filter(Boolean).join(", ") || "위치 미확인";
            return (
              <li key={v.session_hash} className="py-4 first:pt-0 last:pb-0">
                <Link
                  href={`/admin/analytics/sessions/${v.session_hash}`}
                  prefetch={false}
                  className="group grid grid-cols-[auto_1fr_auto] gap-4 items-center hover:bg-surface-warm-50/50 -mx-3 px-3 py-2 rounded-xl transition-colors"
                >
                  <div
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border ${tone.border} ${tone.bg}`}
                  >
                    <span className={`text-xl font-bold tabular-nums tracking-tight ${tone.text} leading-none`}>
                      {v.score}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mt-1">
                      점수
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {v.asn_company ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy">
                          <Building2 className="w-3.5 h-3.5 text-brand-copper" strokeWidth={2} />
                          {v.asn_company}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-500">익명 방문자</span>
                      )}
                      {v.submitted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          견적 제출
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-gray-600 mb-1 font-mono truncate">
                      최근: {stripLocale(v.sample_path)}
                    </p>
                    <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                      <span className="tabular-nums">{v.visit_count}회 방문</span>
                      <span className="text-gray-400">·</span>
                      <span className="truncate">{loc}</span>
                      <span className="text-gray-400">·</span>
                      <span>{formatRelativeKo(new Date(v.last_seen))}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-navy transition-colors flex-shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 leading-relaxed">
        점수 규칙: 업무영역 +3 · 포트폴리오 +5 · 제작사례 +3 · 견적페이지 +10 · 재방문 +10 · 회사 식별 +20 · 업무시간 +3 · 제출 완료 +50
      </p>
    </div>
  );
}
