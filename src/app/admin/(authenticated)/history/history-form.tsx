"use client";

import { useActionState, useRef } from "react";
import { createHistoryItem, updateHistoryItem } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertMessage } from "@/components/admin/alert-message";

type HistoryItemData = {
  id: string;
  year: number;
  month: number | null;
  description_ko: string;
  description_en: string | null;
  sort_order: number;
};

export function HistoryAddForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prevState: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await createHistoryItem(prevState, formData);
      if (result.success) {
        formRef.current?.reset();
      }
      return result;
    },
    {}
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-brand-navy mb-4">
        새 연혁 추가
      </h2>

      <form ref={formRef} action={formAction} className="space-y-4">
        {state.error && (
          <AlertMessage>{state.error}</AlertMessage>
        )}
        {state.success && (
          <AlertMessage variant="success">추가되었습니다.</AlertMessage>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label htmlFor="new-year">연도 *</Label>
            <Input
              id="new-year"
              name="year"
              type="number"
              required
              placeholder="2024"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-month">월</Label>
            <Input
              id="new-month"
              name="month"
              type="number"
              min={1}
              max={12}
              placeholder="1~12"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-sort">순서</Label>
            <Input
              id="new-sort"
              name="sort_order"
              type="number"
              defaultValue={0}
            />
          </div>
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label htmlFor="new-desc-ko">설명 (한국어) *</Label>
            <Input
              id="new-desc-ko"
              name="description_ko"
              required
              placeholder="연혁 내용"
            />
          </div>
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label htmlFor="new-desc-en">설명 (영어)</Label>
            <Input
              id="new-desc-en"
              name="description_en"
              placeholder="History description"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-navy hover:bg-brand-navy-light text-white rounded-lg shadow-sm font-semibold"
        >
          {pending ? "추가 중..." : "추가"}
        </Button>
      </form>
    </div>
  );
}

export function HistoryEditForm({
  item,
  onCancel,
}: {
  item: HistoryItemData;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateHistoryItem, {});

  return (
    <form action={formAction} className="flex items-end gap-2">
      <input type="hidden" name="id" value={item.id} />

      {state.error && (
        <span className="text-red-600 text-[13px] font-semibold">{state.error}</span>
      )}

      <div className="space-y-1">
        <Label className="text-[13px] font-medium">연도</Label>
        <Input
          name="year"
          type="number"
          defaultValue={item.year}
          required
          className="w-20"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[13px] font-medium">월</Label>
        <Input
          name="month"
          type="number"
          min={1}
          max={12}
          defaultValue={item.month ?? ""}
          className="w-16"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[13px] font-medium">순서</Label>
        <Input
          name="sort_order"
          type="number"
          defaultValue={item.sort_order}
          className="w-16"
        />
      </div>
      <div className="space-y-1 flex-1">
        <Label className="text-[13px] font-medium">설명 (한국어)</Label>
        <Input
          name="description_ko"
          defaultValue={item.description_ko}
          required
        />
      </div>
      <div className="space-y-1 flex-1">
        <Label className="text-[13px] font-medium">설명 (영어)</Label>
        <Input
          name="description_en"
          defaultValue={item.description_en ?? ""}
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        size="sm"
        className="bg-brand-navy hover:bg-brand-charcoal text-white"
      >
        {pending ? "저장..." : "저장"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        취소
      </Button>
    </form>
  );
}
