import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { logAudit } from "@/lib/audit";

const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const NAVER_PROFILE_URL = "https://openapi.naver.com/v1/nid/me";
const STATE_COOKIE = "naver_link_state";

type NaverTokenResponse = { access_token?: string };
type NaverProfileResponse = {
  resultcode: string;
  response?: { id: string; email?: string };
};

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || state !== cookieState) {
    return redirectTo(request, "/admin/settings?error=state_mismatch");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return redirectTo(request, "/admin/login");
  }

  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return redirectTo(request, "/admin/settings?error=naver_not_configured");
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
    return redirectTo(request, "/admin/settings?error=token_failed");
  }

  const profileRes = await fetch(NAVER_PROFILE_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = (await profileRes.json()) as NaverProfileResponse;
  if (profile.resultcode !== "00" || !profile.response?.id) {
    return redirectTo(request, "/admin/settings?error=profile_failed");
  }

  const naverId = profile.response.id;
  const naverEmail = profile.response.email ?? null;

  const admin = getSupabaseAdmin();
  if (!admin) return redirectTo(request, "/admin/settings?error=admin_not_configured");

  // 다른 admin에 이미 연결된 naver_id인지 확인
  const { data: usersList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const collision = usersList?.users.find(
    (u) => u.app_metadata?.naver_id === naverId && u.id !== user.id
  );
  if (collision) {
    return redirectTo(request, "/admin/settings?error=naver_already_linked");
  }

  await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      naver_id: naverId,
      naver_email: naverEmail,
    },
  });

  await logAudit({
    action: "link_identity",
    targetTable: "auth",
    details: { provider: "naver", naver_email: naverEmail },
  });

  const res = redirectTo(request, "/admin/settings?linked=naver");
  res.cookies.delete(STATE_COOKIE);
  return res;
}
