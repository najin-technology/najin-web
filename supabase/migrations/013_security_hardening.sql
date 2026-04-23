-- Security + performance hardening from Supabase advisors

-- 1. 함수 search_path 고정 (권한 상승 방지)
ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.update_updated_at() SET search_path = '';
ALTER FUNCTION public.normalize_company_name(text) SET search_path = '';

-- 2. posts RLS initplan — auth.fn() 을 (SELECT auth.fn())로 감싸 row마다 재평가 방지
DROP POLICY IF EXISTS "Admins can do anything with posts" ON posts;
CREATE POLICY "Admins can do anything with posts"
  ON posts FOR ALL
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- 3. Public bucket SELECT policy 제거 — object URL 직접 접근은 public bucket 이면 정책 불필요.
--    현재 정책은 bucket 내 파일 목록 나열 허용 → 미공개 파일 enumerate 가능.
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view notice images" ON storage.objects;
