-- 019_pr45_security_hardening_sync.sql
-- PR #45 (3일 전 stale base, close됨)에서 prod에 이미 apply된 변경사항을 repo에 sync.
-- 모든 statement는 멱등 — 다시 apply해도 안전.
--
-- prod history (Supabase MCP list_migrations 확인):
--   20260423182750_013_security_hardening — apply 완료
--   20260423182821_014_storage_bucket_limits — apply 완료
-- 그러나 repo의 013/014 슬롯이 다른 작업으로 점유됨 (013_storage_rls_hardening, 014_page_views)
-- → 새 번호 019로 통합 sync.

-- 1. 함수 search_path 고정 (권한 상승 방지)
-- PR #60(018)에서 work_orders_set_updated_at만 적용됨. 나머지 3개 추가.
ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.update_updated_at() SET search_path = '';
ALTER FUNCTION public.normalize_company_name(text) SET search_path = '';

-- 2. posts RLS — auth.fn() 을 (SELECT auth.fn())로 감싸 row마다 재평가 방지 (initplan 최적화)
DROP POLICY IF EXISTS "Admins can do anything with posts" ON posts;
CREATE POLICY "Admins can do anything with posts"
  ON posts FOR ALL
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- 3. Storage bucket file_size_limit + allowed_mime_types 강제
--    (anon 키로 Storage API 직접 호출해 server action 검증 우회 차단)
UPDATE storage.buckets
SET
  file_size_limit = 10485760,  -- 10MB
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/acad',
    'application/x-autocad',
    'image/vnd.dwg',
    'image/x-dwg',
    'application/dxf',
    'image/vnd.dxf',
    'application/step',
    'application/vnd.ms-pki.stl',
    'application/iges',
    'model/iges',
    'model/step',
    'image/jpeg',
    'image/png',
    'application/octet-stream'
  ]
WHERE id = 'quote-attachments';

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream'
  ]
WHERE id = 'resumes';

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml'
  ]
WHERE id IN ('product-images','notice-images');
