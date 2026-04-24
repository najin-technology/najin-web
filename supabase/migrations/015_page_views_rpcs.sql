-- ============================================================
-- 페이지뷰 집계 RPC
-- admin 전용. SECURITY INVOKER로 RLS(is_admin) 적용.
-- ============================================================

CREATE OR REPLACE FUNCTION count_unique_sessions(start_at TIMESTAMPTZ, end_at TIMESTAMPTZ)
RETURNS INTEGER
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT session_hash)::INTEGER
  FROM page_views
  WHERE created_at >= start_at
    AND created_at < end_at
    AND device_class != 'bot';
$$;

CREATE OR REPLACE FUNCTION daily_page_views(start_at TIMESTAMPTZ, end_at TIMESTAMPTZ)
RETURNS TABLE (day TEXT, visits INTEGER, uniques INTEGER)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul'), 'YYYY-MM-DD') AS day,
    COUNT(*)::INTEGER AS visits,
    COUNT(DISTINCT session_hash)::INTEGER AS uniques
  FROM page_views
  WHERE created_at >= start_at
    AND created_at < end_at
    AND device_class != 'bot'
  GROUP BY DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul')
  ORDER BY day ASC;
$$;

CREATE OR REPLACE FUNCTION popular_pages(
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  row_limit INTEGER DEFAULT 10
)
RETURNS TABLE (path TEXT, count INTEGER, uniques INTEGER)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    page_views.path,
    COUNT(*)::INTEGER AS count,
    COUNT(DISTINCT session_hash)::INTEGER AS uniques
  FROM page_views
  WHERE page_views.created_at >= start_at
    AND page_views.created_at < end_at
    AND device_class != 'bot'
  GROUP BY page_views.path
  ORDER BY count DESC
  LIMIT row_limit;
$$;
