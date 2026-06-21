"use client";

import { useActionState, useState } from "react";
import { createNotice, updateNotice } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormStatusBar } from "@/components/admin/form-status-bar";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { AlertMessage } from "@/components/admin/alert-message";
import { ArticlePreview } from "@/components/admin/article-preview";
import { Eye, EyeOff } from "lucide-react";

type NoticeData = {
  id?: string;
  title_ko: string;
  title_en: string | null;
  content_ko: string | null;
  content_en: string | null;
  is_published: boolean;
};

export function NoticeForm({
  notice,
  mode,
}: {
  notice?: NoticeData;
  mode: "create" | "edit";
}) {
  const action = mode === "create" ? createNotice : updateNotice;
  const [state, formAction, pending] = useActionState(action, {});
  const [isPublished, setIsPublished] = useState(notice?.is_published ?? false);
  // 미리보기 실시간 반영용 상태 (저장은 기존 name 으로 그대로 전송)
  const [titleKo, setTitleKo] = useState(notice?.title_ko || "");
  const [titleEn, setTitleEn] = useState(notice?.title_en || "");
  const [contentKo, setContentKo] = useState(notice?.content_ko || "");
  const [contentEn, setContentEn] = useState(notice?.content_en || "");
  const [isPreview, setIsPreview] = useState(false);
  const [tabValue, setTabValue] = useState(() => {
    if (typeof window === "undefined") return "ko";
    return new URLSearchParams(window.location.search).get("tab") || "ko";
  });

  const langs = [
    {
      key: "ko",
      titleLabel: "제목 (한국어) *", titleName: "title_ko", titlePh: "제목을 입력하세요", required: true,
      contentLabel: "내용 (한국어)", contentPh: "내용을 입력하세요",
      title: titleKo, setTitle: setTitleKo, content: contentKo, setContent: setContentKo,
    },
    {
      key: "en",
      titleLabel: "Title (English)", titleName: "title_en", titlePh: "Enter notice title", required: false,
      contentLabel: "Content (English)", contentPh: "Enter notice content",
      title: titleEn, setTitle: setTitleEn, content: contentEn, setContent: setContentEn,
    },
  ] as const;

  return (
    <form action={formAction} className="space-y-6">
      {notice?.id && <input type="hidden" name="id" value={notice.id} />}
      <input type="hidden" name="is_published" value={String(isPublished)} />
      <input type="hidden" name="content_ko" value={contentKo} />
      <input type="hidden" name="content_en" value={contentEn} />

      {state.error && <AlertMessage>{state.error}</AlertMessage>}

      <FormStatusBar checked={isPublished} onCheckedChange={setIsPublished} activeLabel="공개" inactiveLabel="비공개" />

      <div className="border-t border-gray-200 pt-5 mt-4">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.1em]">콘텐츠</p>
      </div>

      <Tabs
        value={tabValue}
        onValueChange={(v) => {
          setTabValue(v);
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", v);
            window.history.replaceState({}, "", url.toString());
          }
        }}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="ko">한국어</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          <Button
            type="button"
            variant={isPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className={`gap-1.5 text-[13px] font-semibold ${isPreview ? "bg-brand-navy text-white" : ""}`}
          >
            {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPreview ? "미리보기 끄기" : "미리보기"}
          </Button>
        </div>

        {langs.map((l) => (
          <TabsContent key={l.key} value={l.key} className="mt-4">
            <div className={isPreview ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" : "space-y-4"}>
              {/* 왼쪽: 편집 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={l.titleName}>{l.titleLabel}</Label>
                  <Input
                    id={l.titleName}
                    name={l.titleName}
                    value={l.title}
                    onChange={(e) => l.setTitle(e.target.value)}
                    required={l.required}
                    placeholder={l.titlePh}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{l.contentLabel}</Label>
                  <TiptapEditor content={l.content} onChange={l.setContent} placeholder={l.contentPh} />
                </div>
              </div>

              {/* 오른쪽: 실시간 미리보기 */}
              {isPreview && (
                <div className="lg:sticky lg:top-24">
                  <ArticlePreview title={l.title} html={l.content} />
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-navy hover:bg-brand-navy-light text-white rounded-lg shadow-sm min-w-[100px] font-semibold"
        >
          {pending ? "저장 중..." : mode === "create" ? "등록하기" : "수정하기"}
        </Button>
      </div>
    </form>
  );
}
