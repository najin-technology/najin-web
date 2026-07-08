-- 040_security_cleanup.sql
-- 보안 advisor 대응 (Supabase Security Advisor 경보 처리).
--
-- 1) posts_content_backup_038 제거
--    038 프로즈 윤문 전에 수동으로 뜬 일회성 백업 테이블. 커밋된 마이그레이션(038)에는
--    생성 코드가 없고, 앱 코드·다른 마이그레이션·DB 뷰/FK 어디서도 참조하지 않는다.
--    내용은 이미 공개된 게시글 본문의 옛 사본 8건뿐. RLS 미설정으로 PostgREST 에 그대로
--    노출되어 있었다(advisor: rls_disabled_in_public, ERROR). 역할이 끝난 stale 테이블이므로 제거.
DROP TABLE IF EXISTS public.posts_content_backup_038;

-- 2) next_work_order_number() 의 PUBLIC/anon EXECUTE 권한 회수
--    SECURITY DEFINER 함수라 기본 PUBLIC EXECUTE 권한 때문에 anon 도 /rest/v1/rpc 로 호출
--    가능했다(advisor: anon_security_definer_function_executable). 함수 내부에서
--    nextval('work_order_seq') 를 소비하므로 anon 이 반복 호출하면 발주번호 시퀀스를 임의로
--    소진시킬 수 있다. 앱은 이 함수를 관리자(authenticated) 세션으로만 호출하므로
--    (work-orders/actions.ts) authenticated 권한은 유지하고 PUBLIC/anon 만 회수한다.
REVOKE EXECUTE ON FUNCTION public.next_work_order_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.next_work_order_number() TO authenticated;
