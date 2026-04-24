import type { SupabaseClient } from "@supabase/supabase-js";

export type TimeWindow = "today" | "7d" | "30d";

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
