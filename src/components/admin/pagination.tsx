"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  total,
  pageSize = 20,
}: {
  total: number;
  pageSize?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-400 tabular-nums">
        {total}건 중 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, total)}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="이전 페이지"
          className="rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs text-gray-600 font-medium px-2 tabular-nums">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="다음 페이지"
          className="rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
