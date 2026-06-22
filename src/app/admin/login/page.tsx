"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertMessage } from "@/components/admin/alert-message";
import { TurnstileWidget } from "@/components/turnstile-widget";

const REMEMBER_EMAIL_KEY = "admin_remember_email";

const ERROR_MESSAGES: Record<string, string> = {
  naver_not_admin: "관리자 권한이 없는 계정입니다.",
  naver_profile_no_email: "네이버 계정 이메일 제공에 동의해야 로그인할 수 있습니다.",
  naver_state_mismatch: "세션이 만료되었습니다. 다시 시도해주세요.",
  naver_token_failed: "네이버 로그인에 실패했습니다. 다시 시도해주세요.",
  naver_session_failed: "네이버 로그인에 실패했습니다. 다시 시도해주세요.",
  naver_link_failed: "네이버 로그인에 실패했습니다. 다시 시도해주세요.",
  naver_not_configured: "네이버 로그인이 설정되지 않았습니다.",
  admin_not_configured: "서버 설정 오류로 로그인할 수 없습니다.",
  admin_lookup_failed: "로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
  unauthorized: "로그인 권한이 없습니다.",
};

function UrlNotice() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  if (error) {
    return (
      <AlertMessage>
        {ERROR_MESSAGES[error] ?? `로그인 실패: ${error.replace(/_/g, " ")}`}
      </AlertMessage>
    );
  }
  if (searchParams.get("reason") === "idle") {
    return <AlertMessage>세션이 만료되어 자동으로 로그아웃되었습니다. 다시 로그인해주세요.</AlertMessage>;
  }
  return null;
}

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {
    error: "",
  });
  // 이 기기에 저장된 이메일을 초기값으로 (lazy init — SSR 시엔 빈 값).
  const [email, setEmail] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem(REMEMBER_EMAIL_KEY) ?? ""
  );
  const [rememberEmail, setRememberEmail] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(REMEMBER_EMAIL_KEY) !== null
  );
  const [autoLogin, setAutoLogin] = useState(false);
  const [showAutoWarning, setShowAutoWarning] = useState(false);

  // 이메일 기억 토글/입력에 따라 localStorage 동기화
  useEffect(() => {
    if (rememberEmail && email) localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    else if (!rememberEmail) localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }, [rememberEmail, email]);

  const handleGoogleLogin = () => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    });
  };

  const handleNaverLogin = () => {
    window.location.href = "/api/admin/auth/naver/start";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xl shadow-gray-200/60 transition-shadow hover:shadow-xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy-light flex items-center justify-center mx-auto mb-4 shadow-md shadow-brand-navy/20">
              <span className="text-white text-xl font-bold">N</span>
            </div>
            <h1 className="text-xl font-bold text-brand-navy">나진테크 관리자</h1>
            <p className="text-sm text-gray-600 mt-1.5 font-medium">로그인하여 대시보드에 접속하세요</p>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-2.5 h-11 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold transition-colors"
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

          {/* Naver Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 h-11 rounded-xl border-transparent bg-[#03C75A] hover:bg-[#02B551] text-white font-semibold transition-colors"
            onClick={handleNaverLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="none">
              <path d="M13.5 10.6L6.4 0H0v20h6.5V9.4L13.6 20H20V0h-6.5v10.6z" fill="currentColor" />
            </svg>
            네이버로 로그인
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-xs text-gray-500 uppercase tracking-widest font-semibold">또는</span>
            </div>
          </div>

          {/* Email/Password Login */}
          <form action={formAction} className="space-y-4">
            {!state.error && (
              <Suspense fallback={null}>
                <UrlNotice />
              </Suspense>
            )}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
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

            <div className="space-y-2.5 pt-0.5">
              <label className="flex items-center gap-2 text-[13px] text-gray-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="w-4 h-4 accent-brand-navy"
                />
                이메일 기억하기
              </label>
              <label className="flex items-center gap-2 text-[13px] text-gray-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="persist"
                  checked={autoLogin}
                  onChange={(e) => {
                    if (e.target.checked) setShowAutoWarning(true);
                    else setAutoLogin(false);
                  }}
                  className="w-4 h-4 accent-brand-navy"
                />
                자동 로그인 <span className="text-gray-400">(이 기기에서 30일 유지)</span>
              </label>
            </div>

            <TurnstileWidget onToken={() => {}} />

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-11 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm font-semibold transition-all"
            >
              {pending ? "로그인 중..." : "이메일로 로그인"}
            </Button>
          </form>

          {showAutoWarning && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-base font-bold text-brand-charcoal text-center mb-2">
                  자동 로그인 주의
                </h3>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-5">
                  이 기기에서 <strong>30일간 로그인 상태가 유지</strong>되고 유휴 자동 로그아웃이
                  해제됩니다.{" "}
                  <span className="text-red-600 font-semibold">
                    공용·공유 PC에서는 절대 사용하지 마세요.
                  </span>{" "}
                  로그아웃 전까지 누구나 관리자 페이지에 접근할 수 있습니다.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAutoWarning(false)}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-white"
                    onClick={() => {
                      setAutoLogin(true);
                      setShowAutoWarning(false);
                    }}
                  >
                    이해했고 사용
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-gray-500 mt-4 font-medium">
          Enter 키로 로그인할 수 있습니다
        </p>
        <p className="text-center text-xs text-gray-600 mt-2 font-medium">
          나진테크 관리자 전용 페이지입니다
        </p>
      </div>
    </div>
  );
}
