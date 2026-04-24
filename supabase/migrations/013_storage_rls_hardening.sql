-- ============================================================
-- Storage RLS hardening
-- 기존 001 마이그레이션이 기본 정책은 깔아두었으나:
--   · quote-attachments / resumes: admin SELECT만 있고 DELETE/UPDATE 없음
--   · product-images / notice-images: public 버킷이라 public URL은 동작하지만
--     SDK 기반 SELECT(e.g. list) 정책이 없음 → 필요 시 동작하도록 보강
-- 이 마이그레이션은 누락된 관리자 UPDATE/DELETE와 공개 버킷 SELECT를 추가한다.
-- ============================================================

-- Admin can update quote attachments (replace or patch metadata)
DROP POLICY IF EXISTS "Admin can update quote attachments" ON storage.objects;
CREATE POLICY "Admin can update quote attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'quote-attachments' AND is_admin())
  WITH CHECK (bucket_id = 'quote-attachments' AND is_admin());

-- Admin can delete quote attachments
DROP POLICY IF EXISTS "Admin can delete quote attachments" ON storage.objects;
CREATE POLICY "Admin can delete quote attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'quote-attachments' AND is_admin());

-- Admin can update resumes
DROP POLICY IF EXISTS "Admin can update resumes" ON storage.objects;
CREATE POLICY "Admin can update resumes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'resumes' AND is_admin())
  WITH CHECK (bucket_id = 'resumes' AND is_admin());

-- Admin can delete resumes
DROP POLICY IF EXISTS "Admin can delete resumes" ON storage.objects;
CREATE POLICY "Admin can delete resumes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'resumes' AND is_admin());

-- Public SELECT for public buckets — public URL은 RLS 없이 동작하지만
-- 관리자 SDK 리스트 / 클라이언트 SDK 리드 시를 대비해 명시.
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Anyone can view notice images" ON storage.objects;
CREATE POLICY "Anyone can view notice images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'notice-images');

-- INSERT on quote-attachments / resumes: 기존 정책은 anon만 허용.
-- admin(authenticated)도 업로드 필요할 수 있으므로 확장.
DROP POLICY IF EXISTS "Anyone can upload quote attachments" ON storage.objects;
CREATE POLICY "Anyone can upload quote attachments"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'quote-attachments');

DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Anyone can upload resumes"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'resumes');
