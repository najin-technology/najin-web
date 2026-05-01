"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-brand-charcoal mb-1.5">
        문제가 발생했습니다
      </h2>
      <p className="text-sm text-gray-600 mb-6 text-center max-w-sm font-medium leading-relaxed">
        {error.message ||
          "페이지를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요."}
      </p>
      <Button
        onClick={reset}
        className="bg-brand-navy hover:bg-brand-navy-light text-white gap-1.5"
      >
        <RotateCcw className="w-4 h-4" />
        다시 시도
      </Button>
    </div>
  );
}
