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
