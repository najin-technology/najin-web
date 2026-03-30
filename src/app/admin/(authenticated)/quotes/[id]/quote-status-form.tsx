"use client";

import { useActionState } from "react";
import { updateQuoteStatus } from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const STATUSES = ["접수", "검토중", "견적발송", "완료"];

export function QuoteStatusForm({
  quoteId,
  currentStatus,
  currentMemo,
}: {
  quoteId: string;
  currentStatus: string;
  currentMemo: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateQuoteStatus, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={quoteId} />

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
          저장되었습니다.
        </div>
      )}

      <div className="space-y-2">
        <Label>상태 변경</Label>
        <Select name="status" defaultValue={currentStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin_memo">관리자 메모</Label>
        <Textarea
          id="admin_memo"
          name="admin_memo"
          defaultValue={currentMemo || ""}
          placeholder="내부 메모를 입력하세요"
          rows={4}
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-[#1B2A4A] hover:bg-[#2D3748] text-white"
      >
        {pending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
