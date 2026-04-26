-- 018_storage_listing_hardening.sql
-- QA Round 29 P2: notice-images, product-images public bucket이 listing 허용
-- 공격자에게 file structure 노출 위험. Public URL 직접 접근만 필요한데 list까지 허용됨.
--
-- 해결: SELECT 정책 삭제 → public bucket의 URL 직접 접근은 그대로 동작 (bucket public 속성)
--      list() 호출은 인증 필요 (admin 정책으로만 가능)
--
-- 영향 검토:
-- - notice-images: src에서 list() 호출 0건. anon read는 bucket public 속성으로 동작.
-- - product-images: src에서 list() 호출 0건. admin upload/remove만 호출 (별도 admin 정책).

DROP POLICY IF EXISTS "Anyone can view notice images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

-- Public bucket 속성은 그대로 (public_read = true) — 직접 URL 접근 가능
-- Admin 정책 ("Admin can manage notice/product images")은 그대로 — admin은 list 가능

-- QA Round 29 P3: function search_path mutable
-- SECURITY DEFINER 함수가 아니지만 trigger에서 호출되므로 search_path 명시
CREATE OR REPLACE FUNCTION public.work_orders_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $function$;
