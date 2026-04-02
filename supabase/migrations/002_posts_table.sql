-- ============================================================
-- 나진테크 블로그 포스팅 테이블
-- 네이버 블로그 콘텐츠 마이그레이션 + 새 포스팅 지원
-- ============================================================

-- 블로그 포스팅
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ko TEXT NOT NULL,
  title_en TEXT,
  content_ko TEXT NOT NULL,
  content_en TEXT,
  excerpt_ko TEXT,
  excerpt_en TEXT,
  category TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  original_date DATE,
  original_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_posts_published ON posts(is_published, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_category ON posts(category) WHERE deleted_at IS NULL AND is_published = TRUE;
CREATE INDEX idx_posts_slug ON posts(slug) WHERE deleted_at IS NULL;

-- updated_at 트리거
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT
  TO anon
  USING (is_published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin full access to posts"
  ON posts FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 스토리지 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'post-images');

CREATE POLICY "Admin can manage post images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'post-images' AND is_admin())
  WITH CHECK (bucket_id = 'post-images' AND is_admin());
