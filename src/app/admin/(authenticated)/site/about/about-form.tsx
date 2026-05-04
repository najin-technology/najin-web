"use client";

import { useActionState } from "react";
import { updateSiteAbout } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertMessage } from "@/components/admin/alert-message";
import type { SiteAbout } from "@/lib/queries";

const LOCALES = [
  { code: "ko", label: "한국어 (KO)" },
  { code: "en", label: "English (EN)" },
  { code: "zh", label: "中文 (ZH)" },
] as const;

export function AboutForm({ initial }: { initial: SiteAbout | null }) {
  const [state, formAction, pending] = useActionState(updateSiteAbout, {});

  return (
    <form action={formAction} className="space-y-8">
      {state.error && <AlertMessage>{state.error}</AlertMessage>}
      {state.success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          저장되었습니다.
        </div>
      )}

      {LOCALES.map(({ code, label }) => {
        const nameKey = `ceo_name_${code}` as const;
        const greetingKey = `ceo_greeting_${code}` as const;
        return (
          <fieldset
            key={code}
            className="space-y-4 rounded-xl border border-gray-200 bg-white p-5"
          >
            <legend className="px-2 text-sm font-bold text-brand-navy">
              {label}
            </legend>

            <div>
              <Label htmlFor={nameKey}>대표자 표시명</Label>
              <Input
                id={nameKey}
                name={nameKey}
                defaultValue={initial?.[nameKey] ?? ""}
                placeholder="예: 대표이사 ○○○"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor={greetingKey}>인사말 본문</Label>
              <textarea
                id={greetingKey}
                name={greetingKey}
                defaultValue={initial?.[greetingKey] ?? ""}
                rows={10}
                className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-relaxed shadow-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                placeholder="여러 줄로 작성 가능합니다. 줄바꿈은 그대로 표시됩니다."
              />
            </div>
          </fieldset>
        );
      })}

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
