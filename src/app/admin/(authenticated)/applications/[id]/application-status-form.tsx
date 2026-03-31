"use client";

import { useActionState, useRef } from "react";
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
import { AlertMessage } from "@/components/admin/alert-message";
import { Loader2 } from "lucide-react";

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
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    const newStatus = formData.get("status") as string;
    if (newStatus !== currentStatus) {
      if (!confirm(`상태를 "${newStatus}"(으)로 변경하시겠습니까?`)) return;
    }
    formAction(formData);
  };

  return (
    <form action={handleSubmit} ref={formRef} className="space-y-4">
      <input type="hidden" name="id" value={applicationId} />

      {state.error && (
        <AlertMessage>{state.error}</AlertMessage>
      )}
      {state.success && (
        <AlertMessage variant="success">저장되었습니다.</AlertMessage>
      )}

      <div className="space-y-2">
        <Label>상태 변경</Label>
        <div className="flex items-center gap-2">
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
          {pending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>
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
        className="w-full bg-brand-navy hover:bg-brand-navy-light text-white rounded-lg shadow-sm"
      >
        {pending ? "저장 중..." : "저장하기"}
      </Button>
    </form>
  );
}
