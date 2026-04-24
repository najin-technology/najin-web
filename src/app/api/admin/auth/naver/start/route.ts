import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { SITE_URL } from "@/lib/env";

const NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize";
const STATE_COOKIE = "naver_oauth_state";
const INVITE_COOKIE = "naver_oauth_invite";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/admin/login?error=naver_not_configured", request.url)
    );
  }

  const { searchParams } = new URL(request.url);
  const inviteParam = searchParams.get("invite");
  const invite = inviteParam && UUID_RE.test(inviteParam) ? inviteParam : null;

  const state = randomBytes(24).toString("hex");
  const redirectUri = `${SITE_URL}/api/admin/auth/naver/callback`;

  const authUrl = new URL(NAVER_AUTH_URL);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/admin/auth/naver",
    maxAge: 600,
  });
  if (invite) {
    res.cookies.set(INVITE_COOKIE, invite, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/admin/auth/naver",
      maxAge: 600,
    });
  } else {
    res.cookies.delete(INVITE_COOKIE);
  }
  return res;
}
