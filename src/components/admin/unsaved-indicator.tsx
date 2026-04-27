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
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      미저장
    </span>
  );
}
