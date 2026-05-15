import type { SupabaseClient } from "@supabase/supabase-js";

export type TimeWindow = "today" | "7d" | "30d";

export type AnalyticsTab = "overview" | "traffic" | "content" | "journey";

export const ANALYTICS_TABS: ReadonlyArray<AnalyticsTab> = ["overview", "traffic", "content", "journey"];

export function windowBounds(win: TimeWindow) {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  if (win === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (win === "7d") {
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
  }

  const prevEnd = new Date(start);
  const prevStart = new Date(start);
  const span = end.getTime() - start.getTime();
  prevStart.setTime(prevStart.getTime() - span);

  return { start, end, prevStart, prevEnd };
}

export type VisitorStats = {
  visits: number;
  uniqueVisitors: number;
  prevVisits: number;
  prevUniqueVisitors: number;
};

export type DailyPoint = { day: string; visits: number; uniques: number };

export type ReferrerRow = { category: string; label: string; count: number; percent: number };

export type PopularPage = { path: string; count: number; uniques: number };

export type DeviceSplit = { mobile: number; tablet: number; desktop: number };

export type RecentVisit = {
  id: number;
  path: string;
  referrer_category: string;
  referrer_host: string | null;
  device_class: string;
  browser: string | null;
  city: string | null;
  country: string | null;
  locale: string | null;
  created_at: string;
};

export type FunnelStats = {
  visitors: number;
  quoteViews: number;
  quoteSubmits: number;
  viewToSubmit: number;
};

const REFERRER_LABELS: Record<string, string> = {
  "search-naver": "네이버 검색",
  "search-google": "구글 검색",
  "search-bing": "Bing 검색",
  "search-daum": "다음 검색",
  "search-other": "기타 검색",
  social: "소셜 미디어",
  referral: "외부 링크",
  direct: "직접 방문",
  internal: "사내 이동",
};

export async function getVisitorStats(
  supabase: SupabaseClient,
  win: TimeWindow
): Promise<VisitorStats> {
  const { start, end, prevStart, prevEnd } = windowBounds(win);

  const [cur, prev, curUniq, prevUniq] = await Promise.all([
    supabase.from("page_views").select("*", { count: "exact", head: true })
      .gte("created_at", start.toISOString()).lt("created_at", end.toISOString())
      .neq("device_class", "bot"),
    supabase.from("page_views").select("*", { count: "exact", head: true })
      .gte("created_at", prevStart.toISOString()).lt("created_at", prevEnd.toISOString())
      .neq("device_class", "bot"),
    supabase.rpc("count_unique_sessions", { start_at: start.toISOString(), end_at: end.toISOString() }),
    supabase.rpc("count_unique_sessions", { start_at: prevStart.toISOString(), end_at: prevEnd.toISOString() }),
  ]);

  return {
    visits: cur.count ?? 0,
    prevVisits: prev.count ?? 0,
    uniqueVisitors: (curUniq.data as number | null) ?? 0,
    prevUniqueVisitors: (prevUniq.data as number | null) ?? 0,
  };
}

export async function getDailyTrend(
  supabase: SupabaseClient,
  win: TimeWindow
): Promise<DailyPoint[]> {
  const { start, end } = windowBounds(win);
  const { data } = await supabase.rpc("daily_page_views", {
    start_at: start.toISOString(),
    end_at: end.toISOString(),
  });
  return ((data as DailyPoint[] | null) ?? []).map((row) => ({
    day: row.day,
    visits: Number(row.visits),
    uniques: Number(row.uniques),
  }));
}

export async function getReferrerBreakdown(
  supabase: SupabaseClient,
  win: TimeWindow
): Promise<ReferrerRow[]> {
  const { start, end } = windowBounds(win);
  const { data } = await supabase
    .from("page_views")
    .select("referrer_category")
    .gte("created_at", start.toISOString()).lt("created_at", end.toISOString())
    .neq("device_class", "bot");

  const rows = (data ?? []) as Array<{ referrer_category: string }>;
  const bucket = new Map<string, number>();
  rows.forEach((r) => bucket.set(r.referrer_category, (bucket.get(r.referrer_category) ?? 0) + 1));
  const total = rows.length || 1;

  return Array.from(bucket.entries())
    .map(([category, count]) => ({
      category,
      label: REFERRER_LABELS[category] ?? category,
      count,
      percent: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getPopularPages(
  supabase: SupabaseClient,
  win: TimeWindow,
  limit = 10
): Promise<PopularPage[]> {
  const { start, end } = windowBounds(win);
  const { data } = await supabase.rpc("popular_pages", {
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    row_limit: limit,
  });
  return ((data as PopularPage[] | null) ?? []).map((row) => ({
    path: row.path,
    count: Number(row.count),
    uniques: Number(row.uniques),
  }));
}

export async function getDeviceSplit(
  supabase: SupabaseClient,
  win: TimeWindow
): Promise<DeviceSplit> {
  const { start, end } = windowBounds(win);
  const { data } = await supabase
    .from("page_views")
    .select("device_class")
    .gte("created_at", start.toISOString()).lt("created_at", end.toISOString())
    .neq("device_class", "bot");

  const rows = (data ?? []) as Array<{ device_class: string }>;
  const split = { mobile: 0, tablet: 0, desktop: 0 };
  rows.forEach((r) => {
    if (r.device_class === "mobile") split.mobile += 1;
    else if (r.device_class === "tablet") split.tablet += 1;
    else split.desktop += 1;
  });
  return split;
}

export async function getRecentVisits(
  supabase: SupabaseClient,
  limit = 20
): Promise<RecentVisit[]> {
  const { data } = await supabase
    .from("page_views")
    .select("id, path, referrer_category, referrer_host, device_class, browser, city, country, locale, created_at")
    .neq("device_class", "bot")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as RecentVisit[];
}

export async function getConversionFunnel(
  supabase: SupabaseClient,
  win: TimeWindow
): Promise<FunnelStats> {
  const { start, end } = windowBounds(win);
  const iso = start.toISOString();
  const endIso = end.toISOString();

  const [{ data: visitorsRes }, { count: quoteViewsCount }, { count: submitCount }] = await Promise.all([
    supabase.rpc("count_unique_sessions", { start_at: iso, end_at: endIso }),
    supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .ilike("path", "%/quote%")
      .gte("created_at", iso).lt("created_at", endIso)
      .neq("device_class", "bot"),
    supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", iso).lt("created_at", endIso)
      .is("deleted_at", null),
  ]);

  const visitors = (visitorsRes as number | null) ?? 0;
  const quoteViews = quoteViewsCount ?? 0;
  const quoteSubmits = submitCount ?? 0;
  const viewToSubmit = quoteViews > 0 ? Math.round((quoteSubmits / quoteViews) * 1000) / 10 : 0;

  return { visitors, quoteViews, quoteSubmits, viewToSubmit };
}

export function referrerLabel(category: string): string {
  return REFERRER_LABELS[category] ?? category;
}

export type HotVisitor = {
  session_hash: string;
  score: number;
  asn_company: string | null;
  country: string | null;
  city: string | null;
  visit_count: number;
  first_seen: string;
  last_seen: string;
  submitted: boolean;
  sample_path: string | null;
};

export type JourneyStep = {
  id: number;
  path: string;
  referrer_category: string;
  referrer_host: string | null;
  device_class: string;
  browser: string | null;
  country: string | null;
  city: string | null;
  asn_org: string | null;
  asn_company: string | null;
  locale: string | null;
  created_at: string;
};

export type PostContribution = {
  slug: string;
  post_views: number;
  sessions_viewed: number;
  quotes_from_viewers: number;
  conversion_pct: number;
};

export type AiCrawlerRow = { browser: string; visits: number; last_seen: string };
export type HeatmapCell = { day_of_week: number; hour: number; visits: number };
export type RegionRow = { country: string; city: string; visits: number; uniques: number };
export type FormFunnelRow = { field: string; starts: number; fills: number; fill_pct: number };

export async function getHotVisitors(
  supabase: SupabaseClient,
  limit = 15
): Promise<HotVisitor[]> {
  const { data } = await supabase.rpc("hot_visitors", { row_limit: limit });
  return ((data as HotVisitor[] | null) ?? []).map((r) => ({
    ...r,
    score: Number(r.score),
    visit_count: Number(r.visit_count),
  }));
}

export async function getSessionJourney(
  supabase: SupabaseClient,
  hash: string
): Promise<JourneyStep[]> {
  const { data } = await supabase.rpc("session_journey", { target_session: hash });
  return (data as JourneyStep[] | null) ?? [];
}

export async function getSessionScore(
  supabase: SupabaseClient,
  hash: string
): Promise<number> {
  const { data } = await supabase.rpc("lead_score_for_session", { target_session: hash });
  return Number(data ?? 0);
}

export async function getPostsContribution(
  supabase: SupabaseClient
): Promise<PostContribution[]> {
  const { data } = await supabase.rpc("posts_contribution");
  return ((data as PostContribution[] | null) ?? []).map((r) => ({
    ...r,
    post_views: Number(r.post_views),
    sessions_viewed: Number(r.sessions_viewed),
    quotes_from_viewers: Number(r.quotes_from_viewers),
    conversion_pct: Number(r.conversion_pct),
  }));
}

export async function getAiCrawlerStats(supabase: SupabaseClient): Promise<AiCrawlerRow[]> {
  const { data } = await supabase.rpc("ai_crawler_stats");
  return ((data as AiCrawlerRow[] | null) ?? []).map((r) => ({
    ...r,
    visits: Number(r.visits),
  }));
}

export async function getHeatmap(supabase: SupabaseClient): Promise<HeatmapCell[]> {
  const { data } = await supabase.rpc("hour_day_heatmap");
  return ((data as HeatmapCell[] | null) ?? []).map((r) => ({
    day_of_week: Number(r.day_of_week),
    hour: Number(r.hour),
    visits: Number(r.visits),
  }));
}

export async function getRegionBreakdown(
  supabase: SupabaseClient,
  limit = 10
): Promise<RegionRow[]> {
  const { data } = await supabase.rpc("region_breakdown", { row_limit: limit });
  return ((data as RegionRow[] | null) ?? []).map((r) => ({
    ...r,
    visits: Number(r.visits),
    uniques: Number(r.uniques),
  }));
}

export async function getFormFunnel(supabase: SupabaseClient): Promise<FormFunnelRow[]> {
  const { data } = await supabase.rpc("quote_form_funnel");
  return ((data as FormFunnelRow[] | null) ?? []).map((r) => ({
    ...r,
    starts: Number(r.starts),
    fills: Number(r.fills),
    fill_pct: Number(r.fill_pct),
  }));
}

export function formatRelativeKo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "방금";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}
