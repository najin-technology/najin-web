import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createSupabaseProxyClient } from "./lib/supabase-proxy";

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes: auth check + session refresh
  if (pathname.startsWith("/admin")) {
    // Allow login page without auth
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Subdomain rewrite: admin.* → /admin
    const hostname = request.headers.get("host") || "";
    if (hostname.startsWith("admin.") && !pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url);
    }

    // Session check
    const { supabase, response } = createSupabaseProxyClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return response;
  }

  // Subdomain: admin.* root access → rewrite to /admin
  const hostname = request.headers.get("host") || "";
  if (hostname.startsWith("admin.")) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // All other routes: i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(ko|en)/:path*", "/admin/:path*"],
};
