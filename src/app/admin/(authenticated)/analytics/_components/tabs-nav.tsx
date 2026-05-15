import Link from "next/link";
import type { AnalyticsTab, TimeWindow } from "@/lib/analytics/queries";

const TABS: Array<{ key: AnalyticsTab; label: string; hint: string }> = [
  { key: "overview", label: "개요", hint: "한눈에 보는 경영 지표" },
  { key: "traffic", label: "트래픽", hint: "누가 어디서 오는지" },
  { key: "content", label: "콘텐츠", hint: "어떤 페이지가 일하는지" },
  { key: "journey", label: "여정", hint: "누가 견적까지 갔는지" },
];

export function TabsNav({ active, win }: { active: AnalyticsTab; win: TimeWindow }) {
  return (
    <nav
      aria-label="분석 카테고리"
      className="flex flex-wrap gap-1 border-b border-gray-200/80"
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={`/admin/analytics?tab=${t.key}&win=${win}`}
            prefetch={false}
            aria-current={isActive ? "page" : undefined}
            className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
              isActive
                ? "text-brand-navy"
                : "text-gray-500 hover:text-brand-navy"
            }`}
          >
            {t.label}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand-copper"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
