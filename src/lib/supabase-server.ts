import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PERSIST_COOKIE, sessionMaxAge } from "./session";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            // 자동 로그인 활성 시 세션 쿠키 수명을 길게(최대 30일) 설정.
            const maxAge = sessionMaxAge(cookieStore.get(PERSIST_COOKIE)?.value);
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge,
              })
            );
          } catch {
            // setAll can fail in Server Components (read-only context)
            // This is expected — session refresh will happen in proxy instead
          }
        },
      },
    }
  );
}
