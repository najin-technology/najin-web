-- ============================================================
-- documents 버킷: 공개 다운로드용 문서 (브로셔 PDF, 인증서 PDF/이미지 등)
--
-- public=TRUE — 직접 URL 접근 허용 (브로셔/인증서는 누구나 다운로드 가능).
-- SELECT 정책은 admin 만 — anon 의 storage.objects 열거(list)를 차단해
-- 018_storage_listing_hardening.sql 의 강화 정책을 유지한다.
-- 공개 다운로드는 public 버킷 플래그로 직접 URL 접근만 허용.
-- write/update/delete 는 admin 만. (is_admin() 검증 필수)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', TRUE)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Admin can list documents" ON storage.objects;
CREATE POLICY "Admin can list documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND is_admin());

DROP POLICY IF EXISTS "Admin can upload documents" ON storage.objects;
CREATE POLICY "Admin can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents' AND is_admin());

DROP POLICY IF EXISTS "Admin can update documents" ON storage.objects;
CREATE POLICY "Admin can update documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND is_admin());

DROP POLICY IF EXISTS "Admin can delete documents" ON storage.objects;
CREATE POLICY "Admin can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND is_admin());
