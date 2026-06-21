"use client";

import DOMPurify from "isomorphic-dompurify";

// 글쓰기 화면 좌우 분할용 실시간 미리보기.
// 제목+요약+(카테고리/대표이미지)+본문을 "글 한 편"처럼 보여준다.
// 공개 페이지를 픽셀 단위로 복제하지 않고, 구성을 한눈에 보여주는 데 목적.
export function ArticlePreview({
  title,
  html,
  excerpt,
  category,
  thumbnailUrl,
  emptyTitle = "(제목을 입력하세요)",
  emptyBody = "여기에 입력하는 내용이 실시간으로 표시됩니다.",
}: {
  title?: string;
  html?: string;
  excerpt?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  const hasBody = !!html && html.replace(/<[^>]*>/g, "").trim().length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
        미리보기
      </div>
      <div className="p-6">
        {thumbnailUrl ? (
          // 임의 URL(상대경로·supabase) 미리보기라 next/image 대신 일반 img 사용.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            className="w-full rounded-lg mb-5 object-cover max-h-56 bg-gray-100"
          />
        ) : null}

        {category ? (
          <span className="inline-block mb-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-navy/10 text-brand-navy">
            {category}
          </span>
        ) : null}

        <h1
          className={`text-2xl font-bold leading-snug ${
            title ? "text-gray-900" : "text-gray-300"
          }`}
        >
          {title || emptyTitle}
        </h1>

        {excerpt ? <p className="mt-2 text-gray-500">{excerpt}</p> : null}

        <div className="mt-5 border-t border-gray-100 pt-5">
          {hasBody ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html!) }}
            />
          ) : (
            <p className="text-sm text-gray-400">{emptyBody}</p>
          )}
        </div>
      </div>
    </div>
  );
}
