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
import { Eye, EyeOff } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

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
  const [isPublished, setIsPublished] = useState(
    notice?.is_published ?? false
  );
  const [contentKo, setContentKo] = useState(notice?.content_ko || "");
  const [contentEn, setContentEn] = useState(notice?.content_en || "");
  const [isPreview, setIsPreview] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {notice?.id && <input type="hidden" name="id" value={notice.id} />}
      <input type="hidden" name="is_published" value={String(isPublished)} />
      <input type="hidden" name="content_ko" value={contentKo} />
      <input type="hidden" name="content_en" value={contentEn} />

      {state.error && (
        <AlertMessage>{state.error}</AlertMessage>
      )}

      <FormStatusBar checked={isPublished} onCheckedChange={setIsPublished} activeLabel="공개" inactiveLabel="비공개" />

      <div className="border-t border-gray-100 pt-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">콘텐츠</p>
      </div>

      <Tabs defaultValue="ko">
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
            className={`gap-1.5 text-xs ${isPreview ? "bg-brand-navy text-white" : ""}`}
          >
            {isPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {isPreview ? "편집 모드" : "미리보기"}
          </Button>
        </div>

        <TabsContent value="ko" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title_ko">제목 (한국어) *</Label>
            <Input
              id="title_ko"
              name="title_ko"
              defaultValue={notice?.title_ko || ""}
              required
              placeholder="공지사항 제목을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label>내용 (한국어)</Label>
            {isPreview ? (
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/30">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentKo) }}
                />
              </div>
            ) : (
              <TiptapEditor
                content={contentKo}
                onChange={setContentKo}
                placeholder="공지사항 내용을 입력하세요"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="en" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title_en">Title (English)</Label>
            <Input
              id="title_en"
              name="title_en"
              defaultValue={notice?.title_en || ""}
              placeholder="Enter notice title"
            />
          </div>
          <div className="space-y-2">
            <Label>Content (English)</Label>
            {isPreview ? (
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/30">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentEn) }}
                />
              </div>
            ) : (
              <TiptapEditor
                content={contentEn}
                onChange={setContentEn}
                placeholder="Enter notice content"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-navy hover:bg-brand-navy-light text-white rounded-lg shadow-sm min-w-[100px]"
        >
          {pending
            ? "저장 중..."
            : mode === "create"
              ? "등록하기"
              : "수정하기"}
        </Button>
      </div>
    </form>
  );
}
