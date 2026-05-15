# Admin Analytics v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/admin/analytics`에 탭 구조를 도입하고 3개 신규 분석(블로그 기여도, 견적 제출자 프로필, 회사별 활동)을 추가한다.

**Architecture:** 기존 12개 컴포넌트를 4개 탭(개요/트래픽/콘텐츠/여정)에 재배치. 신규 분석 2개(B1, B2)는 신규 Postgres RPC를 통해 데이터 조회, 나머지 1개(A1)는 기존 `posts_contribution()` RPC 활용. 차트 라이브러리 추가 없이 기존 SVG/HTML 카드 패턴 유지.

**Tech Stack:** Next.js App Router (Server Components), Supabase Postgres RPC, Tailwind CSS, lucide-react.

**Spec:** `docs/superpowers/specs/2026-05-14-admin-analytics-v2-design.md`

**Testing convention:** 이 코드베이스의 analytics 영역은 단위 테스트가 없다 (spec 합의). 검증은 (1) SQL RPC를 supabase SQL editor 또는 `pnpm supabase db ...` 으로 직접 호출하여 결과 확인, (2) `pnpm dev`로 브라우저에서 시각 확인. 신규 unit test 작성 X.

---

## Phase 1 — 탭 인프라 (동작 변경 없음)

기존 `/admin/analytics` 페이지를 탭 구조로 리팩토링한다. 모든 기존 컴포넌트는 그대로 동작해야 하고, URL 파라미터 `?tab=overview|traffic|content|journey`로 활성 탭이 결정된다.

### Task 1.1: TabType 타입과 TabsNav 컴포넌트 생성

**Files:**
- Modify: `src/lib/analytics/queries.ts` (TabType 타입 export 추가)
- Create: `src/app/admin/(authenticated)/analytics/_components/tabs-nav.tsx`

- [ ] **Step 1: queries.ts에 TabType 추가**

`src/lib/analytics/queries.ts` 상단의 `export type TimeWindow` 줄 바로 다음에 추가:

```ts
export type AnalyticsTab = "overview" | "traffic" | "content" | "journey";

export const ANALYTICS_TABS: ReadonlyArray<AnalyticsTab> = ["overview", "traffic", "content", "journey"];
```

- [ ] **Step 2: TabsNav 컴포넌트 작성**

`src/app/admin/(authenticated)/analytics/_components/tabs-nav.tsx` 파일을 새로 생성:

```tsx
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
```

- [ ] **Step 3: 빌드 통과 확인 (컴포넌트만, 아직 사용 안 함)**

