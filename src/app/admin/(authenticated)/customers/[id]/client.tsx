"use client";

import { useState, useTransition } from "react";
import {
  updateCustomerStatus,
  updateCustomerTags,
  updateCustomerNotes,
  updateCustomerDisplay,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, X, Image as ImageIcon } from "lucide-react";
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
              className={`text-[13px] font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                currentStatus === s
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "bg-white text-gray-700 border-gray-200 hover:border-brand-navy"
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
              className="inline-flex items-center gap-1 text-[13px] text-gray-700 font-medium bg-gray-100 px-2 py-0.5 rounded-full"
            >
              {t}
              <button
                onClick={() => removeTag(t)}
                disabled={pending}
                className="text-gray-500 hover:text-red-500"
                aria-label="태그 제거"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {tagList.length === 0 && <p className="text-[13px] text-gray-500 font-medium">아직 태그가 없습니다.</p>}
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
            className="flex-1 text-[13px] h-9 px-2.5 rounded-md border border-input bg-background"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={addTag}
            disabled={pending || !tagInput.trim()}
            className="h-9 px-2.5"
          >
            <Plus className="w-4 h-4" />
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
        <p className="text-xs text-gray-500 font-medium tabular-nums">
          {savedAt
            ? `저장됨 — ${savedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
            : dirty
              ? "변경됨 — 저장 대기"
              : "변경사항 없음"}
        </p>
        <Button size="sm" onClick={save} disabled={pending || !dirty}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          저장
        </Button>
      </div>
    </div>
  );
}

export function CustomerDisplayForm({
  customerId,
  initial,
}: {
  customerId: string;
  initial: {
    client_slug: string | null;
    logo_url: string | null;
    name_en: string | null;
    needs_dark_bg: boolean;
    display_category: string | null;
    display_order: number;
    registered_year: number | null;
  };
}) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const isClient = !!form.client_slug;

  const save = () => {
    startTransition(async () => {
      const res = await updateCustomerDisplay(customerId, form);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("거래처 표시 정보가 저장되었습니다");
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand-navy flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4" />
          거래처 표시 설정
        </h3>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
            isClient
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-gray-50 text-gray-600 border border-gray-200"
          }`}
        >
          {isClient ? "거래처 그리드 노출" : "비노출 (slug 없음)"}
        </span>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed font-medium">
        client_slug 가 비어있으면 거래처 그리드에 노출되지 않습니다.
        slug 설정 시 logo_url 도 필수입니다 (홈/포트폴리오/거래처 페이지에 표시).
      </p>

      <div className="space-y-3">
        <div>
          <Label className="text-[13px] font-medium">client_slug (URL용)</Label>
          <Input
            value={form.client_slug ?? ""}
            onChange={(e) => setForm({ ...form, client_slug: e.target.value || null })}
            placeholder="예: client-slug (영문 lower-kebab)"
            className="text-sm mt-1"
          />
        </div>

        <div>
          <Label className="text-[13px] font-medium">logo_url</Label>
          <Input
            value={form.logo_url ?? ""}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value || null })}
            placeholder="예: /images/logos/client.svg"
            className="text-sm mt-1"
          />
          {form.logo_url && (
            <div className={`mt-2 rounded-md border border-gray-200 p-2 inline-flex items-center justify-center min-w-[120px] min-h-[40px] ${form.needs_dark_bg ? "bg-brand-navy" : "bg-white"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.logo_url} alt="preview" className="max-h-10 max-w-[140px] object-contain" />
            </div>
          )}
        </div>

        <div>
          <Label className="text-[13px] font-medium">영문명 (name_en)</Label>
          <Input
            value={form.name_en ?? ""}
            onChange={(e) => setForm({ ...form, name_en: e.target.value || null })}
            placeholder="예: Company Name (English)"
            className="text-sm mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[13px] font-medium">카테고리</Label>
            <select
              value={form.display_category ?? ""}
              onChange={(e) =>
                setForm({ ...form, display_category: e.target.value || null })
              }
              className="block w-full mt-1 h-9 text-sm rounded-md border border-input px-2 bg-background"
            >
              <option value="">(선택 없음)</option>
              <option value="automotive">자동차</option>
              <option value="industrial">산업</option>
              <option value="overseas">해외</option>
            </select>
          </div>
          <div>
            <Label className="text-[13px] font-medium">순서</Label>
            <Input
              type="number"
              min={0}
              step={10}
              value={form.display_order}
              onChange={(e) =>
                setForm({ ...form, display_order: Number(e.target.value) || 0 })
              }
              className="text-sm mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[13px] font-medium">등록 연도</Label>
            <Input
              type="number"
              min={1900}
              max={2100}
              value={form.registered_year ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  registered_year: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="2014"
              className="text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-[13px] font-medium">어두운 배경</Label>
            <label className="flex items-center gap-2 mt-2 text-[13px] text-gray-700 font-medium">
              <input
                type="checkbox"
                checked={form.needs_dark_bg}
                onChange={(e) =>
                  setForm({ ...form, needs_dark_bg: e.target.checked })
                }
                className="w-4 h-4"
              />
              로고 카드 navy 배경
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-1">
        <Button
          size="sm"
          onClick={save}
          disabled={pending || !dirty}
          className="bg-brand-navy hover:bg-brand-navy-light text-white font-semibold"
        >
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
          저장
        </Button>
      </div>
    </div>
  );
}
