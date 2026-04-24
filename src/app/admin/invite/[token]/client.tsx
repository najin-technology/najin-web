"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle, Mail } from "lucide-react";

export function AcceptInviteClient({
  token,
  emailHint,
  invitedByEmail,
  expiresAt,
  isAlreadyAuthenticated,
  currentUserEmail,
}: {
  token: string;
  emailHint: string | null;
  invitedByEmail: string;
  expiresAt: string;
  isAlreadyAuthenticated: boolean;
  currentUserEmail: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleAccept = () => {
    if (!isAlreadyAuthenticated) return;
    startTransition(async () => {
      setError(null);
      const supabase = createSupabaseBrowserClient();
      const { error: rpcErr } = await supabase.rpc("accept_admin_invite", {
        invite_token: token,
      });
      if (rpcErr) {
        setError(rpcErr.message);
        return;
      }
      // refresh session so new role is applied to JWT
      await supabase.auth.refreshSession();
      setSuccess(true);
      setTimeout(() => router.push("/admin"), 1200);
    });
  };

  const handleGoogleSignIn = () => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/auth/callback?invite=${token}`,
      },
    });
  };

  const handleNaverSignIn = () => {
    window.location.href = `/api/admin/auth/naver/start?invite=${token}`;
  };

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6" />
        </div>
        <p className="font-semibold text-emerald-900">관리자 권한이 부여되었습니다</p>
        <p className="text-xs text-emerald-700 mt-1">잠시 후 관리자 대시보드로 이동합니다.</p>
      </div>
    );
  }

  const expiry = new Date(expiresAt).toLocaleString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 text-sm space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">초대자</span>
          <span className="font-medium text-gray-800">{invitedByEmail}</span>
        </div>
        {emailHint && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">대상 메모</span>
            <span className="font-medium text-gray-800">{emailHint}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-500">만료</span>
          <span className="text-gray-600 tabular-nums text-xs">{expiry}</span>
        </div>
      </div>

      {isAlreadyAuthenticated ? (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
            <p className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                현재 로그인 계정: <strong>{currentUserEmail}</strong>
                <br />
                이 계정에 관리자 권한을 부여합니다.
              </span>
            </p>
          </div>
          <Button
            onClick={handleAccept}
            disabled={pending}
            className="w-full bg-brand-navy hover:bg-brand-navy-light text-white"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "초대 수락"}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 text-center">
            아래 계정 중 하나로 로그인하여 초대를 수락하세요.
          </p>
          <div className="space-y-2">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-11 gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 로그인
            </Button>
            <Button
              onClick={handleNaverSignIn}
              className="w-full h-11 gap-2 bg-[#03C75A] hover:bg-[#02B551] text-white border-transparent"
              variant="outline"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <path d="M13.5 10.6L6.4 0H0v20h6.5V9.4L13.6 20H20V0h-6.5v10.6z" fill="currentColor" />
              </svg>
              네이버로 로그인
            </Button>
          </div>
          <p className="text-[11px] text-gray-400 text-center">
            로그인 후 자동으로 관리자 권한이 부여됩니다.
          </p>
        </>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