Run: `pnpm typecheck`
Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/lib/analytics/queries.ts src/app/admin/\(authenticated\)/analytics/_components/tabs-nav.tsx
git commit -m "feat(analytics): add TabsNav component and AnalyticsTab type"
```

---

### Task 1.2: page.tsx를 4-탭 구조로 리팩토링

**Files:**
- Modify: `src/app/admin/(authenticated)/analytics/page.tsx` (전체 재구성)

- [ ] **Step 1: page.tsx 전체 교체**

`src/app/admin/(authenticated)/analytics/page.tsx` 전체를 아래 내용으로 교체. 기존의 5개 `<section>` 블록을 4개 탭으로 재배치하고, 활성 탭만 렌더링한다.

```tsx
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
  getHotVisitors,
  getAiCrawlerStats,
  getHeatmap,
  getRegionBreakdown,
  getFormFunnel,
  windowBounds,
  ANALYTICS_TABS,
  type TimeWindow,
  type AnalyticsTab,
} from "@/lib/analytics/queries";
import { WindowTabs } from "./_components/window-tabs";
import { TabsNav } from "./_components/tabs-nav";
import { HeroMetrics } from "./_components/hero-metrics";
import { VisitorChart } from "./_components/visitor-chart";
import { ReferrerPanel } from "./_components/referrer-panel";
import { DevicePanel } from "./_components/device-panel";
import { PopularPages } from "./_components/popular-pages";
import { FunnelCard } from "./_components/funnel-card";
import { RecentFeed } from "./_components/recent-feed";
import { HotVisitors } from "./_components/hot-visitors";
import { HeatmapGrid } from "./_components/heatmap-grid";
import { RegionPanel } from "./_components/region-panel";
import { AiCrawlerBadge } from "./_components/ai-crawler-badge";
import { FormFunnel } from "./_components/form-funnel";

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
  searchParams: Promise<{ win?: string; tab?: string }>;
}) {
  await requireAdmin();
  const { win: winParam, tab: tabParam } = await searchParams;
  const win: TimeWindow = VALID_WINDOWS.includes(winParam as TimeWindow)
    ? (winParam as TimeWindow)
    : "7d";
  const tab: AnalyticsTab = ANALYTICS_TABS.includes(tabParam as AnalyticsTab)
    ? (tabParam as AnalyticsTab)
    : "overview";

  const supabase = await createSupabaseServerClient();

  const [
    visitorStats,
    dailyTrend,
    referrers,
    popular,
    devices,
    recent,
    funnel,
    hotVisitors,
    aiCrawlers,
    heatmap,
    regions,
    formFunnel,
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
    getHotVisitors(supabase, 12),
    getAiCrawlerStats(supabase),
    getHeatmap(supabase),
    getRegionBreakdown(supabase, 10),
    getFormFunnel(supabase),
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

  const hotVisitorsTop6 = hotVisitors.slice(0, 6);

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
            {windowLabel(win)} · 누가, 어디서, 어떻게 왔고 견적으로 이어졌는지.
          </p>
        </div>
        <WindowTabs active={win} />
      </header>

      <TabsNav active={tab} win={win} />

      {tab === "overview" && (
        <div className="space-y-10">
          <section className="space-y-3">
            <HeroMetrics
              metrics={[
                { label: "총 방문", value: visitorStats.visits, prev: visitorStats.prevVisits, compareLabel: cmp, tone: "primary" },
                { label: "고유 방문자", value: visitorStats.uniqueVisitors, prev: visitorStats.prevUniqueVisitors, compareLabel: cmp },
                { label: "견적 문의", value: quotesCur, prev: quotesPrev, suffix: "건", compareLabel: cmp },
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
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">방문 흐름</h2>
            <VisitorChart data={dailyTrend} win={win} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">주목할 방문자 (TOP 6)</h2>
            <HotVisitors visitors={hotVisitorsTop6} />
          </section>
        </div>
      )}

      {tab === "traffic" && (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">유입과 기기</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <ReferrerPanel rows={referrers} />
              </div>
              <DevicePanel split={devices} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">패턴</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <HeatmapGrid cells={heatmap} />
              </div>
              <RegionPanel rows={regions} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">AI 크롤러와 실시간</h2>
            <AiCrawlerBadge rows={aiCrawlers} />
            <RecentFeed visits={recent} />
          </section>
        </div>
      )}

      {tab === "content" && (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">콘텐츠</h2>
            <PopularPages pages={popular} />
            {/* TODO Phase 2: <PostsContribution rows={postsContribution} /> */}
          </section>
        </div>
      )}

      {tab === "journey" && (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">리드 인텔리전스</h2>
            <HotVisitors visitors={hotVisitors} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">견적 퍼널</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <FunnelCard funnel={funnel} />
              <div className="lg:col-span-2">
                <FormFunnel rows={formFunnel} />
              </div>
            </div>
          </section>

          {/* TODO Phase 4: <SubmitterProfile data={submitterBehavior} /> */}
          {/* TODO Phase 5: <CompanyActivity rows={companyActivity} /> */}
        </div>
      )}

      <footer className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 font-medium">
        <span className="uppercase tracking-[0.1em]">
          자체 수집 · 익명 세션 해시 · 서울 시간 기준
        </span>
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-brand-navy transition-colors font-semibold"
        >
          Vercel 성능 대시보드 →
        </a>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: WindowTabs href에 tab 파라미터 보존하도록 수정**

`src/app/admin/(authenticated)/analytics/_components/window-tabs.tsx`:

기존 `href={`/admin/analytics?win=${t.key}`}` 부분을 찾아서, `tab` prop을 받아 함께 보존하도록 수정.

`WindowTabs` 함수 시그니처를 다음과 같이 변경:

```tsx
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
```

- [ ] **Step 3: page.tsx에서 WindowTabs에 tab 전달**

`page.tsx`의 `<WindowTabs active={win} />` 줄을 `<WindowTabs active={win} tab={tab} />`로 변경.

- [ ] **Step 4: typecheck + dev 서버에서 시각 확인**

```bash
pnpm typecheck
```
Expected: 에러 없음.

```bash
pnpm dev
```
브라우저에서 다음 URL 차례로 열어 모든 컴포넌트가 정상 렌더링되는지 확인:
- `/admin/analytics` → 기본 = 개요 탭, 개요 컨텐츠 보임
- `/admin/analytics?tab=traffic` → 트래픽 탭 활성, 유입/기기/히트맵/지역/크롤러/실시간 보임
- `/admin/analytics?tab=content` → 콘텐츠 탭 활성, 인기 페이지 보임 (Phase 2 TODO 자리)
- `/admin/analytics?tab=journey` → 여정 탭 활성, Hot Visitors + 퍼널 보임
- 기간 변경(7일↔30일) 시 URL의 tab 파라미터가 유지되는지 확인

Expected:
- 모든 12개 기존 컴포넌트가 어느 탭에서든 렌더링 깨지지 않음
- 빌드 에러 없음
- 새로고침해도 활성 탭이 유지됨

- [ ] **Step 5: 커밋**

```bash
git add src/app/admin/\(authenticated\)/analytics/page.tsx src/app/admin/\(authenticated\)/analytics/_components/window-tabs.tsx
git commit -m "refactor(analytics): split dashboard into 4 tabs (overview/traffic/content/journey)"
```

---

## Phase 2 — A1 블로그 포스트 기여도

기존 `getPostsContribution()` wrapper와 `posts_contribution()` RPC가 이미 정의되어 있다 (`src/lib/analytics/queries.ts:298-309`, `supabase/migrations/016_analytics_expansion.sql:188-235`). UI 컴포넌트만 추가하면 된다.

### Task 2.1: posts_contribution RPC 실데이터 확인

**Files:** 없음 (SQL 검증만)

- [ ] **Step 1: RPC가 데이터를 반환하는지 확인**

supabase SQL editor 또는 `psql`로 다음 쿼리 실행:

```sql
SELECT * FROM posts_contribution() LIMIT 5;
```

Expected: `slug | post_views | sessions_viewed | quotes_from_viewers | conversion_pct` 컬럼이 반환됨. 데이터가 비어있어도(빈 결과) OK — 컴포넌트가 빈 상태를 처리한다.

만약 에러 발생 시 — 016 마이그레이션이 dev DB에 적용되지 않은 것. `pnpm supabase db push` 또는 동등한 마이그레이션 적용 명령 실행.

- [ ] **Step 2: 결과를 평가하고 메모**

받은 결과를 빠르게 훑어 `conversion_pct`가 의미 있는 숫자인지(0~100 사이) 확인. 의미 있으면 Phase 2 진행. 다 0이거나 빈 결과면 Phase 2는 진행하되 dev 환경에 데이터가 없는 것으로 가정하고 시각만 검증.

---

### Task 2.2: PostsContribution 컴포넌트 생성

**Files:**
- Create: `src/app/admin/(authenticated)/analytics/_components/posts-contribution.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/app/admin/(authenticated)/analytics/_components/posts-contribution.tsx` 생성:

```tsx
import { FileText, Sparkles } from "lucide-react";
import type { PostContribution } from "@/lib/analytics/queries";

const ROW_LIMIT = 10;

function highlightTop(rows: PostContribution[]): string | null {
  const eligible = rows.filter((r) => r.sessions_viewed >= 20 && r.quotes_from_viewers > 0);
  if (!eligible.length) return null;
  let best = eligible[0];
  for (const r of eligible) {
    if (r.conversion_pct > best.conversion_pct) best = r;
  }
  return best.slug;
}

export function PostsContribution({ rows }: { rows: PostContribution[] }) {
  const sliced = rows
    .filter((r) => r.sessions_viewed > 0)
    .slice(0, ROW_LIMIT);
  const max = Math.max(1, ...sliced.map((r) => r.sessions_viewed));
  const topSlug = highlightTop(sliced);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-1.5">
        <FileText className="w-4 h-4 text-brand-copper" strokeWidth={2} />
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
          블로그 기여도 · 최근 90일
        </p>
      </div>
      <p className="text-[13px] text-gray-600 font-medium mb-5">
        포스트를 본 세션이 견적까지 이어진 비율 (TOP {ROW_LIMIT})
      </p>

      {sliced.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-600 font-medium">아직 분석할 포스트 방문이 없습니다.</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-100">
            <li className="pb-2 grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span>포스트</span>
              <span className="w-14 text-right">방문</span>
              <span className="w-14 text-right">세션</span>
              <span className="w-14 text-right">제출</span>
              <span className="w-16 text-right">기여율</span>
            </li>
            {sliced.map((r) => {
              const barWidth = (r.sessions_viewed / max) * 100;
              const isTop = r.slug === topSlug;
              return (
                <li
                  key={r.slug}
                  className="py-3 grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-brand-charcoal truncate font-mono">
                        {r.slug}
                      </p>
                      {isTop && (
                        <Sparkles className="w-3.5 h-3.5 text-brand-copper flex-shrink-0" strokeWidth={2} />
                      )}
                    </div>
                    <div className="mt-1 h-1 bg-surface-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-navy rounded-full"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <span className="tabular-nums text-sm font-bold text-brand-navy w-14 text-right">
                    {r.post_views.toLocaleString("ko-KR")}
                  </span>
                  <span className="tabular-nums text-sm text-gray-600 w-14 text-right">
                    {r.sessions_viewed.toLocaleString("ko-KR")}
                  </span>
                  <span className="tabular-nums text-sm font-bold text-brand-navy w-14 text-right">
                    {r.quotes_from_viewers}
                  </span>
                  <span
                    className={`tabular-nums text-sm font-bold w-16 text-right ${
                      r.conversion_pct >= 3 ? "text-brand-copper" : r.conversion_pct >= 1 ? "text-brand-navy" : "text-gray-500"
                    }`}
                  >
                    {r.conversion_pct.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
          {topSlug && (
            <p className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
              <Sparkles className="inline w-3 h-3 text-brand-copper mr-1" strokeWidth={2} />
              <strong className="font-bold text-brand-navy">{topSlug}</strong> 가 가장 높은 견적 전환율 (충분한 표본 기준)
            </p>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: page.tsx에 통합**

`src/app/admin/(authenticated)/analytics/page.tsx`:

1. Import 추가 (`PopularPages` import 다음):
```tsx
import { PostsContribution } from "./_components/posts-contribution";
import { getPostsContribution } from "@/lib/analytics/queries";
```

`getPostsContribution`은 기존 import에 추가:
```tsx
import {
  // ... 기존 imports
  getPostsContribution,
  // ...
} from "@/lib/analytics/queries";
```

2. `Promise.all` 배열에 `getPostsContribution(supabase)` 추가, 구조분해에 `postsContribution` 추가:

```tsx
const [
  visitorStats,
  // ...
  formFunnel,
  postsContribution,  // ← 추가
  quoteCurRes,
  quotePrevRes,
] = await Promise.all([
  // ...
  getFormFunnel(supabase),
  getPostsContribution(supabase),  // ← 추가
  // ...
]);
```

3. 콘텐츠 탭의 `{/* TODO Phase 2: ... */}` 주석을 컴포넌트로 교체:

```tsx
{tab === "content" && (
  <div className="space-y-10">
    <section className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">콘텐츠</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PopularPages pages={popular} />
        <PostsContribution rows={postsContribution} />
      </div>
    </section>
  </div>
)}
```

- [ ] **Step 3: typecheck + 브라우저 확인**

```bash
pnpm typecheck
```
Expected: 에러 없음.

```bash
pnpm dev
```
브라우저에서 `/admin/analytics?tab=content` 열기:
- `<PostsContribution>` 카드가 렌더링됨
- 데이터가 있다면 슬러그 목록과 기여율이 표시됨
- 데이터가 없다면 "아직 분석할 포스트 방문이 없습니다." 빈 상태 표시
- 빌드 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/app/admin/\(authenticated\)/analytics/_components/posts-contribution.tsx src/app/admin/\(authenticated\)/analytics/page.tsx
git commit -m "feat(analytics): add blog post contribution card on content tab"
```

---

## Phase 3 — DB 마이그레이션 (B1, B2 준비)

`submitter_behavior`와 `company_activity` RPC를 신규 마이그레이션 파일에 작성한다.

### Task 3.1: 026 마이그레이션 작성

**Files:**
- Create: `supabase/migrations/026_admin_analytics_v2.sql`

- [ ] **Step 1: 마이그레이션 파일 작성**

`supabase/migrations/026_admin_analytics_v2.sql` 신규 작성:

```sql
-- ============================================================
-- Admin Analytics v2
-- - submitter_behavior: 견적 제출자 행동 프로필 (B1)
-- - company_activity: 회사(ASN)별 활동 (B2)
-- ============================================================

-- 견적 제출자 행동 프로필
-- 입력: 기간 (start, end)
-- 출력: 단일 행 (집계 결과)
CREATE OR REPLACE FUNCTION submitter_behavior(
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ
)
RETURNS TABLE (
  submitter_count INTEGER,
  avg_page_count NUMERIC,
  median_time_to_submit_minutes INTEGER,
  bucket_lt_1h INTEGER,
  bucket_lt_3d INTEGER,
  bucket_lt_2w INTEGER,
  bucket_ge_2w INTEGER,
  top_pages JSONB
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  WITH submitters AS (
    SELECT
      q.session_hash,
      q.created_at AS submit_at,
      MIN(pv.created_at) AS first_seen,
      COUNT(pv.*) AS page_count
    FROM quotes q
    LEFT JOIN page_views pv
      ON pv.session_hash = q.session_hash
      AND pv.created_at <= q.created_at
      AND pv.device_class NOT IN ('bot', 'ai-crawler')
    WHERE q.session_hash IS NOT NULL
      AND q.created_at >= p_start
      AND q.created_at < p_end
      AND q.deleted_at IS NULL
    GROUP BY q.session_hash, q.created_at
  ),
  with_time AS (
    SELECT
      session_hash,
      page_count,
      CASE
        WHEN first_seen IS NULL THEN 0
        ELSE EXTRACT(EPOCH FROM (submit_at - first_seen)) / 60
      END AS minutes_to_submit
    FROM submitters
  ),
  page_top AS (
    SELECT
      pv.path,
      COUNT(DISTINCT pv.session_hash)::NUMERIC AS s_count
    FROM page_views pv
    INNER JOIN submitters s
      ON pv.session_hash = s.session_hash
      AND pv.created_at <= s.submit_at
    WHERE pv.device_class NOT IN ('bot', 'ai-crawler')
    GROUP BY pv.path
    ORDER BY s_count DESC
    LIMIT 5
  ),
  agg_top AS (
    SELECT
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'path', path,
          'percent', ROUND((s_count / NULLIF((SELECT COUNT(*) FROM submitters), 0)) * 100, 1)
        )
        ORDER BY s_count DESC
      ) AS top_pages
    FROM page_top
  )
  SELECT
    (SELECT COUNT(*)::INTEGER FROM submitters) AS submitter_count,
    COALESCE(ROUND(AVG(page_count), 1), 0) AS avg_page_count,
    COALESCE(
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes_to_submit)::INTEGER,
      0
    ) AS median_time_to_submit_minutes,
    COUNT(*) FILTER (WHERE minutes_to_submit < 60)::INTEGER AS bucket_lt_1h,
    COUNT(*) FILTER (WHERE minutes_to_submit >= 60 AND minutes_to_submit < 60 * 24 * 3)::INTEGER AS bucket_lt_3d,
    COUNT(*) FILTER (WHERE minutes_to_submit >= 60 * 24 * 3 AND minutes_to_submit < 60 * 24 * 14)::INTEGER AS bucket_lt_2w,
    COUNT(*) FILTER (WHERE minutes_to_submit >= 60 * 24 * 14)::INTEGER AS bucket_ge_2w,
    COALESCE((SELECT top_pages FROM agg_top), '[]'::JSONB) AS top_pages
  FROM with_time;
$$;

-- 회사별 활동
-- 입력: 일수, 결과 개수, 필터 ('all' | 'unsubmitted' | 'hot')
-- 출력: 회사별 집계 행
CREATE OR REPLACE FUNCTION company_activity(
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 20,
  p_filter TEXT DEFAULT 'all'
)
RETURNS TABLE (
  asn_company TEXT,
  visitor_count INTEGER,
  session_count INTEGER,
  last_seen TIMESTAMPTZ,
  has_submitted BOOLEAN,
  hot_score INTEGER
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  WITH company_sessions AS (
    SELECT
      pv.asn_company,
      pv.session_hash,
      MAX(pv.created_at) AS session_last_seen,
      COUNT(*)::INTEGER AS pv_count
    FROM page_views pv
    WHERE pv.created_at >= NOW() - (p_days || ' days')::INTERVAL
      AND pv.device_class NOT IN ('bot', 'ai-crawler')
      AND pv.asn_company IS NOT NULL
      AND pv.asn_company NOT LIKE '%(ISP)%'
    GROUP BY pv.asn_company, pv.session_hash
  ),
  company_agg AS (
    SELECT
      cs.asn_company,
      COUNT(DISTINCT cs.session_hash)::INTEGER AS visitor_count,
      SUM(cs.pv_count)::INTEGER AS session_count,
      MAX(cs.session_last_seen) AS last_seen,
      BOOL_OR(
        EXISTS(
          SELECT 1 FROM quotes q
          WHERE q.session_hash = cs.session_hash AND q.deleted_at IS NULL
        )
      ) AS has_submitted,
      MAX(lead_score_for_session(cs.session_hash))::INTEGER AS hot_score
    FROM company_sessions cs
    GROUP BY cs.asn_company
  )
  SELECT
    asn_company,
    visitor_count,
    session_count,
    last_seen,
    has_submitted,
    hot_score
  FROM company_agg
  WHERE
    CASE p_filter
      WHEN 'unsubmitted' THEN has_submitted = FALSE
      WHEN 'hot' THEN hot_score >= 30
      ELSE TRUE
    END
  ORDER BY last_seen DESC
  LIMIT p_limit;
$$;

-- 권한: 기존 RPC와 동일 패턴 (SECURITY INVOKER + RLS는 underlying table들이 보호)
GRANT EXECUTE ON FUNCTION submitter_behavior(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION company_activity(INTEGER, INTEGER, TEXT) TO authenticated;
```

- [ ] **Step 2: 로컬 supabase에 마이그레이션 적용**

`pnpm` 스크립트 확인 (`package.json`의 scripts 중 db 관련 명령 찾기). 일반적으로는:

```bash
pnpm supabase db push
```

또는 (로컬 supabase 대신 remote dev project를 쓰는 경우):
```bash
pnpm supabase migration up
```

Expected: 026_admin_analytics_v2.sql 적용 성공 메시지.

만약 적용 명령을 모를 경우 사용자에게 적용 방법 물어보고 진행.

- [ ] **Step 3: RPC 직접 호출 검증**

SQL editor에서 두 RPC 모두 호출 가능한지 확인:

```sql
-- 30일 기간 견적 제출자 행동 (현재 시점 - 30일 ~ 현재)
SELECT * FROM submitter_behavior(NOW() - INTERVAL '30 days', NOW());
```

Expected: 단일 행 반환. `submitter_count >= 0`. session_hash 있는 견적이 0건이면 모든 값 0.

```sql
-- 30일 회사별 활동 (전체)
SELECT * FROM company_activity(30, 20, 'all');
SELECT * FROM company_activity(30, 20, 'unsubmitted');
SELECT * FROM company_activity(30, 20, 'hot');
```

Expected: 회사 목록 (asn_company에 (ISP) 미포함된 것만). 데이터가 적으면 빈 결과여도 OK.

- [ ] **Step 4: 마이그레이션 커밋**

```bash
git add supabase/migrations/026_admin_analytics_v2.sql
git commit -m "feat(db): add submitter_behavior and company_activity RPCs"
```

---

## Phase 4 — B1 견적 제출자 프로필

### Task 4.1: 타입과 쿼리 wrapper 추가

**Files:**
- Modify: `src/lib/analytics/queries.ts`

- [ ] **Step 1: 타입 추가**

`src/lib/analytics/queries.ts`의 기존 export type 모음 영역 (line 257 근처 `PostContribution` 뒤)에 추가:

```ts
export type SubmitterTopPage = { path: string; percent: number };

export type SubmitterBehavior = {
  submitter_count: number;
  avg_page_count: number;
  median_time_to_submit_minutes: number;
  bucket_lt_1h: number;
  bucket_lt_3d: number;
  bucket_lt_2w: number;
  bucket_ge_2w: number;
  top_pages: SubmitterTopPage[];
};
```

- [ ] **Step 2: getSubmitterBehavior wrapper 추가**

`queries.ts` 파일 하단 `formatRelativeKo` 함수 바로 앞에 추가:

```ts
export type SubmitterDays = 30 | 90;

export async function getSubmitterBehavior(
  supabase: SupabaseClient,
  days: SubmitterDays = 30
): Promise<SubmitterBehavior> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const { data } = await supabase.rpc("submitter_behavior", {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  });
  const row = (data as Array<Record<string, unknown>> | null)?.[0];
  if (!row) {
    return {
      submitter_count: 0,
      avg_page_count: 0,
      median_time_to_submit_minutes: 0,
      bucket_lt_1h: 0,
      bucket_lt_3d: 0,
      bucket_lt_2w: 0,
      bucket_ge_2w: 0,
      top_pages: [],
    };
  }
  return {
    submitter_count: Number(row.submitter_count ?? 0),
    avg_page_count: Number(row.avg_page_count ?? 0),
    median_time_to_submit_minutes: Number(row.median_time_to_submit_minutes ?? 0),
    bucket_lt_1h: Number(row.bucket_lt_1h ?? 0),
    bucket_lt_3d: Number(row.bucket_lt_3d ?? 0),
    bucket_lt_2w: Number(row.bucket_lt_2w ?? 0),
    bucket_ge_2w: Number(row.bucket_ge_2w ?? 0),
    top_pages: (row.top_pages as SubmitterTopPage[] | null) ?? [],
  };
}
```

- [ ] **Step 3: typecheck**

```bash
pnpm typecheck
```
Expected: 에러 없음.

---

### Task 4.2: SubmitterProfile 컴포넌트 작성

**Files:**
- Create: `src/app/admin/(authenticated)/analytics/_components/submitter-profile.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
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
```

- [ ] **Step 2: typecheck**

```bash
pnpm typecheck
```
Expected: 에러 없음.

---

### Task 4.3: SubmitterProfile를 여정 탭에 통합

**Files:**
- Modify: `src/app/admin/(authenticated)/analytics/page.tsx`

- [ ] **Step 1: import 추가**

```tsx
import { SubmitterProfile } from "./_components/submitter-profile";
import { getSubmitterBehavior, type SubmitterDays } from "@/lib/analytics/queries";
```

(`getSubmitterBehavior`와 `SubmitterDays`는 기존 `queries` import에 추가)

- [ ] **Step 2: searchParams에서 sb (submitter days) 파라미터 파싱**

`AnalyticsPage` 함수 시그니처와 파싱 부분 수정:

```tsx
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ win?: string; tab?: string; sb?: string }>;
}) {
  await requireAdmin();
  const { win: winParam, tab: tabParam, sb: sbParam } = await searchParams;
  // ... 기존 win/tab 파싱
  const submitterDays: SubmitterDays = sbParam === "90" ? 90 : 30;
```

- [ ] **Step 3: Promise.all에 getSubmitterBehavior 추가**

```tsx
const [
  visitorStats,
  // ...
  postsContribution,
  submitterBehavior,  // ← 추가
  quoteCurRes,
  quotePrevRes,
] = await Promise.all([
  // ...
  getPostsContribution(supabase),
  getSubmitterBehavior(supabase, submitterDays),  // ← 추가
  // ...
]);
```

- [ ] **Step 4: 여정 탭의 TODO 자리에 컴포넌트 삽입**

여정 탭 JSX 내, `<HotVisitors>` 섹션 뒤에 추가:

```tsx
<section className="space-y-4">
  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">제출자 행동</h2>
  <SubmitterProfile
    data={submitterBehavior}
    days={submitterDays}
    win={win}
    tab={tab}
  />
</section>
```

(`{/* TODO Phase 4: <SubmitterProfile ... */}` 주석 자리 또는 그 근처. 견적 퍼널 위 또는 아래 — 가독성 보고 결정.)

- [ ] **Step 5: typecheck + 브라우저 확인**

```bash
pnpm typecheck && pnpm dev
```

브라우저 확인:
- `/admin/analytics?tab=journey` → SubmitterProfile 카드 보임
- 표본 부족(<5) 시 빈 상태 메시지
- `?sb=90` 토글 시 90일 데이터로 갱신, 30/90 토글 활성 표시 변경
- 다른 탭 클릭해도 sb 파라미터 무시됨 (영향 없음)

- [ ] **Step 6: 커밋**

```bash
git add src/lib/analytics/queries.ts src/app/admin/\(authenticated\)/analytics/_components/submitter-profile.tsx src/app/admin/\(authenticated\)/analytics/page.tsx
git commit -m "feat(analytics): add submitter behavior profile on journey tab"
```

---

## Phase 5 — B2 회사별 활동

### Task 5.1: 타입과 쿼리 wrapper 추가

**Files:**
- Modify: `src/lib/analytics/queries.ts`

- [ ] **Step 1: 타입 추가**

`SubmitterBehavior` 타입 다음에 추가:

```ts
export type CompanyActivityFilter = "all" | "unsubmitted" | "hot";

export type CompanyActivityRow = {
  asn_company: string;
  visitor_count: number;
  session_count: number;
  last_seen: string;
  has_submitted: boolean;
  hot_score: number;
};
```

- [ ] **Step 2: wrapper 함수 추가**

`getSubmitterBehavior` 함수 다음에 추가:

```ts
export async function getCompanyActivity(
  supabase: SupabaseClient,
  days: number = 30,
  limit: number = 20,
  filter: CompanyActivityFilter = "all"
): Promise<CompanyActivityRow[]> {
  const { data } = await supabase.rpc("company_activity", {
    p_days: days,
    p_limit: limit,
    p_filter: filter,
  });
  return ((data as CompanyActivityRow[] | null) ?? []).map((r) => ({
    asn_company: r.asn_company,
    visitor_count: Number(r.visitor_count),
    session_count: Number(r.session_count),
    last_seen: r.last_seen,
    has_submitted: Boolean(r.has_submitted),
    hot_score: Number(r.hot_score),
  }));
}
```

- [ ] **Step 3: typecheck**

```bash
pnpm typecheck
```
Expected: 에러 없음.

---

### Task 5.2: CompanyActivity 컴포넌트 작성

**Files:**
- Create: `src/app/admin/(authenticated)/analytics/_components/company-activity.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
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
```

- [ ] **Step 2: typecheck**

```bash
pnpm typecheck
```
Expected: 에러 없음.

---

### Task 5.3: CompanyActivity를 여정 탭에 통합

**Files:**
- Modify: `src/app/admin/(authenticated)/analytics/page.tsx`

- [ ] **Step 1: import 추가**

```tsx
import { CompanyActivity } from "./_components/company-activity";
import {
  getCompanyActivity,
  type CompanyActivityFilter,
} from "@/lib/analytics/queries";
```

(기존 imports에 통합)

- [ ] **Step 2: searchParams에서 cf (company filter) 파라미터 파싱**

기존 sb 파라미터 파싱 부분 옆에 추가:

```tsx
const { win: winParam, tab: tabParam, sb: sbParam, cf: cfParam } = await searchParams;
// ...
const companyFilter: CompanyActivityFilter =
  cfParam === "unsubmitted" || cfParam === "hot" ? cfParam : "all";
```

searchParams 타입도 업데이트:

```tsx
searchParams: Promise<{ win?: string; tab?: string; sb?: string; cf?: string }>;
```

- [ ] **Step 3: Promise.all에 getCompanyActivity 추가**

```tsx
const [
  // ...
  submitterBehavior,
  companyActivity,  // ← 추가
  quoteCurRes,
  quotePrevRes,
] = await Promise.all([
  // ...
  getSubmitterBehavior(supabase, submitterDays),
  getCompanyActivity(supabase, 30, 20, companyFilter),  // ← 추가
  // ...
]);
```

- [ ] **Step 4: 여정 탭에 CompanyActivity 추가**

`SubmitterProfile` 섹션 다음에 추가:

```tsx
<section className="space-y-4">
  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">회사별 활동</h2>
  <CompanyActivity
    rows={companyActivity}
    filter={companyFilter}
    win={win}
    tab={tab}
  />
</section>
```

- [ ] **Step 5: typecheck + 브라우저 확인**

```bash
pnpm typecheck && pnpm dev
```

브라우저:
- `/admin/analytics?tab=journey` → CompanyActivity 테이블 보임
- `?cf=unsubmitted`, `?cf=hot` 토글 동작 확인
- ISP 분류된 회사가 안 보이는지 (KT/SK/LG (ISP) 포함되지 않음)
- 빈 상태 메시지가 필터별로 다르게 표시되는지

- [ ] **Step 6: 커밋**

```bash
git add src/lib/analytics/queries.ts src/app/admin/\(authenticated\)/analytics/_components/company-activity.tsx src/app/admin/\(authenticated\)/analytics/page.tsx
git commit -m "feat(analytics): add company activity table on journey tab"
```

---

## Phase 6 — 다듬기

### Task 6.1: 빈 상태와 모바일 점검

**Files:**
- (확인만 — 필요시 컴포넌트 마이너 수정)

- [ ] **Step 1: 모든 신규 컴포넌트의 빈 상태 점검**

`pnpm dev` 실행 후 다음 시나리오 확인:

1. **데이터 없는 dev 환경에서:**
   - `PostsContribution`: "아직 분석할 포스트 방문이 없습니다." 보임
   - `SubmitterProfile`: "데이터가 부족합니다 (N=0, 최소 5건 필요)" 보임
   - `CompanyActivity` (all): "ASN 식별된 방문이 아직 없습니다." 보임
   - `CompanyActivity` (unsubmitted): "필터를 '전체'로 바꿔보세요." 보임
   - `CompanyActivity` (hot): "Hot 점수 30 이상인 회사가 없습니다." 보임

2. **모바일 폭(375px)에서:**
   - 탭 nav 가 가로 스크롤 또는 wrap 잘 됨
   - `CompanyActivity` 테이블이 가로 스크롤 가능 (이미 `overflow-x-auto` 적용)
   - `SubmitterProfile`의 2-컬럼 그리드가 1-컬럼으로 떨어짐
   - `PostsContribution`의 5-컬럼 그리드 줄이 작게 표시됨

수정 필요시 컴포넌트 패딩/breakpoint 조정. 이미 잘 처리되어 있으면 패스.

- [ ] **Step 2: 키보드 네비게이션 점검**

브라우저에서 Tab 키만으로 탭들 사이 이동 가능한지:
- TabsNav의 4개 탭이 Tab으로 순차 포커스됨
- Enter 또는 Space로 활성화됨
- 각 카드 내부 액션(필터 토글, 정렬 등)도 키보드 접근 가능

기존 컴포넌트들이 `<Link>` + `<button>` 패턴 사용하므로 기본 접근성은 확보됨. 추가 작업 불필요면 패스.

- [ ] **Step 3: 점검 결과 메모 (수정 없으면 커밋 없이 다음 task로)**

수정한 게 있으면:
```bash
git add -p   # 의도한 변경만 stage
git commit -m "polish(analytics): tweak empty states and mobile layout"
```

---

### Task 6.2: 최종 통합 검증

**Files:** 없음 (E2E 검증)

- [ ] **Step 1: 빌드 통과 확인**

```bash
pnpm build
```
Expected: 빌드 성공. 모든 라우트가 generate되고 에러 없음.

- [ ] **Step 2: dev 서버에서 전체 흐름 확인**

```bash
pnpm dev
```

체크리스트 (체크 표시하며):
- [ ] `/admin/analytics` 진입 → 기본 = 개요 탭
- [ ] 개요 탭: HeroMetrics 4개, VisitorChart, Hot Visitors TOP 6 보임
- [ ] 트래픽 탭: ReferrerPanel/DevicePanel/HeatmapGrid/RegionPanel/AiCrawlerBadge/RecentFeed 보임
- [ ] 콘텐츠 탭: PopularPages + PostsContribution 2-컬럼 보임
- [ ] 여정 탭: Hot Visitors 전체 + 견적 퍼널(FunnelCard+FormFunnel) + SubmitterProfile + CompanyActivity 보임
- [ ] WindowTabs (7/30일) 변경 시 활성 탭 유지됨
- [ ] sb 토글 (30/90일) 시 SubmitterProfile만 갱신, 다른 카드 영향 없음
- [ ] cf 토글 (전체/미제출/Hot) 시 CompanyActivity만 갱신
- [ ] 권한 없는 사용자 (비-admin 또는 로그아웃) 진입 시 redirect (기존 `requireAdmin` 동작)
- [ ] `/admin/analytics/sessions/[hash]` 클릭 시 기존 세션 상세로 이동 (Hot Visitors에서)

- [ ] **Step 3: 최종 커밋 (필요시) 및 PR 준비**

추가 수정 없으면 새 커밋 없음. PR 생성은 사용자 지시 후에만:

```bash
# 사용자 명시적 지시 시에만 실행
git push -u origin <branch-name>
gh pr create --base main --title "feat(analytics): admin analytics v2 — tabs + 3 new analyses" --body "..."
```

`AGENTS.md`에 따라 PR 머지는 사용자 명시 지시 시에만.

---

## 자체 검토 결과

- **Spec 커버리지**: 4탭 구조(섹션 4.1), 신규 컴포넌트 3개(섹션 4.2), 신규 RPC 2개(섹션 4.3), 데이터 한계 처리(섹션 4.4), 구현 순서(섹션 5), 위험 항목(섹션 7) 모두 task에 매핑됨.
- **플레이스홀더**: TBD/TODO 없음. 모든 코드 블록은 실제 작성 가능한 내용.
- **타입 일관성**: `AnalyticsTab`, `TimeWindow`, `SubmitterDays`, `CompanyActivityFilter` 모두 queries.ts에 정의되고 page.tsx + 컴포넌트에서 일관 사용.
- **위험 대응**:
  - ISP 제외: `asn_company NOT LIKE '%(ISP)%'` (실제 `asn.ts:25` 컨벤션 확인 완료).
  - 표본 작음: `SubmitterProfile`에 `MIN_SAMPLE=5` 빈 상태.
  - `posts_contribution` RPC 미동작 위험: Task 2.1에서 사전 검증.
- **테스트 컨벤션**: spec 합의대로 unit test 없음. 모든 검증은 SQL 직접 호출 + 브라우저 시각 확인.
