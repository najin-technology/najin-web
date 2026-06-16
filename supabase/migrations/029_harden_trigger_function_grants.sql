-- 029_harden_trigger_function_grants.sql
-- 보안 advisor(anon/authenticated_security_definer_function_executable):
-- 트리거 전용 SECURITY DEFINER 함수가 PostgREST RPC로 직접 호출 가능했다.
-- 트리거는 소유자 권한으로 실행되므로 직접 EXECUTE 권한만 회수해도 트리거 동작엔 영향 없음.
-- (next_work_order_number·accept_admin_invite·is_admin 은 RPC/RLS로 실제 사용 중이라 제외)
revoke execute on function public.attach_customer_for_quote() from public, anon, authenticated;
revoke execute on function public.attach_customer_for_application() from public, anon, authenticated;
