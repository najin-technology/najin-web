import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
          return NextResponse.redirect(new URL("/admin", request.url));
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
        return NextResponse.redirect(new URL("/admin", request.url));
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
