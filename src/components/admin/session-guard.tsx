"use client";

import { useEffect, useRef, useState } from "react";

export function SessionGuard() {
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
