"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertMessage } from "@/components/admin/alert-message";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {
    error: "",
  });

  const handleGoogleLogin = () => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-lg shadow-gray-200/50 transition-shadow hover:shadow-xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy-light flex items-center justify-center mx-auto mb-4 shadow-md shadow-brand-navy/20">
              <span className="text-white text-xl font-bold">N</span>
            </div>
            <h1 className="text-xl font-bold text-brand-navy">나진테크 관리자</h1>
            <p className="text-sm text-gray-400 mt-1.5">로그인하여 대시보드에 접속하세요</p>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 h-11 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 로그인
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wider">또는</span>
            </div>
          </div>

          {/* Email/Password Login */}
          <form action={formAction} className="space-y-4">
            {state.error && (
              <AlertMessage>{state.error}</AlertMessage>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                className="focus-visible:ring-2 focus-visible:ring-brand-navy/20 focus-visible:border-brand-navy/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="focus-visible:ring-2 focus-visible:ring-brand-navy/20 focus-visible:border-brand-navy/40"
              />
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-11 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm transition-all"
            >
              {pending ? "로그인 중..." : "이메일로 로그인"}
            </Button>
          </form>
        </div>
        <p className="text-center text-[11px] text-gray-300 mt-4">
          Enter 키로 로그인할 수 있습니다
        </p>
        <p className="text-center text-[11px] text-gray-400 mt-2">
          나진테크 관리자 전용 페이지입니다
        </p>
      </div>
    </div>
  );
}
