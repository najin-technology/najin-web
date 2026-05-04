-- ============================================================
-- site_about: about 페이지 편집 가능 콘텐츠 (CEO 인사말 등)
-- singleton (id=1) 패턴
-- 거래처 실명 / CEO 실명 등 민감 콘텐츠를 코드(i18n)에서 분리하여 DB 로 이동.
-- ============================================================

CREATE TABLE site_about (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  ceo_name_ko TEXT NOT NULL DEFAULT '',
  ceo_name_en TEXT NOT NULL DEFAULT '',
  ceo_name_zh TEXT NOT NULL DEFAULT '',
  ceo_greeting_ko TEXT NOT NULL DEFAULT '',
  ceo_greeting_en TEXT NOT NULL DEFAULT '',
  ceo_greeting_zh TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

INSERT INTO site_about (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER trg_site_about_updated_at
  BEFORE UPDATE ON site_about
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE site_about ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site about"
  ON site_about FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can read site about"
  ON site_about FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can update site about"
  ON site_about FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
