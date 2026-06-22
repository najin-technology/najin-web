import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";
import { LAST_LOGIN_METHOD_COOKIE, LAST_LOGIN_METHOD_MAX_AGE } from "@/lib/session";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// /admin 으로 리다이렉트하며 "최근 로그인 = google" 힌트 쿠키를 심는다.
function adminRedirect(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin", request.url));
  res.cookies.set(LAST_LOGIN_METHOD_COOKIE, "google", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: LAST_LOGIN_METHOD_MAX_AGE,
  });
  return res;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const inviteToken = searchParams.get("invite");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Invite flow: redeem token to grant admin role to whoever just logged in
      if (inviteToken && UUID_RE.test(inviteToken)) {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "accept_admin_invite",
          { invite_token: inviteToken }
        );
        if (!rpcError) {
          await logAudit({
            action: "accept_invite",
            targetTable: "admin_invites",
            details: { email: data.user.email, provider: "google", token: inviteToken, result: rpcData },
          });
          // Refresh session so JWT picks up new role
          await supabase.auth.refreshSession();
          return adminRedirect(request);
        }
        // Fall through — invite redemption failed; let the role check below decide
      }

      // Standard admin role check
      if (data.user.app_metadata?.role === "admin") {
        await logAudit({
          action: "login",
          targetTable: "auth",
          details: { email: data.user.email, provider: "google" },
        });
        return adminRedirect(request);
      }

      // Not admin — sign out and redirect with error
      await supabase.auth.signOut();

      if (inviteToken) {
        return NextResponse.redirect(
          new URL(`/admin/invite/${inviteToken}?error=invite_failed`, request.url)
        );
      }
    }
  }

  return NextResponse.redirect(
    new URL("/admin/login?error=unauthorized", request.url)
  );
}
