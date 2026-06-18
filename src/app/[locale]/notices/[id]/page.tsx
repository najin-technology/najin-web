import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getNoticeById } from "@/lib/queries";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Calendar } from "lucide-react";
import { SITE_URL as BASE_URL } from "@/lib/env";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;
export const dynamic = "force-static";

export async function generateStaticParams() {
  // Build time 에 발행된 notice id 모두 prerender (locale × id 조합).
  // Supabase client 가 build context 에서 null 일 수 있어 안전하게 처리.
  try {
    if (!supabase) return [];
    const { data } = await supabase
      .from("notices")
      .select("id")
      .eq("is_published", true)
      .is("deleted_at", null);
    if (!data) return [];
    return data.flatMap((n) =>
      ["ko", "en", "zh"].map((locale) => ({ locale, id: n.id })),
    );
  } catch {
    return [];
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  try {
    const { locale, id } = await params;
    const notice = await getNoticeById(id);
    if (!notice) return { title: "Not Found" };

    const title = locale === "ko" ? notice.title_ko : (notice.title_en || notice.title_ko);
    const rawContent = locale === "ko" ? notice.content_ko : (notice.content_en || notice.content_ko);
    const description = rawContent ? stripHtml(rawContent).slice(0, 160) : "";

    // notices 테이블에 title_zh / content_zh 컬럼 없음 — zh 페이지는 항상 영어/한국어 fallback.
    // en 페이지도 title_en 없으면 한국어 fallback. 이 경우 중복 콘텐츠 신호 방지 위해 noindex.
    const hasTranslation =
      locale === "ko" || (locale === "en" && Boolean(notice.title_en));

    // notices엔 title_zh가 없어 zh는 색인 불가 → hreflang에서 제외 (ko + en만, sitemap과 일치)
    const languages: Record<string, string> = {
      ko: `${BASE_URL}/ko/notices/${id}`,
      "x-default": `${BASE_URL}/ko/notices/${id}`,
    };
    if (notice.title_en) languages.en = `${BASE_URL}/en/notices/${id}`;

    return {
      title,
      description,
      robots: hasTranslation ? undefined : { index: false, follow: true },
      openGraph: {
        title,
        description,
        type: "article" as const,
        publishedTime: notice.published_at || notice.created_at,
      },
      alternates: {
        canonical: `${BASE_URL}/${locale}/notices/${id}`,
        languages,
      },
    };
  } catch {
    return { title: "Notice" };
  }
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations("common");

  const notice = await getNoticeById(id);
  if (!notice) notFound();

  const title =
    locale === "ko" ? notice.title_ko : notice.title_en || notice.title_ko;
  const content =
    locale === "ko"
      ? notice.content_ko
      : notice.content_en || notice.content_ko;
  const date = notice.published_at || notice.created_at;

  // Check if content contains HTML tags (from Tiptap editor)
  const isHtml = content ? /<[a-z][\s\S]*>/i.test(content) : false;
  let sanitizedHtml: string | null = null;
  if (isHtml && content) {
    try {
      const DOMPurify = (await import("isomorphic-dompurify")).default;
      sanitizedHtml = DOMPurify.sanitize(content);
    } catch {
      // DOMPurify/jsdom may fail in serverless — fall back to plain text
      sanitizedHtml = null;
    }
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: notice.published_at || notice.created_at,
    dateModified: notice.updated_at || notice.created_at,
    author: { "@type": "Organization", name: "NAJIN TECHNOLOGY" },
    publisher: {
      "@type": "Organization",
      name: "NAJIN TECHNOLOGY",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/images/logo/najin-logo.png` },
    },
    image: `${BASE_URL}/images/logo/najin-logo.png`,
  };

  const homeName = locale === "ko" ? "홈" : locale === "zh" ? "首页" : "Home";
  const noticesName = locale === "ko" ? "회사소식" : locale === "zh" ? "公司动态" : "Company News";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: homeName, item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: noticesName, item: `${BASE_URL}/${locale}/notices` },
      { "@type": "ListItem", position: 3, name: title, item: `${BASE_URL}/${locale}/notices/${id}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="hero-gradient hero-pattern text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
            data-animate="fade-up"
          >
            {title}
          </h1>
          <div
            className="flex items-center gap-2 text-white/85 text-sm font-medium"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            <Calendar className="w-4 h-4" />
            <span className="tabular-nums">
              {new Date(date).toLocaleDateString(
                locale === "ko" ? "ko-KR" : locale === "zh" ? "zh-CN" : "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </span>
          </div>
        </div>
        {/* Diagonal bottom clip */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 bg-surface-warm-50"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />
      </section>

      <section className="py-12 md:py-16 bg-surface-warm-50" data-animate="fade-up">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-surface-warm-200 p-8 md:p-12 shadow-sm">
            {sanitizedHtml ? (
              <div
                className="prose prose-gray max-w-none text-brand-charcoal leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            ) : (
              <div className="prose prose-gray max-w-none text-brand-charcoal leading-relaxed whitespace-pre-line">
                {content}
              </div>
            )}
          </div>

          <div className="mt-10">
            <Link
              href="/notices"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-blue-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {tc("backToList")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
