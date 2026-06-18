import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/queries";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Calendar, Tag, ExternalLink } from "lucide-react";
import Image from "next/image";
import { SITE_URL as BASE_URL } from "@/lib/env";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;
export const dynamic = "force-static";

export async function generateStaticParams() {
  // Build time 에 발행된 post slug 모두 prerender (locale × slug 조합).
  // Supabase client 가 build context 에서 null 일 수 있어 안전하게 처리.
  try {
    if (!supabase) return [];
    const { data } = await supabase
      .from("posts")
      .select("slug")
      .eq("is_published", true)
      .is("deleted_at", null);
    if (!data) return [];
    return data.flatMap((p) =>
      ["ko", "en", "zh"].map((locale) => ({ locale, slug: p.slug })),
    );
  } catch {
    return [];
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// 블로그 import 본문 끝에 붙는 "출처" 섹션은 화면에 노출하지 않는다.
function stripSourceSection(html: string) {
  return html.replace(/<h[1-6][^>]*>\s*출처\s*<\/h[1-6]>[\s\S]*$/i, "");
}

// admin Tiptap이 생성한 신뢰 콘텐츠용 경량 새니타이저.
// isomorphic-dompurify가 이 런타임(Turbopack SSG)에서 jsdom 의존성으로 throw할 때
// null로 떨어져 본문이 raw 태그로 노출되던 문제의 폴백. script/style/이벤트핸들러 제거.
function basicSanitizeHtml(html: string) {
  return html
    .replace(/<\/?(script|style|iframe|object|embed|form|link|meta)\b[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

const CATEGORY_KEYS: Record<string, string> = {
  제작사례: "categoryCases",
  제품: "categoryProducts",
};

const CATEGORY_COLORS: Record<string, string> = {
  제작사례: "bg-blue-100 text-blue-800",
  제품: "bg-amber-100 text-amber-800",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  try {
    const { locale, slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Not Found" };

    const title =
      locale === "ko"
        ? post.title_ko
        : locale === "zh"
          ? post.title_zh || post.title_ko
          : post.title_en || post.title_ko;
    const rawContent =
      locale === "ko"
        ? post.content_ko
        : locale === "zh"
          ? post.content_zh || post.content_ko
          : post.content_en || post.content_ko;
    const description = rawContent ? stripHtml(rawContent).slice(0, 160) : "";

    // 번역 없으면(en=title_en, zh=title_zh 부재) 한국어 fallback → 중복 콘텐츠 방지 위해 noindex.
    const hasTranslation =
      locale === "ko" ||
      (locale === "en" && Boolean(post.title_en)) ||
      (locale === "zh" && Boolean(post.title_zh));

    // 색인 가능한 언어만 hreflang에 (noindex 언어로의 hreflang 방지 — sitemap과 일치)
    const languages: Record<string, string> = {
      ko: `${BASE_URL}/ko/posts/${slug}`,
      "x-default": `${BASE_URL}/ko/posts/${slug}`,
    };
    if (post.title_en) languages.en = `${BASE_URL}/en/posts/${slug}`;
    if (post.title_zh) languages.zh = `${BASE_URL}/zh/posts/${slug}`;

    return {
      title,
      description,
      robots: hasTranslation ? undefined : { index: false, follow: true },
      openGraph: {
        title,
        description,
        type: "article" as const,
        publishedTime: post.original_date || post.published_at || post.created_at,
        images: post.thumbnail_url ? [post.thumbnail_url] : [],
      },
      alternates: {
        canonical: `${BASE_URL}/${locale}/posts/${slug}`,
        languages,
      },
    };
  } catch {
    return { title: "Post" };
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations("common");
  const t = await getTranslations("posts");

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const title =
    locale === "ko"
      ? post.title_ko
      : locale === "zh"
        ? post.title_zh || post.title_ko
        : post.title_en || post.title_ko;
  const content =
    locale === "ko"
      ? post.content_ko
      : locale === "zh"
        ? post.content_zh || post.content_ko
        : post.content_en || post.content_ko;
  const date = post.original_date || post.published_at || post.created_at;
  const images = post.image_urls || [];

  // "출처" 푸터 제거 후 HTML 여부 판정.
  const cleaned = content ? stripSourceSection(content) : content;
  const isHtml = cleaned ? /<[a-z][\s\S]*>/i.test(cleaned) : false;
  let sanitizedHtml: string | null = null;
  if (isHtml && cleaned) {
    try {
      const DOMPurify = (await import("isomorphic-dompurify")).default;
      sanitizedHtml = DOMPurify.sanitize(cleaned);
    } catch {
      // dompurify가 throw하면 raw 태그 노출 대신 경량 새니타이저로 폴백.
      sanitizedHtml = basicSanitizeHtml(cleaned);
    }
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: post.original_date || post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { "@type": "Organization", name: "NAJIN TECHNOLOGY" },
    publisher: {
      "@type": "Organization",
      name: "NAJIN TECHNOLOGY",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/images/logo/najin-logo.png`,
      },
    },
    image: post.thumbnail_url || images[0] || `${BASE_URL}/images/logo/najin-logo.png`,
  };

  const homeName = locale === "ko" ? "홈" : locale === "zh" ? "首页" : "Home";
  const postsName = locale === "ko" ? "제작사례" : locale === "zh" ? "制作案例" : "Projects";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: homeName, item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: postsName, item: `${BASE_URL}/${locale}/posts` },
      { "@type": "ListItem", position: 3, name: title, item: `${BASE_URL}/${locale}/posts/${slug}` },
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

      {/* Hero with thumbnail */}
      <section className="hero-gradient hero-pattern text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 mb-4" data-animate="fade-up">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-800"
              }`}
            >
              {t(CATEGORY_KEYS[post.category] || post.category)}
            </span>
          </div>
          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
            data-animate="fade-up"
          >
            {title}
          </h1>
          <div
            className="flex items-center gap-4 text-white/85 text-sm font-medium"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="tabular-nums">
                {new Date(date).toLocaleDateString(
                  locale === "ko"
                    ? "ko-KR"
                    : locale === "zh"
                      ? "zh-CN"
                      : "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </span>
            </div>
            {post.original_url && (
              <a
                href={post.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>원본 보기</span>
              </a>
            )}
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-8 bg-surface-warm-50"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />
      </section>

      <section
        className="py-12 md:py-16 bg-surface-warm-50"
        data-animate="fade-up"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-surface-warm-200 p-8 md:p-12 shadow-sm">
            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="mb-8">
                {images.length === 1 ? (
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden">
                    <Image
                      src={images[0]}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                      priority
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img: string, i: number) => (
                      <div
                        key={i}
                        className={`relative rounded-lg overflow-hidden ${
                          i === 0 && images.length % 2 !== 0
                            ? "col-span-2 aspect-[16/10]"
                            : "aspect-square"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${title} ${i + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes={
                            i === 0 && images.length % 2 !== 0
                              ? "(max-width: 768px) 100vw, 800px"
                              : "(max-width: 768px) 50vw, 400px"
                          }
                          priority={i === 0}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            {sanitizedHtml ? (
              <div
                className="prose prose-gray max-w-none text-brand-charcoal leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            ) : (
              <div className="prose prose-gray max-w-none text-brand-charcoal leading-relaxed whitespace-pre-line">
                {cleaned}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-surface-warm-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-brand-charcoal/50" />
                  {post.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/posts?tag=${encodeURIComponent(tag)}`}
                      className="px-2.5 py-1 bg-surface-warm-100 text-brand-charcoal/85 rounded-full text-[13px] font-medium hover:bg-brand-copper/10 hover:text-brand-copper transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Customer backlink — /clients/[slug] */}
            {post.customer && post.customer.client_slug && (
              <div className="mt-8 pt-6 border-t border-surface-warm-200">
                <Link
                  href={`/clients/${post.customer.client_slug}`}
                  className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-warm-50 border border-surface-warm-200 hover:border-brand-copper/30 hover:bg-white transition-colors group"
                >
                  {post.customer.logo_url && (
                    <div className="w-12 h-8 flex items-center justify-center bg-white rounded border border-surface-warm-200 shrink-0">
                      <Image
                        src={post.customer.logo_url}
                        alt={post.customer.company_name}
                        width={48}
                        height={32}
                        className="max-h-6 w-auto object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[11px] text-brand-charcoal/70 font-bold uppercase tracking-wide">
                      {tc("collaborationWith")}
                    </div>
                    <div className="text-sm font-bold text-brand-navy group-hover:text-brand-copper transition-colors">
                      {locale !== "ko" && post.customer.name_en
                        ? post.customer.name_en
                        : post.customer.company_name}
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 ml-auto rotate-180 text-brand-charcoal/40 group-hover:text-brand-copper transition-colors" />
                </Link>
              </div>
            )}
          </div>

          {/* Inline conversion box — gives the reader a clear next step */}
          <div
            className="mt-10 rounded-2xl border border-brand-copper/20 bg-gradient-to-br from-surface-warm-50 to-white p-6 md:p-8"
            data-animate="fade-up"
          >
            <h3 className="text-lg md:text-xl font-bold text-brand-navy mb-2">
              이런 부품을 만들고 싶으신가요?
            </h3>
            <p className="text-sm text-brand-charcoal/85 mb-5 leading-relaxed font-medium">
              비슷한 사양·소재로 견적이 가능합니다. 도면이나 참고 이미지가 있으면 함께 첨부해주세요. 영업일 기준 빠르게 회신드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-copper hover:bg-brand-copper-light text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                {tc("requestQuote")}
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
              <a
                href="tel:+82-55-367-2596"
                aria-label="전화 걸기 055-367-2596"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-brand-navy/20 text-brand-navy hover:bg-brand-navy/5 text-sm font-semibold rounded-lg transition-colors tabular-nums"
              >
                055-367-2596
              </a>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/posts"
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
