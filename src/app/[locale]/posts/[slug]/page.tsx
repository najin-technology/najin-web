import { getTranslations, getLocale } from "next-intl/server";
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
      locale === "ko" ? post.title_ko : post.title_en || post.title_ko;
    const rawContent =
      locale === "ko"
        ? post.content_ko
        : post.content_en || post.content_ko;
    const description = rawContent ? stripHtml(rawContent).slice(0, 160) : "";

    // posts 테이블에 title_zh / content_zh 컬럼 없음 — zh 페이지는 항상 영어/한국어 fallback.
    // en 페이지도 title_en 없으면 한국어 fallback. 이 경우 중복 콘텐츠 신호 방지 위해 noindex.
    const hasTranslation =
      locale === "ko" || (locale === "en" && Boolean(post.title_en));

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
        languages: {
          ko: `${BASE_URL}/ko/posts/${slug}`,
          en: `${BASE_URL}/en/posts/${slug}`,
          zh: `${BASE_URL}/zh/posts/${slug}`,
          "x-default": `${BASE_URL}/ko/posts/${slug}`,
        },
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
  const { slug } = await params;
  const locale = await getLocale();
  const tc = await getTranslations("common");
  const t = await getTranslations("posts");

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const title =
    locale === "ko" ? post.title_ko : post.title_en || post.title_ko;
  const content =
    locale === "ko" ? post.content_ko : post.content_en || post.content_ko;
  const date = post.original_date || post.published_at || post.created_at;
  const images = post.image_urls || [];

  // Check if content contains HTML tags
  const isHtml = content ? /<[a-z][\s\S]*>/i.test(content) : false;
  let sanitizedHtml: string | null = null;
  if (isHtml && content) {
    try {
      const DOMPurify = (await import("isomorphic-dompurify")).default;
      sanitizedHtml = DOMPurify.sanitize(content);
    } catch {
      sanitizedHtml = null;
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
                {content}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-surface-warm-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-brand-charcoal/50" />
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-surface-warm-100 text-brand-charcoal/85 rounded-full text-[13px] font-medium"
                    >
                      #{tag}
                    </span>
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

          <div className="mt-10 flex items-center justify-between">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-blue-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {tc("backToList")}
            </Link>

            <Link
              href="/quote"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-copper hover:bg-brand-copper-light text-white text-sm font-medium rounded-lg transition-colors"
            >
              {tc("requestQuote")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
