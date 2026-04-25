"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintTrigger() {
  // ?auto=1 — 페이지 진입 시 자동으로 인쇄 다이얼로그 띄우기
  useEffect(() => {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams(window.location.search);
    if (usp.get("auto") === "1") {
      setTimeout(() => window.print(), 300);
    }
  }, []);

  return (
    <Button
      type="button"
      onClick={() => window.print()}
      size="sm"
      className="bg-brand-navy hover:bg-brand-navy-light text-white gap-1.5"
    >
      <Printer className="w-3.5 h-3.5" />
      인쇄
    </Button>
  );
}
