"use client";

import { useEffect } from "react";

export function UnsavedIndicator({ isDirty }: { isDirty: boolean }) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  if (!isDirty) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      미저장
    </span>
  );
}
