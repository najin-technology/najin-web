-- ============================================================
-- documents 버킷: 공개 다운로드용 문서 (브로셔 PDF, 인증서 PDF/이미지 등)
--
-- public=TRUE — 직접 URL 접근 허용 (브로셔/인증서는 누구나 다운로드 가능).
-- write/update/delete 는 admin 만. (is_admin() 검증 필수)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', TRUE)
ON CONFLICT DO NOTHING;

CREATE POLICY "public_read_documents"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "admin_insert_documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents' AND is_admin());

CREATE POLICY "admin_update_documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND is_admin());

CREATE POLICY "admin_delete_documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND is_admin());
