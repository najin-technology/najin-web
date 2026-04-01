import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { getPublishedPosts } from "@/lib/queries";
import { Link } from "@/i18n/routing";
import { Calendar, Tag, ImageIcon } from "lucide-react";
import Image from "next/image";

import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: "/posts",
    titles: { ko: "기술 블로그", en: "Tech Blog", zh: "技术博客" },
    descriptions: {
      ko: "나진테크 기술 블로그. 제품 소개, 가공 기술, 현장 소식을 전합니다.",
      en: "NAJIN TECHNOLOGY Tech Blog. Product introductions, machining technology, and company news.",
      zh: "纳进科技技术博客。产品介绍、加工技术及现场资讯。",
    },
  });
}

const CATEGORY_KEYS: Record<string, string> = {
  우레탄: "categoryUrethane",
  합성수지: "categoryResin",
  CNC가공: "categoryCNC",
  금형: "categoryMold",
  EV부품: "categoryEV",
  회사소식: "categoryCompany",
  제품소개: "categoryProduct",
};

const CATEGORY_COLORS: Record<string, string> = {
  우레탄: "bg-amber-100 text-amber-800",
  합성수지: "bg-blue-100 text-blue-800",
  CNC가공: "bg-green-100 text-green-800",
  금형: "bg-purple-100 text-purple-800",
  EV부품: "bg-emerald-100 text-emerald-800",
  회사소식: "bg-gray-100 text-gray-800",
  제품소개: "bg-rose-100 text-rose-800",
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const t = await getTranslations("posts");
  const locale = await getLocale();
  const { category } = await searchParams;

  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  try {
    posts = await getPublishedPosts(category);
  } catch {
    // fallback
  }

  const allCategories = Object.keys(CATEGORY_KEYS);

  return (
    <>
      <PageHeader
        titleKey="pageTitle"
        namespace="posts"
        descriptionKey="pageDescription"
        bgImage="/images/factory/milling.jpg"
      />
      <Breadcrumb items={[{ label: t("pageTitle") }]} />

      <section className="py-12 md:py-20 bg-surface-warm-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div
            className="flex flex-wrap gap-2 mb-8"
            data-animate="fade-up"
          >
            <Link
              href="/posts"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !category
                  ? "bg-brand-navy text-white"
                  : "bg-white text-brand-charcoal border border-surface-warm-200 hover:border-brand-copper"
              }`}
            >
              {t("allCategories")}
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat}
                href={`/posts?category=${cat}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-brand-navy text-white"
                    : "bg-white text-brand-charcoal border border-surface-warm-200 hover:border-brand-copper"
                }`}
              >
                {t(CATEGORY_KEYS[cat] || cat)}
              </Link>
            ))}
          </div>

          {posts.length === 0 ? (
            <div
              className="text-center py-16 bg-white rounded-2xl border border-surface-warm-200"
              data-animate="fade-up"
            >
              <Tag className="w-10 h-10 text-brand-charcoal/30 mx-auto mb-3" />
              <p className="text-brand-charcoal/60">{t("noPosts")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => {
                const title =
                  locale === "ko"
                    ? post.title_ko
                    : post.title_en || post.title_ko;
                const excerpt =
                  locale === "ko"
                    ? post.excerpt_ko
                    : post.excerpt_en || post.excerpt_ko;
                const date = post.original_date || post.published_at || post.created_at;
                const thumbnail = post.thumbnail_url || post.image_urls?.[0];

                return (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="group bg-white rounded-xl border border-surface-warm-200 overflow-hidden hover:shadow-lg transition-all hover-lift"
                    data-animate="fade-up"
                    data-animate-delay={String(Math.min((index % 3) + 1, 3))}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] bg-surface-warm-100 overflow-hidden">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-12 h-12 text-brand-charcoal/20" />
                        </div>
                      )}
                      {/* Category badge */}
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                          CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {t(CATEGORY_KEYS[post.category] || post.category)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-brand-navy mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">
                        {title}
                      </h3>
                      {excerpt && (
                        <p className="text-sm text-brand-charcoal/70 mb-3 line-clamp-2">
                          {excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-brand-charcoal/50">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(date).toLocaleDateString(
                            locale === "ko"
                              ? "ko-KR"
                              : locale === "zh"
                                ? "zh-CN"
                                : "en-US"
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
