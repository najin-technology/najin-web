-- 042: accept_admin_invite 의 PUBLIC EXECUTE 회수
--
-- 041 에서 `REVOKE ... FROM anon` 만 했는데, 함수 생성 시 Postgres 가 자동으로
-- 붙이는 PUBLIC 기본 권한(pg_proc.proacl 의 `=X/postgres` 항목)이 남아 있어서
-- anon 이 여전히 /rest/v1/rpc/accept_admin_invite 를 호출할 수 있었다.
-- (Supabase security advisor 의 anon_security_definer_function_executable 잔존)
--
-- authenticated / service_role 은 명시적 grant 가 따로 있어 영향받지 않는다.
-- 검증(트랜잭션 내 rollback):
--   revoke 후 has_function_privilege → anon=false, authenticated=true, service_role=true
REVOKE EXECUTE ON FUNCTION public.accept_admin_invite(uuid) FROM PUBLIC;

-- 참고: public.is_admin() 은 일부러 PUBLIC 에 남겨둔다. anon 에 적용되는 RLS
-- 정책들이 정책식 안에서 is_admin() 을 호출하는데, 정책식은 질의 주체의 권한으로
-- 평가되므로 EXECUTE 를 뺏으면 anon 의 공개 읽기가 통째로 깨진다.
-- (anon 이 호출해봐야 auth.uid() 가 없어 항상 false 라 노출 위험도 없다.)
