-- ============================================================
-- site_about: 회사 브로셔 PDF 첨부 기능 추가
-- 파일은 documents 버킷 (025) 에 업로드, 경로/원본 파일명만 DB에 저장.
-- ============================================================

ALTER TABLE site_about
  ADD COLUMN brochure_pdf_path TEXT,
  ADD COLUMN brochure_pdf_name TEXT;

COMMENT ON COLUMN site_about.brochure_pdf_path IS 'Storage path in documents bucket';
