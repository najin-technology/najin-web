-- ============================================================
-- 거래처 협업사례 (납품현황) 테이블
-- 출처: 회사 소개 글 (https://blog.naver.com/kinghak1/221437105999)
-- 본 테이블의 모든 row 는 검증된 사실 기록만 포함한다.
-- ============================================================

CREATE TABLE client_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  year INT NOT NULL,
  month INT,
  description_ko TEXT NOT NULL,
  description_en TEXT,
  source TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_client_deliveries_slug
  ON client_deliveries(client_slug, year DESC, month DESC);

ALTER TABLE client_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read client deliveries"
  ON client_deliveries FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admin full access to client deliveries"
  ON client_deliveries FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 시드: 회사 소개 글의 납품현황 16건
-- ============================================================

-- ============================================================
-- 시드: 실 데이터는 scripts/seed/client_deliveries.sql (gitignored) 으로 이전.
-- 신규 환경 구축 시 별도 적용 필요. scripts/seed/README.example.md 참고.
-- ============================================================
