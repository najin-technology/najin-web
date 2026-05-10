-- ============================================================
-- certifications: 회사 인증서 (ISO 9001, CLEAN, 특허 등)
-- 이미지(필수) + 선택적 PDF 원본. 다국어 제목 지원.
-- ============================================================

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ko TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  title_zh TEXT NOT NULL DEFAULT '',
  image_path TEXT NOT NULL,
  pdf_path TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_certifications_published_sort
  ON certifications (is_published, sort_order);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published certifications"
  ON certifications FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE);

CREATE POLICY "Admin full access to certifications"
  ON certifications FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
