"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveTemplate, sendTestEmail } from "../actions";
import { renderEmailHtml, subjectToTitle } from "@/lib/email-layout";
import { toast } from "sonner";

export type TemplateData = {
  key: string;
  trigger_label_ko: string;
  subject_ko: string;
  subject_en: string;
  subject_zh: string;
  body_ko: string;
  body_en: string;
  body_zh: string;
  enabled: boolean;
  variables_doc: string;
};

type Locale = "ko" | "en" | "zh";

const LOCALES: Array<{ code: Locale; label: string }> = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
];

// 미리보기/테스트에 쓰이는 샘플 변수 (서버 SAMPLE_VARS 와 동일 + cancel_reason).
const PREVIEW_VARS: Record<string, string> = {
  contact_name: "홍길동",
  company_name: "테스트회사",
  quote_id_short: "TEST1234",
  status_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.najin-tech.com"}/ko/quote/status?id=TEST1234`,
  processing_type: "우레탄 가공",
  cancel_reason: "현재 해당 가공 라인이 예약으로 가득 차 일정 내 진행이 어렵습니다.",
};
const fillVars = (t: string) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => PREVIEW_VARS[k] ?? "");

export function TemplateEditor({ template }: { template: TemplateData }) {
  const [enabled, setEnabled] = useState(template.enabled);
  const [subjects, setSubjects] = useState({
    ko: template.subject_ko,
    en: template.subject_en,
    zh: template.subject_zh,
  });
  const [bodies, setBodies] = useState({
    ko: template.body_ko,
    en: template.body_en,
    zh: template.body_zh,
  });
  const [activeLocale, setActiveLocale] = useState<Locale>("ko");
  const [testEmail, setTestEmail] = useState("");
  const [savePending, startSave] = useTransition();
  const [testPending, startTest] = useTransition();
  const bodyRefs = useRef<Record<Locale, HTMLTextAreaElement | null>>({
    ko: null,
    en: null,
    zh: null,
  });

  // Parse variables list from variables_doc field (e.g. "{{contact_name}} {{company_name}}")
  const variableList = Array.from(
    template.variables_doc.matchAll(/\{\{(\w+)\}\}/g),
  ).map((m) => m[1]);

  function insertVariable(name: string) {
    const ta = bodyRefs.current[activeLocale];
    const placeholder = `{{${name}}}`;
    if (!ta) {
      setBodies((prev) => ({ ...prev, [activeLocale]: prev[activeLocale] + placeholder }));
      return;
    }
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const next = ta.value.slice(0, start) + placeholder + ta.value.slice(end);
    setBodies((prev) => ({ ...prev, [activeLocale]: next }));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + placeholder.length, start + placeholder.length);
    });
  }

  function handleSave() {
    startSave(async () => {
      const res = await saveTemplate({
        key: template.key,
        enabled,
        subject_ko: subjects.ko,
        subject_en: subjects.en,
        subject_zh: subjects.zh,
        body_ko: bodies.ko,
        body_en: bodies.en,
        body_zh: bodies.zh,
      });
      if (res.ok) toast.success("저장되었습니다.");
      else toast.error(res.error ?? "저장에 실패했습니다.");
    });
  }

  function handleTest() {
    if (!testEmail) {
      toast.error("테스트 수신 이메일을 입력해주세요.");
      return;
    }
    startTest(async () => {
      try {
        const res = await sendTestEmail({
          key: template.key,
          to: testEmail,
          locale: activeLocale,
        });
        if (res.ok) toast.success(`${activeLocale.toUpperCase()} 테스트 메일을 발송했습니다.`);
        else toast.error(res.error ?? "발송 실패");
      } catch {
        toast.error("발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    });
  }

  const previewSubject = fillVars(subjects[activeLocale] || subjects.ko);
  const previewHtml = renderEmailHtml({
    title: subjectToTitle(previewSubject),
    bodyText: fillVars(bodies[activeLocale] || bodies.ko),
    locale: activeLocale,
    statusUrl: PREVIEW_VARS.status_url,
    referenceValue: PREVIEW_VARS.quote_id_short,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  });

  return (
    <div className="space-y-6">
      {/* Enable toggle */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <input
          id="enabled"
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <label htmlFor="enabled" className="text-sm font-semibold text-brand-charcoal">
          이 템플릿을 활성화 (체크 해제 시 자동 발송이 일어나지 않습니다)
        </label>
      </div>

      {/* Locale tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-2">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => setActiveLocale(code)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeLocale === code
                  ? "border-brand-navy text-brand-navy"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Subject + body for active locale */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <Label htmlFor={`subject-${activeLocale}`}>제목</Label>
          <Input
            id={`subject-${activeLocale}`}
            value={subjects[activeLocale]}
            onChange={(e) => setSubjects((prev) => ({ ...prev, [activeLocale]: e.target.value }))}
            placeholder="메일 제목"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor={`body-${activeLocale}`}>본문</Label>
          <textarea
            id={`body-${activeLocale}`}
            ref={(el) => {
              bodyRefs.current[activeLocale] = el;
            }}
            value={bodies[activeLocale]}
            onChange={(e) => setBodies((prev) => ({ ...prev, [activeLocale]: e.target.value }))}
            rows={14}
            className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-relaxed font-mono shadow-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            placeholder="메일 본문 (변수는 {{변수명}} 형식)"
          />
        </div>

        {variableList.length > 0 && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
            <p className="text-xs font-bold text-gray-700 mb-2">사용 가능한 변수 (클릭하여 본문에 삽입)</p>
            <div className="flex flex-wrap gap-2">
              {variableList.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="text-xs font-mono bg-white border border-gray-300 hover:border-brand-navy hover:text-brand-navy px-2 py-1 rounded"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live preview — 실제 발송되는 HTML 메일 형태 (샘플 변수 적용) */}
      <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-brand-navy">미리보기 ({activeLocale.toUpperCase()})</h3>
          <span className="text-xs text-gray-500">샘플 변수 적용 · 실제 발송 형태</span>
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <span className="text-gray-500">제목: </span>
          <span className="font-semibold text-brand-charcoal">{previewSubject}</span>
        </div>
        <iframe
          title="email-preview"
          srcDoc={previewHtml}
          className="w-full h-[520px] rounded-md border border-gray-200 bg-white"
        />
      </div>

      {/* Test send */}
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-bold text-brand-navy">테스트 발송</h3>
        <p className="text-xs text-gray-600">
          현재 선택된 언어 ({activeLocale.toUpperCase()})의 템플릿이 샘플 변수와 함께 발송됩니다. 시간당 10건 제한.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="수신자 이메일"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleTest}
            disabled={testPending}
            variant="outline"
          >
            {testPending ? "발송 중..." : "테스트 보내기"}
          </Button>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
        <Button onClick={handleSave} disabled={savePending}>
          {savePending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
