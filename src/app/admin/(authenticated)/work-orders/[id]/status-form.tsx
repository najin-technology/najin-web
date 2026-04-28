"use client";

import { useActionState } from "react";
import { updateWorkOrderStatus } from "../actions";
import { Button } from "@/components/ui/button";
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
import { WORK_ORDER_STATUSES } from "@/lib/status-colors";

export function WorkOrderStatusForm({
  workOrderId,
  currentStatus,
}: {
  workOrderId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(updateWorkOrderStatus, {});
  const currentIdx = WORK_ORDER_STATUSES.indexOf(currentStatus as (typeof WORK_ORDER_STATUSES)[number]);

  const handleSubmit = (formData: FormData) => {
    const newStatus = formData.get("status") as string;
    if (newStatus !== currentStatus) {
      if (!confirm(`상태를 "${newStatus}"(으)로 변경하시겠습니까?`)) return;
    }
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={workOrderId} />

      {state.error && <AlertMessage>{state.error}</AlertMessage>}
      {state.success && <AlertMessage variant="success">상태가 변경되었습니다.</AlertMessage>}

      {/* Step indicator (6단계) */}
      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
        {WORK_ORDER_STATUSES.map((step, i) => {
          const isActive = i <= currentIdx;
          const isCurrent = step === currentStatus;
          return (
            <div key={step} className="flex items-center gap-1 flex-1 min-w-0">
              <div className={`flex flex-col items-center gap-1 min-w-0 ${
                isCurrent ? "font-bold text-brand-navy" : isActive ? "text-emerald-700 font-semibold" : "text-gray-400 font-medium"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                  isCurrent ? "bg-brand-navy text-white" : isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {i + 1}
                </div>
                <span className="text-[11px] truncate w-full text-center">{step}</span>
              </div>
              {i < WORK_ORDER_STATUSES.length - 1 && (
                <div className={`flex-1 h-px mt-3 ${isActive && i < currentIdx ? "bg-emerald-300" : "bg-gray-200"}`} />
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
              {WORK_ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {pending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-navy hover:bg-brand-navy-light text-white"
      >
        {pending ? "저장 중..." : "상태 변경"}
      </Button>
    </form>
  );
}
