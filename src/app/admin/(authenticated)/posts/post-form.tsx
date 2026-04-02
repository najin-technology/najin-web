"use client";

import { useActionState, useState, useEffect } from "react";
import { createPost, updatePost } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormStatusBar } from "@/components/admin/form-status-bar";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { AlertMessage } from "@/components/admin/alert-message";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Home } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

const CATEGORIES = ["우레탄", "합성수지", "CNC가공", "금형", "EV부품"];
const CONTENT_TYPES = [
  { value: "제작사례", label: "제작사례" },
  { value: "제품홍보", label: "제품홍보" },
];

type PostData = {
  id?: string;
  slug: string;
  title_ko: string;
  title_en: string | null;
  content_ko: string | null;
  content_en: string | null;
  excerpt_ko: string | null;
  excerpt_en: string | null;
  category: string;
  content_type: string | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  is_published: boolean;
  show_on_home: boolean | null;
};

export function PostForm({
  post,
  mode,
}: {
  post?: PostData;
  mode: "create" | "edit";
}) {
  const action = mode === "create" ? createPost : updatePost;
  const [state, formAction, pending] = useActionState(action, {});
  const [isPublished, setIsPublished] = useState(
    post?.is_published ?? false
  );
  const [showOnHome, setShowOnHome] = useState(post?.show_on_home ?? true);
  const [contentKo, setContentKo] = useState(post?.content_ko || "");
  const [contentEn, setContentEn] = useState(post?.content_en || "");
  const [isPreview, setIsPreview] = useState(false);
  const [tabValue, setTabValue] = useState("ko");

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab) setTabValue(tab);
  }, []);

  return (
    <form action={formAction} className="space-y-6">
      {post?.id && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="is_published" value={String(isPublished)} />
      <input type="hidden" name="show_on_home" value={String(showOnHome)} />
      <input type="hidden" name="content_ko" value={contentKo} />
      <input type="hidden" name="content_en" value={contentEn} />

      {state.error && (
        <AlertMessage>{state.error}</AlertMessage>
      )}

      <FormStatusBar checked={isPublished} onCheckedChange={setIsPublished} activeLabel="공개" inactiveLabel="비공개" />

      <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">홈 노출</span>
          <Switch checked={showOnHome} onCheckedChange={setShowOnHome} />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5 mt-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">기본 정보</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="slug">슬러그 (URL) *</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={post?.slug || ""}
            required
            placeholder="slug-format"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">카테고리 (소재/공법) *</Label>
          <select
            id="category"
            name="category"
            defaultValue={post?.category || ""}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">선택하세요</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content_type">콘텐츠 유형 *</Label>
          <select
            id="content_type"
            name="content_type"
            defaultValue={post?.content_type || "제작사례"}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {CONTENT_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>{ct.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={post?.tags?.join(", ") || ""}
            placeholder="태그1, 태그2, 태그3"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="thumbnail_url">썸네일 URL</Label>
          <Input
            id="thumbnail_url"
            name="thumbnail_url"
            defaultValue={post?.thumbnail_url || ""}
            placeholder="/images/posts/example.jpg"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5 mt-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">콘텐츠</p>
      </div>

      <Tabs value={tabValue} onValueChange={(v) => {
        setTabValue(v);
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("tab", v);
          window.history.replaceState({}, "", url.toString());
        }
      }}>
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
              defaultValue={post?.title_ko || ""}
              required
              placeholder="제목을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt_ko">요약 (한국어)</Label>
            <Input
              id="excerpt_ko"
              name="excerpt_ko"
              defaultValue={post?.excerpt_ko || ""}
              placeholder="한 줄 요약"
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
                placeholder="내용을 입력하세요"
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
              defaultValue={post?.title_en || ""}
              placeholder="Post title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt_en">Excerpt (English)</Label>
            <Input
              id="excerpt_en"
              name="excerpt_en"
              defaultValue={post?.excerpt_en || ""}
              placeholder="One-line summary"
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
                placeholder="Enter post content"
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
