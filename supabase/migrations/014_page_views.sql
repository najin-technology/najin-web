-- ============================================================
-- 자체 페이지뷰 분석
-- GA4/Naver Analytics 대신 익명 로컬 집계로 admin 대시보드에 바로 표시.
-- 개인정보 최소화: session_hash는 SHA-256(ip + user-agent + day_salt).
-- ============================================================

CREATE TABLE page_views (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  session_hash TEXT NOT NULL,
  referrer_host TEXT,
  referrer_category TEXT NOT NULL DEFAULT 'direct',
  device_class TEXT NOT NULL DEFAULT 'desktop',
  browser TEXT,
  country TEXT,
  city TEXT,
  locale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX page_views_path_created_idx ON page_views (path, created_at DESC);
CREATE INDEX page_views_session_path_idx ON page_views (session_hash, path, created_at DESC);
CREATE INDEX page_views_referrer_category_idx ON page_views (referrer_category, created_at DESC);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- anon/authenticated는 insert만, read는 admin만.
DROP POLICY IF EXISTS "Anyone can insert page view" ON page_views;
CREATE POLICY "Anyone can insert page view"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read page views" ON page_views;
CREATE POLICY "Admin can read page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can delete page views" ON page_views;
CREATE POLICY "Admin can delete page views"
  ON page_views FOR DELETE
  TO authenticated
  USING (is_admin());
