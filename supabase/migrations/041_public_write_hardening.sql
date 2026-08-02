-- 041: 익명(anon) 공개 노출면 축소
--
-- ⚠️ 적용 순서: **코드 배포 → 이 마이그레이션** 순서로 해야 한다.
--    앱 코드는 구/신 정책 양쪽에서 모두 동작하지만(service_role 은 RLS 우회),
--    마이그레이션이 먼저 들어가면 배포 전까지 콜백 폼·방문 분석이 멈춘다.
--
-- 배경 — 점검에서 프로덕션 프로브로 확인된 3가지:
--   1. admin_invites 의 anon SELECT 정책에 토큰 조건이 없어, anon 키만으로
--      유효 초대 "전체"를 조회할 수 있었다. 토큰을 얻으면 /admin/invite/<token>
--      에서 임의 이메일로 admin 계정 생성이 가능 → 관리자 계정 탈취.
--   2. quotes/applications/attachments 의 INSERT 가 WITH CHECK (true) 라
--      PostgREST 로 직접 INSERT 하면 Turnstile·rate limit 을 통째로 우회 가능.
--      (검증: POST /rest/v1/quotes {} → 23502 not-null, 42501 아님)
--   3. ip_asn_cache 는 FOR ALL 이라 anon 이 UPDATE·DELETE 까지 가능했다.
--
-- 방침 — 공개 폼 쓰기는 전부 서버 액션/라우트 핸들러를 거치며 거기서
-- service-role 클라이언트를 쓰도록 앱 코드를 바꿨다. 따라서 anon 은
-- "읽기 전용" 이면 충분하다. RLS 를 우회하는 service_role 은 이 정책들의
-- 영향을 받지 않으므로 앱 동작에는 변화가 없다.

-- ============================================================
-- 1. admin_invites: anon/authenticated 열람 정책 제거
--    초대 조회는 서버(service-role)에서만 수행한다.
-- ============================================================
DROP POLICY IF EXISTS "Anyone can lookup invite by token" ON admin_invites;

-- accept_admin_invite 는 auth.uid() 가 필요해 anon 은 어차피 쓸 수 없다.
-- 노출면을 줄이고 advisor 경고를 없애기 위해 anon EXECUTE 회수.
REVOKE EXECUTE ON FUNCTION public.accept_admin_invite(uuid) FROM anon;

-- 초대에 대상 이메일(email_hint)이 지정돼 있으면, 그 이메일 계정만 수락 가능.
-- (전달·유출된 링크를 제3자가 본인 계정으로 가로채는 것을 막는다.
--  email_hint 가 NULL 인 기존 초대는 종전과 동일하게 동작.)
CREATE OR REPLACE FUNCTION public.accept_admin_invite(invite_token uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_invite admin_invites%ROWTYPE;
  v_user_id UUID;
  v_user_email TEXT;
  v_existing_role TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  SELECT * INTO v_invite
  FROM admin_invites
  WHERE token = invite_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite token';
  END IF;
  IF v_invite.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invite already used';
  END IF;
  IF v_invite.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invite has been revoked';
  END IF;
  IF v_invite.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Invite has expired';
  END IF;
  IF v_invite.email_hint IS NOT NULL
     AND LOWER(TRIM(v_invite.email_hint)) <> LOWER(TRIM(COALESCE(v_user_email, ''))) THEN
    RAISE EXCEPTION 'Invite is addressed to a different email';
  END IF;

  SELECT raw_app_meta_data->>'role' INTO v_existing_role
  FROM auth.users WHERE id = v_user_id;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
  WHERE id = v_user_id;

  UPDATE admin_invites
  SET used_at = NOW(),
      used_by_user_id = v_user_id,
      used_by_email = v_user_email
  WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'ok', true,
    'previous_role', v_existing_role,
    'user_email', v_user_email
  );
END;
$function$;

-- ============================================================
-- 2. 공개 폼 테이블: anon 직접 INSERT 차단
--    (서버 액션이 service-role 로 쓰므로 앱 기능에는 영향 없음)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit quotes" ON quotes;
DROP POLICY IF EXISTS "Anyone can submit applications" ON applications;
DROP POLICY IF EXISTS "Anyone can upload attachments" ON attachments;
DROP POLICY IF EXISTS "Anyone can insert page view" ON page_views;
DROP POLICY IF EXISTS "Anyone can insert quote form events" ON quote_form_events;

-- ip_asn_cache 는 FOR ALL(SELECT/INSERT/UPDATE/DELETE) 이었다. 전량 제거.
DROP POLICY IF EXISTS "Anyone can upsert ip asn cache" ON ip_asn_cache;

-- ============================================================
-- 3. customers: anon 에게 전체 컬럼이 아니라 노출용 컬럼만
--    (primary_contact_phone/email, notes, source, tags, status 등 내부 필드가
--     client_slug 만 채워지면 그대로 공개되던 문제)
--    앱의 공개 조회(src/lib/queries.ts)가 쓰는 컬럼 = 아래 목록.
-- ============================================================
REVOKE SELECT ON public.customers FROM anon;
GRANT SELECT (
  id,
  client_slug,
  company_name,
  display_name,
  name_en,
  logo_url,
  display_category,
  needs_dark_bg,
  display_order,
  registered_year,
  deleted_at
) ON public.customers TO anon;
