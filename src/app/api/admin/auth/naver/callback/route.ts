import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";
import { LAST_LOGIN_METHOD_COOKIE, LAST_LOGIN_METHOD_MAX_AGE } from "@/lib/session";

const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const NAVER_PROFILE_URL = "https://openapi.naver.com/v1/nid/me";
const STATE_COOKIE = "naver_oauth_state";
const INVITE_COOKIE = "naver_oauth_invite";

type NaverTokenResponse = { access_token?: string };
type NaverProfileResponse = {
  resultcode: string;
  response?: { id: string; email?: string; name?: string };
};

function redirectError(request: NextRequest, code: string) {
  return NextResponse.redirect(new URL(`/admin/login?error=${code}`, request.url));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;
  const inviteToken = request.cookies.get(INVITE_COOKIE)?.value ?? null;

  if (!code || !state || state !== cookieState) {
    return redirectError(request, "naver_state_mismatch");
  }

  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return redirectError(request, "naver_not_configured");
  }

  const tokenUrl = new URL(NAVER_TOKEN_URL);
  tokenUrl.searchParams.set("grant_type", "authorization_code");
  tokenUrl.searchParams.set("client_id", clientId);
  tokenUrl.searchParams.set("client_secret", clientSecret);
  tokenUrl.searchParams.set("code", code);
  tokenUrl.searchParams.set("state", state);

  const tokenRes = await fetch(tokenUrl.toString());
  const tokenData = (await tokenRes.json()) as NaverTokenResponse;
  if (!tokenData.access_token) {
    return redirectError(request, "naver_token_failed");
  }

  const profileRes = await fetch(NAVER_PROFILE_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = (await profileRes.json()) as NaverProfileResponse;
  if (profile.resultcode !== "00" || !profile.response?.id || !profile.response.email) {
    return redirectError(request, "naver_profile_no_email");
  }

  const naverId = profile.response.id;
  const email = profile.response.email.toLowerCase();

  const admin = getSupabaseAdmin();
  if (!admin) return redirectError(request, "admin_not_configured");

  const { data: usersList, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) return redirectError(request, "admin_lookup_failed");

  // 1) naver_id 매칭 (기존 연결된 admin)
  let match = usersList.users.find(
    (u) => u.app_metadata?.naver_id === naverId && u.app_metadata?.role === "admin"
  );
  let firstTimeLink = false;
  let invitedSignup = false;

  // 2) 이메일 매칭 (최초 네이버 로그인한 기존 admin → 자동 연결)
  if (!match) {
    match = usersList.users.find(
      (u) => u.email?.toLowerCase() === email && u.app_metadata?.role === "admin"
    );
    if (match) firstTimeLink = true;
  }

  // 3) 초대 토큰 기반 신규 admin 회원가입 (Naver signup via invite)
  if (!match && inviteToken) {
    const { data: invite } = await admin
      .from("admin_invites")
      .select("token, used_at, revoked_at, expires_at")
      .eq("token", inviteToken)
      .maybeSingle();

    if (!invite) return redirectError(request, "invite_not_found");
    if (invite.used_at) return redirectError(request, "invite_used");
    if (invite.revoked_at) return redirectError(request, "invite_revoked");
    if (new Date(invite.expires_at) <= new Date()) {
      return redirectError(request, "invite_expired");
    }

    // 이메일이 이미 등록된 사용자면 role만 승격. 아니면 신규 생성.
    const existingByEmail = usersList.users.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (existingByEmail) {
      const { data: updated, error: upErr } = await admin.auth.admin.updateUserById(
        existingByEmail.id,
        {
          app_metadata: {
            ...existingByEmail.app_metadata,
            role: "admin",
            naver_id: naverId,
            naver_email: email,
          },
        }
      );
      if (upErr || !updated.user) return redirectError(request, "user_upgrade_failed");
      match = updated.user;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        app_metadata: {
          role: "admin",
          naver_id: naverId,
          naver_email: email,
        },
      });
      if (createErr || !created.user) return redirectError(request, "user_create_failed");
      match = created.user;
    }

    await admin
      .from("admin_invites")
      .update({
        used_at: new Date().toISOString(),
        used_by_user_id: match.id,
        used_by_email: email,
      })
      .eq("token", inviteToken);

    invitedSignup = true;
  }

  if (!match) {
    // 네이버 인증은 성공했으나 관리자 권한이 없는 계정 — 에러가 아닌 안내로 처리.
    // (검수자가 본인 네이버로 로그인해도 "로그인 성공, 권한 없음"으로 보이게.)
    return NextResponse.redirect(
      new URL("/admin/login?notice=naver_no_admin", request.url)
    );
  }

  // 최초 이메일 매칭이면 naver_id를 app_metadata에 저장
  if (firstTimeLink) {
    await admin.auth.admin.updateUserById(match.id, {
      app_metadata: {
        ...match.app_metadata,
        naver_id: naverId,
        naver_email: email,
      },
    });
  }

  // 매직링크 토큰 해시를 받아 서버에서 직접 세션을 설정한다.
  // (action_link 리다이렉트는 토큰을 URL 해시로 돌려줘 서버 컴포넌트가 못 읽으므로 사용하지 않음.)
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: match.email!,
  });
  if (linkError || !linkData.properties?.hashed_token) {
    return redirectError(request, "naver_link_failed");
  }

  const supabase = await createSupabaseServerClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: linkData.properties.hashed_token,
  });
  if (verifyError) {
    return redirectError(request, "naver_session_failed");
  }

  await logAudit({
    action: invitedSignup ? "signup" : "login",
    targetTable: "auth",
    details: {
      email: match.email,
      provider: "naver",
      first_time_link: firstTimeLink,
      via_invite: invitedSignup,
    },
  });

  const res = NextResponse.redirect(new URL("/admin", request.url));
  res.cookies.delete(STATE_COOKIE);
  res.cookies.delete(INVITE_COOKIE);
  res.cookies.set(LAST_LOGIN_METHOD_COOKIE, "naver", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: LAST_LOGIN_METHOD_MAX_AGE,
  });
  return res;
}
