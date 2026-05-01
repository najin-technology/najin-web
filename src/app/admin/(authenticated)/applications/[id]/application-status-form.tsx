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
const APP_STEPS = ["서류검토", "면접예정", "합격"];

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
  const currentIdx = APP_STEPS.indexOf(currentStatus);

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

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-4 min-w-0 overflow-hidden">
        {APP_STEPS.map((step, i) => {
          const isActive = i <= currentIdx;
          const isCurrent = step === currentStatus;
          return (
            <div key={step} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center gap-1.5 ${isCurrent ? "font-bold text-brand-navy" : isActive ? "text-green-700 font-semibold" : "text-gray-400 font-medium"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCurrent ? "bg-brand-navy text-white" : isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {i + 1}
                </div>
                <span className="text-[13px]">{step}</span>
              </div>
              {i < APP_STEPS.length - 1 && (
                <div className={`flex-1 h-px ${isActive && i < currentIdx ? "bg-emerald-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

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
        className="w-full bg-brand-navy hover:bg-brand-navy-light text-white rounded-lg shadow-sm font-semibold"
      >
        {pending ? "저장 중..." : "저장하기"}
      </Button>
    </form>
  );
}
