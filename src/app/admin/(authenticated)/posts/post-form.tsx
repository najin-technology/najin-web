"use client";

import { useActionState, useState } from "react";
import { createPost, updatePost } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormStatusBar } from "@/components/admin/form-status-bar";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { AlertMessage } from "@/components/admin/alert-message";
import { ArticlePreview } from "@/components/admin/article-preview";
import { Eye, EyeOff } from "lucide-react";

const CATEGORIES = ["제작사례", "제품"];
const PROCESS_CATEGORIES = ["우레탄", "합성수지", "CNC", "금형", "EV", "기타"];

type PostData = {
  id?: string;
  slug: string;
  title_ko: string;
  title_en: string | null;
  title_zh: string | null;
  content_ko: string | null;
  content_en: string | null;
  content_zh: string | null;
  excerpt_ko: string | null;
  excerpt_en: string | null;
  excerpt_zh: string | null;
  category: string;
  process_category: string | null;
  featured: boolean;
  thumbnail_url: string | null;
  tags: string[] | null;
  is_published: boolean;
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
  const [isPublished, setIsPublished] = useState(post?.is_published ?? false);
  const [featured, setFeatured] = useState(post?.featured ?? false);
  // 미리보기에 실시간 반영하려고 화면 상태로 잡는 값들 (저장은 기존 name 으로 그대로 전송)
  const [category, setCategory] = useState(post?.category || "제작사례");
  const [titleKo, setTitleKo] = useState(post?.title_ko || "");
  const [titleEn, setTitleEn] = useState(post?.title_en || "");
  const [titleZh, setTitleZh] = useState(post?.title_zh || "");
  const [excerptKo, setExcerptKo] = useState(post?.excerpt_ko || "");
  const [excerptEn, setExcerptEn] = useState(post?.excerpt_en || "");
  const [excerptZh, setExcerptZh] = useState(post?.excerpt_zh || "");
  const [contentKo, setContentKo] = useState(post?.content_ko || "");
  const [contentEn, setContentEn] = useState(post?.content_en || "");
  const [contentZh, setContentZh] = useState(post?.content_zh || "");
  const [isPreview, setIsPreview] = useState(false);
  const [tabValue, setTabValue] = useState(() => {
    if (typeof window === "undefined") return "ko";
    return new URLSearchParams(window.location.search).get("tab") || "ko";
  });

  const langs = [
    {
      key: "ko",
      titleLabel: "제목 (한국어) *", titleName: "title_ko", titlePh: "제목을 입력하세요", required: true,
      excerptLabel: "요약 (한국어)", excerptName: "excerpt_ko", excerptPh: "한 줄 요약",
      contentLabel: "내용 (한국어)", contentPh: "내용을 입력하세요",
      title: titleKo, setTitle: setTitleKo, excerpt: excerptKo, setExcerpt: setExcerptKo, content: contentKo, setContent: setContentKo,
    },
    {
      key: "en",
      titleLabel: "Title (English)", titleName: "title_en", titlePh: "Post title", required: false,
      excerptLabel: "Excerpt (English)", excerptName: "excerpt_en", excerptPh: "One-line summary",
      contentLabel: "Content (English)", contentPh: "Enter post content",
      title: titleEn, setTitle: setTitleEn, excerpt: excerptEn, setExcerpt: setExcerptEn, content: contentEn, setContent: setContentEn,
    },
    {
      key: "zh",
      titleLabel: "标题 (中文)", titleName: "title_zh", titlePh: "文章标题", required: false,
      excerptLabel: "摘要 (中文)", excerptName: "excerpt_zh", excerptPh: "一句话摘要",
      contentLabel: "内容 (中文)", contentPh: "输入文章内容",
      title: titleZh, setTitle: setTitleZh, excerpt: excerptZh, setExcerpt: setExcerptZh, content: contentZh, setContent: setContentZh,
    },
  ] as const;

  return (
    <form action={formAction} className="space-y-6">
      {post?.id && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="is_published" value={String(isPublished)} />
      <input type="hidden" name="featured" value={String(featured)} />
      <input type="hidden" name="content_ko" value={contentKo} />
      <input type="hidden" name="content_en" value={contentEn} />
      <input type="hidden" name="content_zh" value={contentZh} />

      {state.error && <AlertMessage>{state.error}</AlertMessage>}

      <FormStatusBar checked={isPublished} onCheckedChange={setIsPublished} activeLabel="공개" inactiveLabel="비공개" />

      <div className="border-t border-gray-200 pt-5 mt-4">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.1em]">기본 정보</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">카테고리 *</Label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="process_category">공정 분류</Label>
          <select
            id="process_category"
            name="process_category"
            defaultValue={post?.process_category || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">미지정</option>
            {PROCESS_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="featured-toggle">전면 노출 (홈·포트폴리오)</Label>
          <label
            htmlFor="featured-toggle"
            className="flex items-center gap-2 h-10 px-3 text-sm font-medium cursor-pointer rounded-md border border-input bg-background"
          >
            <input
              id="featured-toggle"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            대표 사례로 강조
          </label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
          <Input id="tags" name="tags" defaultValue={post?.tags?.join(", ") || ""} placeholder="태그1, 태그2, 태그3" />
        </div>
      </div>
      <p className="text-xs text-gray-500 -mt-2">
        썸네일은 본문에 첨부한 첫 번째 이미지가 자동으로 사용됩니다. URL을 따로 입력할 필요가 없습니다.
      </p>

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
            <TabsTrigger value="zh">中文</TabsTrigger>
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
                  <Label htmlFor={l.excerptName}>{l.excerptLabel}</Label>
                  <Input
                    id={l.excerptName}
                    name={l.excerptName}
                    value={l.excerpt}
                    onChange={(e) => l.setExcerpt(e.target.value)}
                    placeholder={l.excerptPh}
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
                  <ArticlePreview
                    title={l.title}
                    excerpt={l.excerpt}
                    html={l.content}
                    category={category}
                  />
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
