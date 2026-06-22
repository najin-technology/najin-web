"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { PERSIST_NOTICE_MS } from "@/lib/session";
import { extendAutoLogin } from "@/app/admin/(authenticated)/settings/actions";

export function SessionGuard({ persistRemainingMs = 0 }: { persistRemainingMs?: number }) {
  // 자동 로그인 활성 시: 유휴 자동로그아웃이 꺼져 있으므로 유휴 경고 대신
  // 만료 1일 전 안내만 띄운다.
  if (persistRemainingMs > 0) {
    return <PersistExpiryNotice remainingMs={persistRemainingMs} />;
  }
  return <IdleWarning />;
}

function PersistExpiryNotice({ remainingMs }: { remainingMs: number }) {
  const [dismissed, setDismissed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (dismissed || remainingMs <= 0 || remainingMs > PERSIST_NOTICE_MS) return null;

  const hours = Math.max(1, Math.ceil(remainingMs / 3600000));

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white rounded-2xl shadow-2xl border border-amber-200 p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⏰</span>
        <div className="flex-1">
          <h3 className="font-bold text-brand-charcoal text-sm mb-1">자동 로그인이 곧 만료됩니다</h3>
          <p className="text-[13px] text-gray-600 mb-3 leading-relaxed">
            약 {hours}시간 후 자동 로그인이 해제됩니다. 계속 유지하려면 연장하세요.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await extendAutoLogin();
                  window.location.reload();
                })
              }
              className="px-3 py-1.5 text-sm font-semibold bg-brand-navy text-white rounded-lg hover:bg-brand-navy-light transition-colors disabled:opacity-50"
            >
              30일 연장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IdleWarning() {
  const lastActivity = useRef(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    lastActivity.current = Date.now();

    const update = () => {
      lastActivity.current = Date.now();
      setShowWarning(false);
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, update, { passive: true }));

    const interval = setInterval(() => {
      const idle = Date.now() - lastActivity.current;
      if (idle > 25 * 60 * 1000) { // 25 minutes
        setShowWarning(true);
      }
    }, 60000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, update));
      clearInterval(interval);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⏰</span>
        </div>
        <h3 className="text-lg font-bold text-brand-charcoal mb-1.5">세션 만료 경고</h3>
        <p className="text-sm text-gray-600 mb-5 font-medium leading-relaxed">
          25분 이상 활동이 없습니다. 보안을 위해 곧 자동으로 로그아웃됩니다.
        </p>
        <button
          onClick={() => {
            setShowWarning(false);
            // Touch the server to extend session
            fetch("/admin", { method: "HEAD" }).catch(() => {});
          }}
          className="w-full bg-brand-navy text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-navy-light transition-colors"
        >
          계속 작업하기
        </button>
      </div>
    </div>
  );
}
