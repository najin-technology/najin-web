import { Smartphone, Tablet, Monitor } from "lucide-react";
import { type RecentVisit, formatRelativeKo, referrerLabel } from "@/lib/analytics/queries";

function deviceIcon(deviceClass: string) {
  if (deviceClass === "mobile") return <Smartphone className="w-3.5 h-3.5" strokeWidth={1.5} />;
  if (deviceClass === "tablet") return <Tablet className="w-3.5 h-3.5" strokeWidth={1.5} />;
  return <Monitor className="w-3.5 h-3.5" strokeWidth={1.5} />;
}

function stripLocale(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length && ["ko", "en", "zh"].includes(parts[0])) {
    return "/" + parts.slice(1).join("/");
  }
  return path;
}

export function RecentFeed({ visits }: { visits: RecentVisit[] }) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-copper opacity-70" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-copper" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
            실시간 방문 · 최근 {visits.length}건
          </p>
        </div>
      </div>

      {visits.length === 0 ? (
        <p className="text-sm text-gray-400">아직 방문이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {visits.map((v) => {
            const displayPath = stripLocale(v.path) || "/";
            const rel = formatRelativeKo(new Date(v.created_at));
            const loc = [v.city, v.country].filter(Boolean).join(" · ") || "—";

            return (
              <li
                key={v.id}
                className="py-3 first:pt-0 last:pb-0 grid grid-cols-[3.5rem_1fr_auto_auto_auto] sm:grid-cols-[4rem_1.6fr_auto_auto_auto] gap-3 items-center"
              >
                <span className="text-[13px] tabular-nums text-gray-500 truncate font-medium">{rel}</span>
                <div className="min-w-0 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-brand-charcoal truncate font-mono">
                    {displayPath}
                  </span>
                  {v.locale && v.locale !== "ko" && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-surface-warm-100 px-1.5 py-0.5 rounded flex-shrink-0">
                      {v.locale}
                    </span>
                  )}
                </div>
                <span className="text-[13px] text-gray-600 hidden sm:inline font-medium">
                  {referrerLabel(v.referrer_category)}
                </span>
                <span className="text-gray-500">{deviceIcon(v.device_class)}</span>
                <span className="text-[13px] text-gray-500 hidden sm:inline truncate max-w-[8rem]">{loc}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
