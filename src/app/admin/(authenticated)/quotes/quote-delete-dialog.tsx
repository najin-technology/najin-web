"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * 견적 기록 삭제 경고 다이얼로그. 일괄/개별 삭제 모두 사용.
 * 소프트 삭제라 첨부는 보존되고 DB 복구는 가능하지만, 고객은 더 이상 조회할 수 없다.
 * 실수 방지를 위해 "삭제"를 직접 입력해야 확정 버튼이 활성화된다.
 */
export function QuoteDeleteDialog({
  open,
  onOpenChange,
  count,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  count: number;
  pending: boolean;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  const confirmed = typed.trim() === "삭제";

  const close = (v: boolean) => {
    if (!v) setTyped("");
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            견적 기록 {count}건 삭제
          </DialogTitle>
          <DialogDescription>이 작업은 고객에게 영향을 줍니다.</DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-1 pl-5 text-sm text-brand-charcoal">
          <li>관리자 목록·통계에서 사라집니다.</li>
          <li className="font-semibold text-rose-600">
            고객이 견적조회 페이지에서 더 이상 조회할 수 없습니다.
          </li>
          <li className="text-gray-500">
            첨부 파일은 보존되며, 필요 시 관리자가 DB에서 복구할 수 있습니다.
          </li>
        </ul>

        <div className="space-y-1.5">
          <label htmlFor="delete-confirm" className="block text-sm text-brand-charcoal">
            계속하려면 <b className="text-rose-600">삭제</b>를 입력하세요.
          </label>
          <input
            id="delete-confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="삭제"
            autoComplete="off"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => close(false)} disabled={pending}>
            닫기
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!confirmed || pending}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {pending ? "삭제 중..." : `${count}건 삭제`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
