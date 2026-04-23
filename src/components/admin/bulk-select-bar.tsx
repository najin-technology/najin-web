"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

type BulkSelectBarProps = {
  selectedCount: number;
  onClear: () => void;
  statusOptions: string[];
  onApply: (status: string) => Promise<{ error?: string; count?: number; success?: boolean }>;
  labelPrefix?: string;
};

/**
 * Sticky bar shown when one or more rows are selected.
 * Lets admin bulk-update status of the selected items.
 */
export function BulkSelectBar({
  selectedCount,
  onClear,
  statusOptions,
  onApply,
  labelPrefix = "선택",
}: BulkSelectBarProps) {
  const [pending, startTransition] = useTransition();

  if (selectedCount === 0) return null;

  const handleSelect = (status: string) => {
    startTransition(async () => {
      const res = await onApply(status);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${res.count ?? selectedCount}건이 "${status}"으로 변경되었습니다`);
        onClear();
      }
    });
  };

  return (
    <div className="sticky top-14 z-20 bg-brand-navy text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <span className="text-sm font-semibold tabular-nums">
        {labelPrefix} {selectedCount}건
      </span>
      <div className="h-4 w-px bg-white/20" />
      <span className="text-xs text-white/70 mr-1">상태 일괄 변경:</span>
      <div className="flex flex-wrap gap-1.5">
        {statusOptions.map((s) => (
          <Button
            key={s}
            size="sm"
            disabled={pending}
            onClick={() => handleSelect(s)}
            className="bg-white/10 hover:bg-white/20 text-white h-7 px-2.5 text-xs"
          >
            {s}
          </Button>
        ))}
      </div>
      {pending && <Loader2 className="w-4 h-4 animate-spin text-white/80" />}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={pending}
        className="ml-auto text-white/70 hover:text-white hover:bg-white/10 h-7 w-7 p-0"
        aria-label="선택 해제"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
