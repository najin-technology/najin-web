import Link from "next/link";
import { Clock, FileText, TrendingUp } from "lucide-react";
import type { SubmitterBehavior, SubmitterDays } from "@/lib/analytics/queries";

const MIN_SAMPLE = 5;

function formatMinutes(min: number): string {
  if (min === 0) return "—";
  if (min < 60) return `${Math.round(min)}분`;
  const hours = min / 60;
  if (hours < 24) return `${hours.toFixed(1)}시간`;
  const days = hours / 24;
  return `${days.toFixed(1)}일`;
}

function prettyPath(path: string): string {
  if (path === "/") return "/ (홈)";
  return path;
}

function bucketRow(label: string, count: number, total: number) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return { label, count, pct };
}

export function SubmitterProfile({
  data,
  days,
  win,
  tab,
}: {
  data: SubmitterBehavior;
  days: SubmitterDays;
  win: string;
  tab: string;
}) {
  const total = data.submitter_count;
  const isSmall = total < MIN_SAMPLE;

  const buckets = [
    bucketRow("1시간 미만 (즉시)", data.bucket_lt_1h, total),
    bucketRow("당일 ~ 3일", data.bucket_lt_3d, total),
    bucketRow("4일 ~ 2주", data.bucket_lt_2w, total),
    bucketRow("2주 이상", data.bucket_ge_2w, total),
  ];

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-brand-copper" strokeWidth={2} />
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
              견적 제출자 행동 · 최근 {days}일
            </p>
          </div>
          <p className="text-[13px] text-gray-600 font-medium">
            제출자 <strong className="text-brand-navy">{total}</strong>명의 평균 패턴
          </p>
        </div>
        <div className="inline-flex items-center gap-1 p-1 bg-surface-warm-100 rounded-full">
          {[30, 90].map((d) => (
            <Link
              key={d}
              href={`/admin/analytics?tab=${tab}&win=${win}&sb=${d}`}
              prefetch={false}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-full transition-all ${
                d === days
                  ? "bg-white text-brand-navy shadow-sm"
                  : "text-gray-600 hover:text-brand-navy"
              }`}
            >
              {d}일
            </Link>
          ))}
        </div>
      </div>

      {isSmall ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-600 font-medium">
            데이터가 부족합니다 (N={total}, 최소 {MIN_SAMPLE}건 필요)
          </p>
          <p className="text-[13px] text-gray-500 mt-1 font-medium">
            session_hash가 기록된 신규 견적부터 추적됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Clock className="w-3.5 h-3.5 text-gray-500" strokeWidth={2} />
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
                  첫 방문 → 제출 (중앙값 {formatMinutes(data.median_time_to_submit_minutes)})
                </p>
              </div>
              <ul className="space-y-2">
                {buckets.map((b) => (
                  <li key={b.label} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                    <span className="text-sm text-brand-charcoal font-medium">{b.label}</span>
                    <span className="tabular-nums text-sm font-bold text-brand-navy w-10 text-right">
                      {b.count}
                    </span>
                    <span className="tabular-nums text-[13px] text-gray-600 w-12 text-right font-medium">
                      {b.pct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                평균 본 페이지 수 (제출 전)
              </p>
              <p className="text-2xl font-bold text-brand-navy tabular-nums">
                {data.avg_page_count.toFixed(1)}<span className="text-sm font-medium text-gray-500 ml-1">개</span>
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <FileText className="w-3.5 h-3.5 text-gray-500" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
                제출 전 많이 본 페이지 TOP {data.top_pages.length}
              </p>
            </div>
            {data.top_pages.length === 0 ? (
              <p className="text-sm text-gray-500 font-medium">데이터 없음</p>
            ) : (
              <ul className="space-y-2">
                {data.top_pages.map((p, i) => (
                  <li key={p.path} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
                    <span className="text-[12px] font-mono font-bold tabular-nums text-gray-500 w-5">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-brand-charcoal truncate font-mono">
                      {prettyPath(p.path)}
                    </p>
                    <span className="tabular-nums text-sm font-bold text-brand-navy w-12 text-right">
                      {p.percent.toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <p className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 leading-relaxed">
        session_hash가 기록된 견적만 분석에 포함됩니다 (2026-04 이후 신규 견적).
      </p>
    </div>
  );
}
