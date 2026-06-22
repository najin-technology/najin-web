"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertMessage } from "@/components/admin/alert-message";
import { setAutoLogin, extendAutoLogin } from "../actions";

const REMEMBER_EMAIL_KEY = "admin_remember_email"; // 로그인 페이지와 동일 키 (이 기기 localStorage)

const AUTO_LOGIN_WARNING =
  "이 기기에서 30일간 로그인 상태가 유지되고 유휴 자동 로그아웃이 해제됩니다.\n" +
  "공용·공유 PC에서는 절대 사용하지 마세요. 로그아웃 전까지 누구나 관리자 페이지에 접근할 수 있습니다.\n\n계속할까요?";

function formatRemaining(ms: number): string {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  return days > 0 ? `${days}일 ${hours}시간 남음` : `${hours}시간 남음`;
}

export function LoginOptionsSettings({
  email,
  persistRemainingMs,
}: {
  email: string | null;
  persistRemainingMs: number;
}) {
  const router = useRouter();
  // 이 기기 localStorage 기준 초기값 (lazy init — SSR 시 false).
  const [remember, setRemember] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(REMEMBER_EMAIL_KEY) !== null
  );
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const autoLoginActive = persistRemainingMs > 0;

  const toggleRemember = (checked: boolean) => {
    setRemember(checked);
    if (checked && email) localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    else localStorage.removeItem(REMEMBER_EMAIL_KEY);
  };

  const runAutoLogin = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    okMsg: string
  ) => {
    startTransition(async () => {
      setMsg(null);
      const result = await fn();
      if (!result.ok) {
        setMsg(result.error ?? "처리에 실패했습니다.");
        return;
      }
      router.refresh();
      setMsg(okMsg);
    });
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
        로그인 옵션 (이 기기)
      </h2>
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4">
        {/* 이메일 기억하기 */}
        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <span className="min-w-0">
            <span className="font-semibold text-brand-navy block">이메일 기억하기</span>
            <span className="text-[13px] text-gray-600 truncate block">
              {remember && email ? email : "이 기기 로그인 화면에 이메일 자동 입력"}
            </span>
          </span>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => toggleRemember(e.target.checked)}
            suppressHydrationWarning
            className="w-4 h-4 accent-brand-navy flex-shrink-0"
          />
        </label>

        <div className="border-t border-gray-100" />

        {/* 자동 로그인 */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="font-semibold text-brand-navy block">자동 로그인</span>
            <span className="text-[13px] text-gray-600">
              {autoLoginActive
                ? `이 기기 유지 중 · ${formatRemaining(persistRemainingMs)}`
                : "이 기기에서 30일간 로그인 유지 (꺼짐)"}
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {autoLoginActive ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => runAutoLogin(extendAutoLogin, "30일 연장되었습니다.")}
                >
                  연장
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    runAutoLogin(() => setAutoLogin(false), "자동 로그인이 해제되었습니다.")
                  }
                >
                  끄기
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => {
                  if (confirm(AUTO_LOGIN_WARNING)) {
                    runAutoLogin(() => setAutoLogin(true), "자동 로그인이 켜졌습니다.");
                  }
                }}
              >
                켜기
              </Button>
            )}
          </div>
        </div>

        {msg && <AlertMessage variant="success">{msg}</AlertMessage>}
      </div>
    </section>
  );
}
