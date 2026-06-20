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
  /** When set, shows a "취소" button; parent owns the reason dialog. */
  onCancelClick?: () => void;
  /** When set, shows a "삭제" button; parent owns the warning dialog. */
  onDeleteClick?: () => void;
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
  onCancelClick,
  onDeleteClick,
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
      <span className="text-[13px] text-white/80 mr-1">상태 일괄 변경:</span>
      <div className="flex flex-wrap gap-1.5">
        {statusOptions.map((s) => (
          <Button
            key={s}
            size="sm"
            disabled={pending}
            onClick={() => handleSelect(s)}
            className="bg-white/10 hover:bg-white/20 text-white h-8 px-3 text-[13px] font-semibold"
          >
            {s}
          </Button>
        ))}
      </div>
      {(onCancelClick || onDeleteClick) && <div className="h-4 w-px bg-white/20" />}
      {onCancelClick && (
        <Button
          size="sm"
          disabled={pending}
          onClick={onCancelClick}
          className="bg-rose-500/20 hover:bg-rose-500/30 text-white h-8 px-3 text-[13px] font-semibold"
        >
          취소
        </Button>
      )}
      {onDeleteClick && (
        <Button
          size="sm"
          disabled={pending}
          onClick={onDeleteClick}
          className="bg-red-600/80 hover:bg-red-600 text-white h-8 px-3 text-[13px] font-semibold"
        >
          삭제
        </Button>
      )}
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
