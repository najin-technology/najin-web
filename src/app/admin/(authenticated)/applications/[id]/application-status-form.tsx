"use client";

import { useActionState } from "react";
import { updateApplicationStatus } from "../actions";
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

const STATUSES = ["서류검토", "면접예정", "합격", "불합격"];

export function ApplicationStatusForm({
  applicationId,
  currentStatus,
  currentMemo,
}: {
  applicationId: string;
  currentStatus: string;
  currentMemo: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateApplicationStatus,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={applicationId} />

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2.5 rounded-lg text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
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
        className="w-full bg-[#1B2A4A] hover:bg-[#243456] text-white rounded-lg shadow-sm"
      >
        {pending ? "저장 중..." : "저장하기"}
      </Button>
    </form>
  );
}
