# Admin Analytics v2 — 콘텐츠 ROI & 고객 여정 분석

- 날짜: 2026-05-14
- 작성자: hyeonjae (with Claude)
- 상태: Draft (브레인스토밍 결과)
- 다음 단계: writing-plans 스킬로 상세 구현 계획 작성

---

## 1. 배경 / Why

나진테크 admin dashboard의 `/admin/analytics` 페이지는 이미 12개 섹션이 구현되어 있으나, B2B 사출/금형 사업의 핵심 질문에 충분히 답하지 못한다.

**현재 답할 수 없는 질문:**
- 어떤 블로그 사례글이 실제 견적으로 이어지는가? (콘텐츠 ROI)
- 견적 제출자는 제출 전 어떤 동선을 거치는가? (영업 인사이트)
- 같은 회사에서 여러 사람이 방문하는데, 견적을 안 낸 곳은 어디인가? (B2B 영업 우선순위)

데이터는 이미 수집되고 있다 (`page_views.asn_company`, `quotes.session_hash`, `posts_contribution()` RPC). 시각화만 추가하면 된다.

---

## 2. 목표 / Goals

1. 기존 12개 섹션을 4개 탭으로 재편 — 페이지 길이 부담 해소
2. 3개 신규 분석 추가:
   - **A1.** 블로그 포스트별 견적 기여도
   - **B1.** 견적 제출자 행동 프로필
   - **B2.** 회사별 활동 추적 (ASN 기반)
3. 차트 라이브러리 추가 없이 기존 SVG/HTML 패턴 유지

## Non-goals

- 회사 상세 페이지 (`/admin/analytics/companies/[asn]`) — 후속
- 운영 효율성 분석 (work_orders 리드타임 등) — 후속
- 채용 분석 (applications) — 후속
- 차트 라이브러리(recharts 등) 도입 — 후속
- 검색 키워드 / UTM 캠페인 분석 — 후속

---

## 3. 현재 상태 (요약)

**기존 페이지:** `src/app/admin/(authenticated)/analytics/page.tsx`

**기존 컴포넌트 12개** (`src/app/admin/(authenticated)/analytics/_components/*`):
- `hero-metrics`, `hot-visitors`, `visitor-chart`, `referrer-panel`, `device-panel`, `region-panel`, `heatmap-grid`, `popular-pages`, `form-funnel`, `funnel-card`, `ai-crawler-badge`, `recent-feed`

**기존 RPC** (`supabase/migrations/014-016`):
- `count_unique_sessions`, `daily_page_views`, `popular_pages`, `lead_score_for_session`, `hot_visitors`, `session_journey`, `posts_contribution`, `ai_crawler_stats`, `hour_day_heatmap`, `region_breakdown`, `quote_form_funnel`

**활용되지 않는 데이터:**
- `posts_contribution()` RPC — 정의되어 있으나 UI 미연결
- `quotes.session_hash` — 마이그레이션 016에서 추가, 견적 제출 시 기록 중이지만 분석 미사용
- `page_views.asn_company` — Hot Visitors에만 노출, 회사 그룹핑 없음

---

## 4. 디자인

### 4.1 탭 구조

상단 헤더(기간 셀렉터) 아래에 4개 탭. URL 파라미터(`?tab=overview`) 기반으로 상태 유지 → 공유 가능.

| 탭 | 목적 | 포함 컴포넌트 |
|---|---|---|
| **개요 (Overview)** | 한눈에 보는 경영 지표 | KPI 카드 4종, 일일 추이, Hot Visitors TOP 6 (요약) |
| **트래픽 (Traffic)** | 누가 어디서 오는가 | 유입경로, 기기, 지역, 히트맵, AI 크롤러, 최근 방문 피드 |
| **콘텐츠 (Content)** | 어떤 페이지가 일하는가 | 인기 페이지, **🆕 블로그 기여도(A1)** |
| **여정 (Journey)** | 누가 견적까지 가는가 | **🆕 제출자 프로필(B1)**, **🆕 회사별 활동(B2)**, Hot Visitors 전체, 견적 퍼널, 폼 필드별 이탈 |

### 4.2 신규 컴포넌트 상세

#### A1. 블로그 포스트 기여도 (`<PostsContribution>`)

- 위치: 콘텐츠 탭
- 데이터: 기존 `posts_contribution()` RPC
- 표시: 포스트 제목 / 방문 / 견적 시작 / 제출 / 기여율 (TOP 10, 30일)
- 정렬: 제출 수 DESC, 동률시 기여율 DESC
- 최고 전환율 포스트 강조 (✨ 또는 색상)

#### B1. 견적 제출자 프로필 (`<SubmitterProfile>`)

- 위치: 여정 탭
- 데이터: 신규 RPC `submitter_behavior(start, end)`
- 표시:
  - 첫 방문 → 제출까지 시간 중앙값 + 분포 4구간 (1시간 미만 / 당일~3일 / 4일~2주 / 2주 이상)
  - 제출 전 평균 본 페이지 수, 평균 세션 수
  - 제출 전 가장 많이 본 페이지 TOP 5 (퍼센트)
- 기간 토글: 30/90일
- 빈 상태 (N < 5): "데이터 부족, 더 많은 견적이 필요합니다"

#### B2. 회사별 활동 (`<CompanyActivity>`)

