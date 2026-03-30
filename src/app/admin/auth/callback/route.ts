import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check admin role
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
    }
  }

  return NextResponse.redirect(
    new URL("/admin/login?error=unauthorized", request.url)
  );
}
