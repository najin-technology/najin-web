import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createSupabaseProxyClient } from "./lib/supabase-proxy";

const intlMiddleware = createIntlMiddleware(routing);

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_COOKIE = "najin_last_activity";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes: auth check + session refresh
  if (pathname.startsWith("/admin")) {
    // Allow login, auth callback, and invite acceptance pages without admin role
    // (invite recipients are not yet admin — they get the role after accepting)
    if (
      pathname === "/admin/login" ||
      pathname.startsWith("/admin/auth/") ||
      pathname.startsWith("/admin/invite/")
    ) {
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

    // Idle timeout: 30분 이상 활동 없으면 로그인 페이지로 튕김.
    // 쿠키는 비서명 timestamp — "무인 단말 자동 로그아웃" UX 목적.
    // 악의적 admin이 쿠키를 수정해 timeout 회피 가능하나, Supabase 세션
    // 자체 8h 만료(supabase-proxy.ts)가 상한선이므로 심각한 위협 아님.
    const lastActivity = request.cookies.get(ACTIVITY_COOKIE)?.value;
    const now = Date.now();
    if (lastActivity) {
      const elapsed = now - Number(lastActivity);
      if (Number.isFinite(elapsed) && elapsed > IDLE_TIMEOUT_MS) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("reason", "idle");
        const redirect = NextResponse.redirect(url);
        redirect.cookies.delete(ACTIVITY_COOKIE);
        return redirect;
      }
    }
    response.cookies.set(ACTIVITY_COOKIE, String(now), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
      maxAge: Math.floor(IDLE_TIMEOUT_MS / 1000),
    });

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
  const response = intlMiddleware(request);

  // 공개 페이지 CDN cache 활성화
  // - next-intl middleware가 set-cookie(NEXT_LOCALE)하면 Vercel Edge가 자동으로
  //   cache-control: private 강제 → CDN miss.
  // - localePrefix:"always" 설정이라 path 로 locale 결정 가능 → NEXT_LOCALE 불필요.
  // - 단, response.cookies.delete() 자체도 set-cookie 헤더를 추가해서 동일하게
  //   private 캐시를 유발한다. 따라서 요청에 쿠키가 있을 때만 deletion 헤더 발생.
  // - s-maxage=300 (CDN 5분) + stale-while-revalidate=3600 (1시간 SWR).
  //   admin 변경 시 revalidatePath/updateTag 로 즉시 무효화.
  if (request.cookies.has("NEXT_LOCALE")) {
    response.cookies.delete("NEXT_LOCALE");
  }
  response.headers.set(
    "cache-control",
    "public, s-maxage=300, stale-while-revalidate=3600"
  );
  return response;
}

export const config = {
  // catch-all except api, Next.js internals, and files with extensions.
  // 비-locale URL(/about, /posts 등)도 intl middleware 거쳐 /ko/* 로 리다이렉트
  // → GSC 404 이슈 해결, 외부 링크 SEO 가치 회복.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
