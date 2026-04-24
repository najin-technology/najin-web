import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getNoticeById } from "@/lib/queries";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Calendar } from "lucide-react";
import { SITE_URL as BASE_URL } from "@/lib/env";

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

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article" as const,
        publishedTime: notice.published_at || notice.created_at,
      },
      alternates: {
        canonical: `${BASE_URL}/${locale}/notices/${id}`,
        languages: {
          ko: `${BASE_URL}/ko/notices/${id}`,
          en: `${BASE_URL}/en/notices/${id}`,
          zh: `${BASE_URL}/zh/notices/${id}`,
        },
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
  const { id } = await params;
  const locale = await getLocale();
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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
            className="flex items-center gap-2 text-gray-300 text-sm"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            <Calendar className="w-4 h-4" />
            <span>
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