- 위치: 여정 탭
- 데이터: 신규 RPC `company_activity(days, limit, filter)`
- 표시: 회사명(ASN) / 방문자 수 / 세션 수 / 마지막 방문 / 견적 제출 여부 / 상태 배지
- 필터: 전체 / 미제출만 / hot만
- 정렬: 마지막 방문 DESC
- ISP(통신사) 제외
- 행 클릭 → 기존 세션 상세 페이지로 (회사 상세 페이지는 이번 범위 외)

### 4.3 Backend / DB

**신규 마이그레이션:** `supabase/migrations/026_admin_analytics_v2.sql`

**RPC 1: `submitter_behavior(p_start, p_end)`**
```
returns:
  submitter_count INTEGER
  avg_page_count NUMERIC
  avg_session_count NUMERIC
  median_time_to_submit_minutes INTEGER
  bucket_lt_1h INTEGER
  bucket_lt_3d INTEGER
  bucket_lt_2w INTEGER
  bucket_ge_2w INTEGER
  top_pages JSONB  -- [{path, percent}, ...] TOP 5
```
로직: `quotes` WHERE `session_hash IS NOT NULL` AND created_at IN range → `page_views`에서 session 별 첫방문/마지막방문(=quote 직전)/페이지 카운트 집계.

**RPC 2: `company_activity(p_days, p_limit, p_filter)`**
```
returns:
  asn_company TEXT
  visitor_count INTEGER  -- 고유 세션 수
  session_count INTEGER  -- 방문 횟수
  last_seen TIMESTAMPTZ
  has_submitted BOOLEAN
  hot_score INTEGER      -- 회사 내 최고 점수
```
필터: `'all' | 'unsubmitted' | 'hot'`. ISP 제외 로직은 구현 단계에서 기존 `asn_company` 분류 코드(`src/lib/analytics/classify.ts`)를 확인하여 결정.

**RPC 3:** `posts_contribution()` — 기존, 변경 없음. wrapper 함수만 `src/lib/analytics/queries.ts`에 추가.

**권한**: 모든 신규 RPC는 `SECURITY DEFINER` + admin role 체크 (기존 016 패턴 동일).

### 4.4 데이터 한계 & UX 처리

- `session_hash`가 NULL인 옛날 견적은 B1/B2 분석에서 제외. 카드 하단 작은 글씨로 "신규 견적부터 추적" 노트.
- 표본 N < 5일 때 명시적 빈 상태.
- ISP만 식별된 방문자는 B2에서 제외 (KT/SK 등이 회사로 잘못 표기되지 않도록).

---

## 5. 구현 순서

각 Phase는 독립적으로 PR 가능.

1. **Phase 1 — 탭 인프라** (0.5일): 동작 변경 없이 기존 12개 섹션을 4개 탭에 분배
2. **Phase 2 — A1 블로그 기여도** (0.5일): wrapper 함수 + 컴포넌트
3. **Phase 3 — DB 마이그레이션** (0.5일): RPC 2개 작성 + 로컬 검증
4. **Phase 4 — B1 제출자 프로필** (0.5일)
5. **Phase 5 — B2 회사별 활동** (1일): ISP 제외 로직 포함
6. **Phase 6 — 다듬기** (0.5일): 빈 상태/모바일/접근성

**총 예상: 3–3.5일**

---

## 6. 테스트 전략

- **RPC**: supabase SQL editor에서 직접 호출, 시드 데이터로 결과 검증
- **쿼리 함수**: 기존 `try/catch + null fallback` 패턴
- **컴포넌트 단위 테스트**: 없음 (기존 analytics 컴포넌트 컨벤션 따라감)
- **Manual QA**:
  - 빈 데이터 (session_hash 없는 옛 견적만)
  - 작은 표본 (N=1, N=3)
  - 정상 표본
  - ISP만 식별된 방문자가 B2에서 제외되는지

**회귀 방지**: Phase 1 후 기존 12개 섹션 모두 탭에서 동작 확인. 일반 사용자 페이지(`/quote` 등)는 변경 없음.

---

## 7. 위험과 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| ISP 제외 로직 부재 | B2에서 KT/SK 같은 통신사가 "회사"로 표기 | `classify.ts`의 기존 분류 활용 또는 ASN org 키워드 필터 추가 |
| 표본이 작아 인사이트 약함 | B1/B2가 의미 없는 숫자 | 빈 상태 메시지로 솔직하게 노출 |
| `posts_contribution` RPC 동작 미확인 | A1이 빈 데이터 표시 | Phase 2 시작 시 RPC 직접 호출로 검증, 필요시 016 RPC 수정 |
| 탭 도입으로 기존 사용자 혼란 | 처음 진입 시 정보가 안 보임 | 기본 탭 = 개요. URL 공유로 직접 접근 가능 |

---

## 8. Out of Scope (후속 작업으로 분리)

- 회사 상세 페이지 (`/admin/analytics/companies/[asn]`)
- 랜딩 페이지별 전환율 분석 (A3)
- 운영 효율성 (work_orders 리드타임, 견적 처리 시간)
- 채용 분석 (applications 합격률, 소요 시간)
- 차트 라이브러리(recharts 등) 도입
- 검색 키워드 / UTM 캠페인 추적
