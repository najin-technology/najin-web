"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelQuote } from "../actions";
import { matchesLocale } from "@/lib/detect-script";

const LOCALE_LABEL: Record<"ko" | "en" | "zh", string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
};

export function CancelQuote({
  quoteId,
  locale,
  cancelled,
}: {
  quoteId: string;
  locale: "ko" | "en" | "zh";
  cancelled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  const label = LOCALE_LABEL[locale];
  const warn = reason.trim() !== "" && !matchesLocale(reason, locale);

  if (cancelled) {
    return <p className="text-sm font-semibold text-rose-600">취소된 견적입니다.</p>;
  }

  function submit() {
    if (!reason.trim()) {
      toast.error("취소 사유를 입력해주세요.");
      return;
    }
    if (!confirm("이 견적을 취소하고 고객에게 취소 안내 메일을 보냅니다. 진행할까요?")) return;
    start(async () => {
      const res = await cancelQuote(quoteId, reason);
      if (res.ok) {
        toast.success("견적을 취소하고 안내 메일을 발송했습니다.");
        router.refresh();
      } else {
        toast.error(res.error ?? "취소에 실패했습니다.");
      }
    });
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
      >
        견적 취소
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="cancel_reason" className="block text-sm font-semibold text-brand-charcoal">
        취소 사유 <span className="text-rose-500">*</span>
        <span className="ml-1 font-normal text-gray-500">({label}로 작성 — 고객에게 전송됩니다)</span>
      </label>
      <textarea
        id="cancel_reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="고객에게 전달될 취소 사유"
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-relaxed focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
      />
      {warn && (
        <p className="text-xs text-amber-600">
          ⚠️ 사유가 견적 요청 언어({label})와 다른 것 같습니다.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setReason("");
          }}
          disabled={pending}
        >
          닫기
        </Button>
        <Button
          onClick={submit}
          disabled={pending}
          className="bg-rose-600 hover:bg-rose-700 text-white"
        >
          {pending ? "취소 중..." : "취소 확정"}
        </Button>
      </div>
    </div>
  );
}
