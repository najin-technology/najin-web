"use client";

import { useState, useTransition } from "react";
import { updateCustomerStatus, updateCustomerTags, updateCustomerNotes } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["리드", "검토중", "견적전송", "진행중", "완료", "보류", "거절"];

export function CustomerStatusForm({
  customerId,
  status,
  tags,
}: {
  customerId: string;
  status: string;
  tags: string[];
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [pending, startTransition] = useTransition();
  const [tagList, setTagList] = useState<string[]>(tags);
  const [tagInput, setTagInput] = useState("");

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    startTransition(async () => {
      const result = await updateCustomerStatus(customerId, newStatus);
      if (result.error) {
        toast.error(result.error);
        setCurrentStatus(status);
      } else {
        toast.success("상태가 변경되었습니다");
      }
    });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tagList.includes(t)) return;
    const next = [...tagList, t];
    setTagList(next);
    setTagInput("");
    startTransition(async () => {
      await updateCustomerTags(customerId, next);
      toast.success("태그가 추가되었습니다");
    });
  };

  const removeTag = (t: string) => {
    const next = tagList.filter((x) => x !== t);
    setTagList(next);
    startTransition(async () => {
      await updateCustomerTags(customerId, next);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-brand-navy mb-3">상태 관리</h3>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={pending}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50 ${
                currentStatus === s
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-navy"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-brand-navy mb-2">태그</h3>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tagList.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full"
            >
              {t}
              <button
                onClick={() => removeTag(t)}
                disabled={pending}
                className="text-gray-400 hover:text-red-500"
                aria-label="태그 제거"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {tagList.length === 0 && <p className="text-xs text-gray-400">아직 태그가 없습니다.</p>}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="태그 입력 후 Enter"
            className="flex-1 text-xs h-8 px-2.5 rounded-md border border-input bg-background"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={addTag}
            disabled={pending || !tagInput.trim()}
            className="h-8 px-2"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CustomerNotesForm({
  customerId,
  notes,
}: {
  customerId: string;
  notes: string;
}) {
  const [value, setValue] = useState(notes);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const dirty = value !== notes;

  const save = () => {
    startTransition(async () => {
      const result = await updateCustomerNotes(customerId, value);
      if (result.error) {
        toast.error(result.error);
      } else {
        setSavedAt(new Date());
        toast.success("메모가 저장되었습니다");
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <h3 className="text-sm font-semibold text-brand-navy">내부 메모</h3>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="이 고객 관련 메모를 자유롭게 기록하세요. (관리자만 볼 수 있음)"
        rows={6}
        className="text-sm"
      />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-400">
          {savedAt
            ? `저장됨 — ${savedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
            : dirty
              ? "변경됨 — 저장 대기"
              : "변경사항 없음"}
        </p>
        <Button size="sm" onClick={save} disabled={pending || !dirty}>
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
          저장
        </Button>
      </div>
    </div>
  );
}
