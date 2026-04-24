import Link from "next/link";
import type { TimeWindow } from "@/lib/analytics/queries";

const TABS: Array<{ key: TimeWindow; label: string }> = [
  { key: "today", label: "오늘" },
  { key: "7d", label: "7일" },
  { key: "30d", label: "30일" },
];

export function WindowTabs({ active }: { active: TimeWindow }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-surface-warm-100 rounded-full">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={`/admin/analytics?win=${t.key}`}
            prefetch={false}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
              isActive
                ? "bg-white text-brand-navy shadow-sm"
                : "text-gray-500 hover:text-brand-navy"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
