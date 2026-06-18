-- ============================================================
-- site_settings: 사이트 전역 설정 (singleton id=1)
-- 현재: 견적 접수 일시중지 토글 + 언어별 안내문.
-- site_about 패턴(anon read / admin update) 동일.
-- ============================================================

CREATE TABLE site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  quotes_paused BOOLEAN NOT NULL DEFAULT FALSE,
  pause_message_ko TEXT NOT NULL DEFAULT '',
  pause_message_en TEXT NOT NULL DEFAULT '',
  pause_message_zh TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 공개 페이지(견적)에서 일시중지 상태/안내문을 읽어야 하므로 anon read 허용.
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can read site settings"
  ON site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can update site settings"
  ON site_settings FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
