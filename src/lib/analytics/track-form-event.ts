"use client";

type Action = "focus" | "fill" | "blur_empty" | "submit" | "abandon";

export function trackFormEvent(field: string, action: Action) {
  try {
    const body = JSON.stringify({ field, action });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/form-event", blob)) return;
    }
    fetch("/api/analytics/form-event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // silent — analytics must never break UX
  }
}
