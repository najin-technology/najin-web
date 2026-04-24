"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTracker({ locale }: { locale: string }) {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (pathname === lastTracked.current) return;

    lastTracked.current = pathname;

    const body = JSON.stringify({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      locale,
    });

    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([body], { type: "application/json" });
        const sent = navigator.sendBeacon("/api/analytics/track", blob);
        if (sent) return;
      }
    } catch {
      // sendBeacon 사용 불가 — fetch로 fallback
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // 조용히 실패 — analytics는 사용자 경험에 영향 없어야 함
    });
  }, [pathname, locale]);

  return null;
}
