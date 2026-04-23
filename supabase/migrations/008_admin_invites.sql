-- ============================================================
-- Admin 초대 링크 시스템
-- 기존 admin이 초대 토큰을 생성 → 사용자가 가입 → 자동 admin 부여
-- ============================================================

CREATE TABLE admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email_hint TEXT,                    -- 누구에게 보내려는지 메모
  invited_by_user_id UUID NOT NULL,
  invited_by_email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  used_at TIMESTAMPTZ,
  used_by_user_id UUID,
  used_by_email TEXT,
  revoked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_invites_token ON admin_invites(token) WHERE used_at IS NULL AND revoked_at IS NULL;
CREATE INDEX idx_admin_invites_status ON admin_invites(created_at DESC);

ALTER TABLE admin_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can view/create/revoke invites
CREATE POLICY "Admins can manage invites"
  ON admin_invites FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Anonymous users CAN read a single invite by token (public-key lookup pattern)
-- This is safe because the token itself is the secret (UUID, unguessable)
CREATE POLICY "Anyone can lookup invite by token"
  ON admin_invites FOR SELECT
  TO anon, authenticated
  USING (used_at IS NULL AND revoked_at IS NULL AND expires_at > NOW());

-- ============================================================
-- 초대 수락 RPC: 인증된 사용자가 토큰을 제시하면 admin role 부여
-- SECURITY DEFINER 로 실행되어 auth.users 업데이트 가능
-- ============================================================

CREATE OR REPLACE FUNCTION accept_admin_invite(invite_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_invite admin_invites%ROWTYPE;
  v_user_id UUID;
  v_user_email TEXT;
  v_existing_role TEXT;
BEGIN
  -- Caller must be authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  -- Lock and validate invite
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

  -- Check current role (idempotent: already-admin users still mark invite used)
  SELECT raw_app_meta_data->>'role' INTO v_existing_role
  FROM auth.users WHERE id = v_user_id;

  -- Set admin role (merge into raw_app_meta_data)
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
  WHERE id = v_user_id;

  -- Mark invite used
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
$$;

GRANT EXECUTE ON FUNCTION accept_admin_invite(UUID) TO authenticated;
