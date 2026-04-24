import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { logAudit } from "@/lib/audit";

const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const NAVER_PROFILE_URL = "https://openapi.naver.com/v1/nid/me";
const STATE_COOKIE = "naver_oauth_state";

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

  // 1) naver_id로 매칭 (이미 연결된 계정 → 신뢰)
  let match = usersList.users.find(
    (u) => u.app_metadata?.naver_id === naverId && u.app_metadata?.role === "admin"
  );
  let firstTime = false;

  // 2) fallback: 이메일 매칭 (최초 네이버 로그인 → 자동 연결)
  if (!match) {
    match = usersList.users.find(
      (u) => u.email?.toLowerCase() === email && u.app_metadata?.role === "admin"
    );
    firstTime = Boolean(match);
  }

  if (!match) {
    return redirectError(request, "naver_not_admin");
  }

  // 최초 매칭이면 naver_id를 app_metadata에 저장 (다음부터 id 기반 매칭)
  if (firstTime) {
    await admin.auth.admin.updateUserById(match.id, {
      app_metadata: {
        ...match.app_metadata,
        naver_id: naverId,
        naver_email: email,
      },
    });
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: match.email!,
    options: { redirectTo: `${SITE_URL}/admin` },
  });
  if (linkError || !linkData.properties?.action_link) {
    return redirectError(request, "naver_link_failed");
  }

  await logAudit({
    action: "login",
    targetTable: "auth",
    details: { email: match.email, provider: "naver", first_time_link: firstTime },
  });

  const res = NextResponse.redirect(linkData.properties.action_link);
  res.cookies.delete(STATE_COOKIE);
  return res;
}
