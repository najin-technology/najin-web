import Link from "next/link";
import { Building2, Flame, CheckCircle2 } from "lucide-react";
import {
  type CompanyActivityRow,
  type CompanyActivityFilter,
  formatRelativeKo,
} from "@/lib/analytics/queries";

const FILTERS: Array<{ key: CompanyActivityFilter; label: string }> = [
  { key: "all", label: "전체" },
  { key: "unsubmitted", label: "미제출만" },
  { key: "hot", label: "Hot만" },
];

export function CompanyActivity({
  rows,
  filter,
  win,
  tab,
}: {
  rows: CompanyActivityRow[];
  filter: CompanyActivityFilter;
  win: string;
  tab: string;
}) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-brand-copper" strokeWidth={2} />
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
              회사별 활동 · 최근 30일
            </p>
          </div>
          <p className="text-[13px] text-gray-600 font-medium">
            ASN 기반 회사 식별 (ISP 제외)
          </p>
        </div>
        <div className="inline-flex items-center gap-1 p-1 bg-surface-warm-100 rounded-full">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/admin/analytics?tab=${tab}&win=${win}&cf=${f.key}`}
              prefetch={false}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-full transition-all ${
                f.key === filter
                  ? "bg-white text-brand-navy shadow-sm"
                  : "text-gray-600 hover:text-brand-navy"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="py-10 text-center">
          <Building2 className="w-9 h-9 text-gray-400 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-600 font-medium">표시할 회사가 없습니다.</p>
          <p className="text-[13px] text-gray-500 mt-1 font-medium">
            {filter === "unsubmitted" && "필터를 '전체'로 바꿔보세요."}
            {filter === "hot" && "Hot 점수 30 이상인 회사가 없습니다."}
            {filter === "all" && "ASN 식별된 방문이 아직 없습니다."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">
                <th className="text-left py-2 px-2">회사</th>
                <th className="text-right py-2 px-2 w-16">방문자</th>
                <th className="text-right py-2 px-2 w-14">세션</th>
                <th className="text-left py-2 px-2 w-24">마지막</th>
                <th className="text-right py-2 px-2 w-16">점수</th>
                <th className="text-left py-2 px-2 w-20">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.asn_company} className="hover:bg-surface-warm-50/40 transition-colors">
                  <td className="py-3 px-2">
                    <span className="font-semibold text-brand-navy">{r.asn_company}</span>
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums font-bold text-brand-charcoal">
                    {r.visitor_count}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums text-gray-600">
                    {r.session_count}
                  </td>
                  <td className="py-3 px-2 text-[13px] text-gray-600 font-medium">
                    {formatRelativeKo(new Date(r.last_seen))}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className={`tabular-nums font-bold ${
                        r.hot_score >= 50
                          ? "text-brand-copper"
                          : r.hot_score >= 30
                          ? "text-brand-navy"
                          : "text-gray-500"
                      }`}
                    >
                      {r.hot_score}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {r.has_submitted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        제출
                      </span>
                    ) : r.hot_score >= 30 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-brand-copper bg-brand-copper/10 px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3" />
                        hot
                      </span>
                    ) : (
                      <span className="text-[12px] text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 leading-relaxed">
        SK Broadband/KT/LG U+ 같은 통신사(ISP)는 제외됩니다. 회사 식별은 IP 기반 ASN 조회에 의존합니다.
      </p>
    </div>
  );
}
