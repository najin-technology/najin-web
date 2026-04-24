-- ============================================================
-- Analytics 심화 확장: Tier 1/2/3
-- - Tier 1: ASN/회사 식별 + 리드 스코어링 + 세션 여정
-- - Tier 2: 콘텐츠 기여도 (quotes.session_hash)
-- - Tier 3: 폼 이탈 · AI 크롤러 · heatmap · 지역
-- ============================================================

-- page_views 확장: ASN/회사 정보
ALTER TABLE page_views
  ADD COLUMN IF NOT EXISTS asn_org TEXT,
  ADD COLUMN IF NOT EXISTS asn_company TEXT;

CREATE INDEX IF NOT EXISTS page_views_asn_company_idx ON page_views (asn_company)
  WHERE asn_company IS NOT NULL;

-- IP → ASN 캐시 (hash 단위, 7일 TTL)
CREATE TABLE IF NOT EXISTS ip_asn_cache (
  ip_hash TEXT PRIMARY KEY,
  asn TEXT,
  asn_org TEXT,
  asn_company TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ip_asn_cache_cached_at_idx ON ip_asn_cache (cached_at);

ALTER TABLE ip_asn_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can upsert ip asn cache" ON ip_asn_cache;
CREATE POLICY "Anyone can upsert ip asn cache"
  ON ip_asn_cache FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- 견적 폼 이벤트 (필드 fill 추적)
CREATE TABLE IF NOT EXISTS quote_form_events (
  id BIGSERIAL PRIMARY KEY,
  session_hash TEXT NOT NULL,
  field TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('focus', 'fill', 'blur_empty', 'submit', 'abandon')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quote_form_events_session_idx ON quote_form_events (session_hash, created_at);
CREATE INDEX IF NOT EXISTS quote_form_events_field_action_idx ON quote_form_events (field, action, created_at DESC);

ALTER TABLE quote_form_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert quote form events" ON quote_form_events;
CREATE POLICY "Anyone can insert quote form events"
  ON quote_form_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read quote form events" ON quote_form_events;
CREATE POLICY "Admin can read quote form events"
  ON quote_form_events FOR SELECT TO authenticated
  USING (is_admin());

-- quotes에 session_hash 추가 (어느 세션이 제출했나)
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS session_hash TEXT;

CREATE INDEX IF NOT EXISTS quotes_session_hash_idx ON quotes (session_hash)
  WHERE session_hash IS NOT NULL;

-- ============================================================
-- SQL 함수들
-- ============================================================

-- 리드 스코어: 세션별 행동 점수
CREATE OR REPLACE FUNCTION lead_score_for_session(target_session TEXT)
RETURNS INTEGER
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  WITH session_pv AS (
    SELECT path, asn_company, created_at, country
    FROM page_views
    WHERE session_hash = target_session
      AND device_class != 'bot'
      AND device_class != 'ai-crawler'
  ),
  scores AS (
    SELECT
      COUNT(*) FILTER (WHERE path ILIKE '%/business%') * 3 AS business_pts,
      COUNT(*) FILTER (WHERE path ILIKE '%/portfolio%') * 5 AS portfolio_pts,
      COUNT(*) FILTER (WHERE path ILIKE '%/posts/%') * 3 AS posts_pts,
      (CASE WHEN EXISTS(SELECT 1 FROM session_pv WHERE path ILIKE '%/quote%') THEN 10 ELSE 0 END) AS quote_view_pts,
      (CASE WHEN (SELECT COUNT(*) FROM session_pv) > 4 THEN 10 ELSE 0 END) AS revisit_pts,
      (CASE WHEN (SELECT MAX(asn_company) FROM session_pv WHERE asn_company IS NOT NULL) IS NOT NULL THEN 20 ELSE 0 END) AS enterprise_pts,
      (CASE WHEN (SELECT MAX(country) FROM session_pv) = 'KR' THEN 2 ELSE 0 END) AS kr_pts,
      (CASE WHEN EXISTS(
        SELECT 1 FROM session_pv
        WHERE EXTRACT(ISODOW FROM created_at AT TIME ZONE 'Asia/Seoul') < 6
          AND EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Seoul') BETWEEN 9 AND 17
      ) THEN 3 ELSE 0 END) AS business_hours_pts,
      (CASE WHEN EXISTS(SELECT 1 FROM quotes WHERE session_hash = target_session AND deleted_at IS NULL) THEN 50 ELSE 0 END) AS submit_pts
    FROM session_pv
  )
  SELECT
    COALESCE(business_pts + portfolio_pts + posts_pts + quote_view_pts + revisit_pts + enterprise_pts + kr_pts + business_hours_pts + submit_pts, 0)::INTEGER
  FROM scores;
$$;

-- 주목할 방문자: 최근 7일 중 점수 상위
CREATE OR REPLACE FUNCTION hot_visitors(row_limit INTEGER DEFAULT 15)
RETURNS TABLE (
  session_hash TEXT,
  score INTEGER,
  asn_company TEXT,
  country TEXT,
  city TEXT,
  visit_count INTEGER,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  submitted BOOLEAN,
  sample_path TEXT
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  WITH sessions AS (
    SELECT
      pv.session_hash,
      MAX(pv.asn_company) AS asn_company,
      MAX(pv.country) AS country,
      MAX(pv.city) AS city,
      COUNT(*)::INTEGER AS visit_count,
      MIN(pv.created_at) AS first_seen,
      MAX(pv.created_at) AS last_seen,
      EXISTS(SELECT 1 FROM quotes q WHERE q.session_hash = pv.session_hash AND q.deleted_at IS NULL) AS submitted,
      (ARRAY_AGG(pv.path ORDER BY pv.created_at DESC))[1] AS sample_path
    FROM page_views pv
    WHERE pv.created_at >= NOW() - INTERVAL '7 days'
      AND pv.device_class NOT IN ('bot', 'ai-crawler')
    GROUP BY pv.session_hash
    HAVING COUNT(*) > 1 OR MAX(pv.asn_company) IS NOT NULL
  )
  SELECT
    s.session_hash,
    lead_score_for_session(s.session_hash) AS score,
    s.asn_company,
    s.country,
    s.city,
    s.visit_count,
    s.first_seen,
    s.last_seen,
    s.submitted,
    s.sample_path
  FROM sessions s
  ORDER BY score DESC, last_seen DESC
  LIMIT row_limit;
$$;

-- 세션 여정: 주어진 세션의 방문 타임라인
CREATE OR REPLACE FUNCTION session_journey(target_session TEXT)
RETURNS TABLE (
  id BIGINT,
  path TEXT,
  referrer_category TEXT,
  referrer_host TEXT,
  device_class TEXT,
  browser TEXT,
  country TEXT,
  city TEXT,
  asn_org TEXT,
  asn_company TEXT,
  locale TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    id, path, referrer_category, referrer_host,
    device_class, browser, country, city, asn_org, asn_company, locale, created_at
  FROM page_views
  WHERE session_hash = target_session
  ORDER BY created_at ASC;
$$;

-- 콘텐츠 기여도: 특정 posts/[slug]를 본 세션 중 견적 제출 수
CREATE OR REPLACE FUNCTION posts_contribution()
RETURNS TABLE (
  slug TEXT,
  post_views INTEGER,
  sessions_viewed INTEGER,
  quotes_from_viewers INTEGER,
  conversion_pct NUMERIC
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  WITH post_views AS (
    SELECT
      SUBSTRING(path FROM '/posts/([^/?#]+)') AS slug,
      session_hash,
      COUNT(*) OVER () AS total_views
    FROM page_views
    WHERE path ~ '^/(ko|en|zh)?/?posts/[^/]+$'
      AND device_class NOT IN ('bot', 'ai-crawler')
      AND created_at >= NOW() - INTERVAL '90 days'
  ),
  agg AS (
    SELECT
      slug,
      COUNT(*)::INTEGER AS post_views,
      COUNT(DISTINCT session_hash)::INTEGER AS sessions_viewed,
      COUNT(DISTINCT session_hash) FILTER (
        WHERE EXISTS(
          SELECT 1 FROM quotes q
          WHERE q.session_hash = post_views.session_hash AND q.deleted_at IS NULL
        )
      )::INTEGER AS quotes_from_viewers
    FROM post_views
    WHERE slug IS NOT NULL
    GROUP BY slug
  )
  SELECT
    slug,
    post_views,
    sessions_viewed,
    quotes_from_viewers,
    (CASE WHEN sessions_viewed = 0 THEN 0
          ELSE ROUND((quotes_from_viewers::NUMERIC / sessions_viewed) * 100, 2)
     END) AS conversion_pct
  FROM agg
  ORDER BY quotes_from_viewers DESC, sessions_viewed DESC;
$$;

-- AI 크롤러 집계 (최근 30일)
CREATE OR REPLACE FUNCTION ai_crawler_stats()
RETURNS TABLE (
  browser TEXT,
  visits INTEGER,
  last_seen TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    COALESCE(browser, 'unknown') AS browser,
    COUNT(*)::INTEGER AS visits,
    MAX(created_at) AS last_seen
  FROM page_views
  WHERE device_class = 'ai-crawler'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY browser
  ORDER BY visits DESC;
$$;

-- 요일 × 시간 heatmap (Asia/Seoul, 최근 30일)
CREATE OR REPLACE FUNCTION hour_day_heatmap()
RETURNS TABLE (
  day_of_week INTEGER,
  hour INTEGER,
  visits INTEGER
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    EXTRACT(ISODOW FROM created_at AT TIME ZONE 'Asia/Seoul')::INTEGER AS day_of_week,
    EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Seoul')::INTEGER AS hour,
    COUNT(*)::INTEGER AS visits
  FROM page_views
  WHERE device_class NOT IN ('bot', 'ai-crawler')
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY day_of_week, hour
  ORDER BY day_of_week, hour;
$$;

-- 지역 분포 (국가 + 시도, 최근 30일)
CREATE OR REPLACE FUNCTION region_breakdown(row_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  country TEXT,
  city TEXT,
  visits INTEGER,
  uniques INTEGER
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    COALESCE(country, 'Unknown') AS country,
    COALESCE(city, 'Unknown') AS city,
    COUNT(*)::INTEGER AS visits,
    COUNT(DISTINCT session_hash)::INTEGER AS uniques
  FROM page_views
  WHERE device_class NOT IN ('bot', 'ai-crawler')
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY country, city
  ORDER BY visits DESC
  LIMIT row_limit;
$$;

-- 견적 폼 퍼널 (필드별 fill 비율, 최근 30일)
CREATE OR REPLACE FUNCTION quote_form_funnel()
RETURNS TABLE (
  field TEXT,
  starts INTEGER,
  fills INTEGER,
  fill_pct NUMERIC
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  WITH agg AS (
    SELECT
      field,
      COUNT(*) FILTER (WHERE action = 'focus')::INTEGER AS starts,
      COUNT(*) FILTER (WHERE action = 'fill')::INTEGER AS fills
    FROM quote_form_events
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY field
  )
  SELECT
    field,
    starts,
    fills,
    (CASE WHEN starts = 0 THEN 0
          ELSE ROUND((fills::NUMERIC / starts) * 100, 2)
     END) AS fill_pct
  FROM agg
  ORDER BY starts DESC;
$$;
