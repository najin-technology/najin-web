-- ============================================================
-- 나진테크 웹사이트 DB 스키마
-- Supabase SQL Editor에서 실행
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- 견적 요청
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  processing_type TEXT NOT NULL,
  material TEXT,
  quantity TEXT,
  deadline DATE,
  description TEXT,
  status TEXT NOT NULL DEFAULT '접수'
    CHECK (status IN ('접수', '검토중', '견적발송', '완료')),
  admin_memo TEXT,
  privacy_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 채용 지원서
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  position TEXT NOT NULL,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT '서류검토'
    CHECK (status IN ('서류검토', '면접예정', '합격', '불합격')),
  admin_memo TEXT,
  privacy_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 첨부파일 메타데이터
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_table TEXT NOT NULL CHECK (parent_table IN ('quotes', 'applications')),
  parent_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 공지사항
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ko TEXT NOT NULL,
  title_en TEXT,
  content_ko TEXT NOT NULL,
  content_en TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 채용 공고
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ko TEXT NOT NULL,
  title_en TEXT,
  department TEXT,
  employment_type TEXT DEFAULT '정규직',
  description_ko TEXT,
  description_en TEXT,
  requirements_ko TEXT,
  requirements_en TEXT,
  benefits_ko TEXT,
  benefits_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  deadline DATE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사업영역/제품
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('우레탄', '합성수지', 'CNC', '금형', 'EV')),
  name_ko TEXT NOT NULL,
  name_en TEXT,
  description_ko TEXT,
  description_en TEXT,
  image_urls TEXT[],
  alt_text_ko TEXT,
  alt_text_en TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 회사 연혁
CREATE TABLE history_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT,
  description_ko TEXT NOT NULL,
  description_en TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX idx_quotes_status ON quotes(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_created ON quotes(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_status ON applications(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_created ON applications(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_attachments_parent ON attachments(parent_table, parent_id);
CREATE INDEX idx_notices_published ON notices(is_published, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_postings_active ON job_postings(is_active, deadline) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_history_items_year ON history_items(year DESC, sort_order);

-- ============================================================
-- 3. AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_items ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- QUOTES: anon can INSERT, admin can do everything
CREATE POLICY "Anyone can submit quotes"
  ON quotes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admin full access to quotes"
  ON quotes FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- APPLICATIONS: anon can INSERT, admin can do everything
CREATE POLICY "Anyone can submit applications"
  ON applications FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admin full access to applications"
  ON applications FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ATTACHMENTS: anon can INSERT, admin can read all
CREATE POLICY "Anyone can upload attachments"
  ON attachments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admin full access to attachments"
  ON attachments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- NOTICES: anyone can read published, admin can do everything
CREATE POLICY "Anyone can read published notices"
  ON notices FOR SELECT
  TO anon
  USING (is_published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin full access to notices"
  ON notices FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- JOB_POSTINGS: anyone can read active, admin can do everything
CREATE POLICY "Anyone can read active job postings"
  ON job_postings FOR SELECT
  TO anon
  USING (is_active = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin full access to job postings"
  ON job_postings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- PRODUCTS: anyone can read active, admin can do everything
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  TO anon
  USING (is_active = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin full access to products"
  ON products FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- HISTORY_ITEMS: anyone can read, admin can do everything
CREATE POLICY "Anyone can read history"
  ON history_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admin full access to history"
  ON history_items FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 5. STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('quote-attachments', 'quote-attachments', FALSE),
  ('resumes', 'resumes', FALSE),
  ('product-images', 'product-images', TRUE),
  ('notice-images', 'notice-images', TRUE);

-- Storage policies: quote-attachments (anon upload, admin read)
CREATE POLICY "Anyone can upload quote attachments"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'quote-attachments');

CREATE POLICY "Admin can read quote attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'quote-attachments' AND is_admin());

-- Storage policies: resumes (anon upload, admin read)
CREATE POLICY "Anyone can upload resumes"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Admin can read resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes' AND is_admin());

-- Storage policies: product-images (public read, admin write)
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin can manage product images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'product-images' AND is_admin())
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

-- Storage policies: notice-images (public read, admin write)
CREATE POLICY "Anyone can view notice images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'notice-images');

CREATE POLICY "Admin can manage notice images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'notice-images' AND is_admin())
  WITH CHECK (bucket_id = 'notice-images' AND is_admin());

-- ============================================================
-- 6. SEED DATA: 회사 연혁
-- ============================================================

INSERT INTO history_items (year, month, description_ko, description_en, sort_order) VALUES
  (2002, 12, '나진테크 설립', 'NAJIN TECH established', 1),
  (2013, NULL, 'ISO 9001 인증 취득', 'ISO 9001 certification acquired', 2),
  (2013, NULL, 'CLEAN 사업장 인증', 'CLEAN workplace certification', 3),
  (2016, NULL, '우레탄 금형베이스 특허 취득', 'Urethane mold base patent acquired', 4);
