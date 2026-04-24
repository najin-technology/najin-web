import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getVisitorStats,
  getDailyTrend,
  getReferrerBreakdown,
  getPopularPages,
  getDeviceSplit,
  getRecentVisits,
  getConversionFunnel,
  windowBounds,
  type TimeWindow,
} from "@/lib/analytics/queries";
import { WindowTabs } from "./_components/window-tabs";
import { HeroMetrics } from "./_components/hero-metrics";
import { VisitorChart } from "./_components/visitor-chart";
import { ReferrerPanel } from "./_components/referrer-panel";
import { DevicePanel } from "./_components/device-panel";
import { PopularPages } from "./_components/popular-pages";
import { FunnelCard } from "./_components/funnel-card";
import { RecentFeed } from "./_components/recent-feed";

export const metadata = {
  title: "Analytics",
  description: "나진테크 웹 분석 대시보드",
  robots: "noindex, nofollow",
};

const VALID_WINDOWS: TimeWindow[] = ["today", "7d", "30d"];

function windowLabel(win: TimeWindow): string {
  if (win === "today") return "오늘";
  if (win === "7d") return "최근 7일";
  return "최근 30일";
}

function compareLabel(win: TimeWindow): string {
  if (win === "today") return "어제 대비";
  if (win === "7d") return "지난 주 대비";
  return "지난 달 대비";
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ win?: string }>;
}) {
  await requireAdmin();
  const { win: winParam } = await searchParams;
  const win: TimeWindow = VALID_WINDOWS.includes(winParam as TimeWindow)
    ? (winParam as TimeWindow)
    : "7d";

  const supabase = await createSupabaseServerClient();

  const [
    visitorStats,
    dailyTrend,
    referrers,
    popular,
    devices,
    recent,
    funnel,
    quoteCurRes,
    quotePrevRes,
  ] = await Promise.all([
    getVisitorStats(supabase, win),
    getDailyTrend(supabase, win),
    getReferrerBreakdown(supabase, win),
    getPopularPages(supabase, win, 10),
    getDeviceSplit(supabase, win),
    getRecentVisits(supabase, 20),
    getConversionFunnel(supabase, win),
    (async () => {
      const { start, end } = windowBounds(win);
      return supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
        .is("deleted_at", null);
    })(),
    (async () => {
      const { prevStart, prevEnd } = windowBounds(win);
      return supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", prevStart.toISOString())
        .lt("created_at", prevEnd.toISOString())
        .is("deleted_at", null);
    })(),
  ]);

  const quotesCur = quoteCurRes.count ?? 0;
  const quotesPrev = quotePrevRes.count ?? 0;

  const conversionRate =
    visitorStats.visits > 0
      ? Math.round((quotesCur / visitorStats.visits) * 10000) / 100
      : 0;
  const prevConversionRate =
    visitorStats.prevVisits > 0
      ? Math.round((quotesPrev / visitorStats.prevVisits) * 10000) / 100
      : 0;

  const cmp = compareLabel(win);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-copper">
            NAJIN · ANALYTICS
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-brand-navy">
            방문 분석
          </h1>
          <p className="text-sm text-gray-500">
            {windowLabel(win)} · 사이트에 누가 어떻게 들어오는지, 견적까지 얼마나 이어지는지.
          </p>
        </div>
        <WindowTabs active={win} />
      </header>

      <HeroMetrics
        metrics={[
          {
            label: "총 방문",
            value: visitorStats.visits,
            prev: visitorStats.prevVisits,
            compareLabel: cmp,
            tone: "primary",
          },
          {
            label: "고유 방문자",
            value: visitorStats.uniqueVisitors,
            prev: visitorStats.prevUniqueVisitors,
            compareLabel: cmp,
          },
          {
            label: "견적 문의",
            value: quotesCur,
            prev: quotesPrev,
            suffix: "건",
            compareLabel: cmp,
          },
          {
            label: "전환율",
            value: conversionRate,
            prev: prevConversionRate === 0 ? null : prevConversionRate,
            suffix: "%",
            format: (n) => n.toFixed(2),
            compareLabel: cmp,
          },
        ]}
      />

      <VisitorChart data={dailyTrend} win={win} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ReferrerPanel rows={referrers} />
        </div>
        <DevicePanel split={devices} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PopularPages pages={popular} />
        </div>
        <FunnelCard funnel={funnel} />
      </div>

      <RecentFeed visits={recent} />

      <footer className="pt-2 flex items-center justify-between text-[11px] text-gray-400">
        <span className="uppercase tracking-[0.1em]">자체 수집 · 익명 세션 해시 · 서울 시간 기준</span>
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-brand-navy transition-colors"
        >
          Vercel 성능 대시보드 →
        </a>
      </footer>
    </div>
  );
}
