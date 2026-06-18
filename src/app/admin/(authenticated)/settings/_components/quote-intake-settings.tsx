"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { saveQuoteIntakeSettings } from "../actions";
import { matchesLocale } from "@/lib/detect-script";

type Settings = {
  quotes_paused: boolean;
  pause_message_ko: string;
  pause_message_en: string;
  pause_message_zh: string;
};

const LOCALES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
] as const;

export function QuoteIntakeSettings({ initial }: { initial: Settings }) {
  const [paused, setPaused] = useState(initial.quotes_paused);
  const [msg, setMsg] = useState<Record<"ko" | "en" | "zh", string>>({
    ko: initial.pause_message_ko,
    en: initial.pause_message_en,
    zh: initial.pause_message_zh,
  });
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await saveQuoteIntakeSettings({
        quotes_paused: paused,
        pause_message_ko: msg.ko,
        pause_message_en: msg.en,
        pause_message_zh: msg.zh,
      });
      if (res.ok) toast.success("저장되었습니다.");
      else toast.error(res.error ?? "저장에 실패했습니다.");
    });
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-brand-navy">견적 접수</h2>
        <p className="text-sm text-gray-600 mt-1">
          일시중지하면 견적 페이지가 폼 대신 안내문 + 연락처 받기(콜백)로 바뀝니다.
        </p>
      </div>

      <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={paused}
          onChange={(e) => setPaused(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span className="text-sm font-semibold text-brand-charcoal">견적 접수 일시중지</span>
      </label>

      <div className="space-y-4">
        {LOCALES.map(({ code, label }) => {
          const value = msg[code];
          const warn = !matchesLocale(value, code);
          return (
            <div key={code}>
              <Label htmlFor={`pm_${code}`}>{label} 안내문 (선택)</Label>
              <textarea
                id={`pm_${code}`}
                value={value}
                onChange={(e) => setMsg((m) => ({ ...m, [code]: e.target.value }))}
                rows={3}
                placeholder="비우면 기본 안내문이 표시됩니다."
                className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-relaxed focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
              {warn && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ 입력 언어가 {label}와(과) 다른 것 같습니다.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </section>
  );
}
