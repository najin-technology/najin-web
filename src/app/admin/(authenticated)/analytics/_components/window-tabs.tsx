import Link from "next/link";
import type { AnalyticsTab, TimeWindow } from "@/lib/analytics/queries";

const TABS: Array<{ key: TimeWindow; label: string }> = [
  { key: "today", label: "오늘" },
  { key: "7d", label: "7일" },
  { key: "30d", label: "30일" },
];

export function WindowTabs({ active, tab = "overview" }: { active: TimeWindow; tab?: AnalyticsTab }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-surface-warm-100 rounded-full">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={`/admin/analytics?tab=${tab}&win=${t.key}`}
            prefetch={false}
            className={`px-4 py-2 text-[13px] font-semibold rounded-full transition-all duration-150 ${
              isActive
                ? "bg-white text-brand-navy shadow-sm"
                : "text-gray-600 hover:text-brand-navy"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
