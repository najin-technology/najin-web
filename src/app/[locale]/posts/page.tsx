import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageCTA } from "@/components/page-cta";
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
    titles: { ko: "제작사례", en: "Projects", zh: "制作案例" },
    descriptions: {
      ko: "나진테크 제작사례. 가공 기술, 납품 실적을 소개합니다.",
      en: "NAJIN TECHNOLOGY Projects. Production cases, machining technology, and delivery records.",
      zh: "纳进科技制作案例。加工技术及交付实绩。",
    },
  });
}

const CATEGORY_KEYS: Record<string, string> = {
  제작사례: "categoryCases",
  제품: "categoryProducts",
};

const CATEGORY_COLORS: Record<string, string> = {
  제작사례: "bg-blue-100 text-blue-800",
  제품: "bg-amber-100 text-amber-800",
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const t = await getTranslations("posts");
  const locale = await getLocale();
  const { category, tag } = await searchParams;

  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  let allPosts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  try {
    posts = await getPublishedPosts(category, tag);
    allPosts = tag || category ? await getPublishedPosts() : posts;
  } catch {
    // fallback
  }

  const allCategories = Object.keys(CATEGORY_KEYS);
  const totalCount = allPosts.length;
  const countByCategory: Record<string, number> = {};
  for (const p of allPosts) {
    countByCategory[p.category] = (countByCategory[p.category] || 0) + 1;
  }
  const countSuffix = t("countSuffix");

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
              <span className={`ml-1.5 text-xs ${!category ? "text-white/70" : "text-brand-charcoal/50"}`}>
                {totalCount}{countSuffix}
              </span>
            </Link>
            {allCategories.map((cat) => {
              const count = countByCategory[cat] || 0;
              const active = category === cat;
              return (
                <Link
                  key={cat}
                  href={`/posts?category=${cat}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    active
                      ? "bg-brand-navy text-white"
                      : "bg-white text-brand-charcoal border border-surface-warm-200 hover:border-brand-copper"
                  }`}
                >
                  {t(CATEGORY_KEYS[cat] || cat)}
                  <span className={`ml-1.5 text-xs ${active ? "text-white/70" : "text-brand-charcoal/50"}`}>
                    {count}{countSuffix}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Active tag filter indicator */}
          {tag && (
            <div className="flex items-center gap-2 mb-6" data-animate="fade-up">
              <span className="text-sm text-brand-charcoal/60">#{tag}</span>
              <Link
                href={category ? `/posts?category=${category}` : "/posts"}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                ✕ {t("clearFilter")}
              </Link>
            </div>
          )}

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
                  <div
                    key={post.id}
                    className="group bg-white rounded-xl border border-surface-warm-200 overflow-hidden hover:shadow-lg transition-all hover-lift flex flex-col"
                    data-animate="fade-up"
                    data-animate-delay={String(Math.min((index % 3) + 1, 3))}
                  >
                    <Link href={`/posts/${post.slug}`} className="flex-1">
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

                      {/* Content (clickable area) */}
                      <div className="p-5 pb-3">
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
                    {/* Tags — outside the parent Link to allow nested navigation */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-5 pb-4">
                        {post.tags.slice(0, 3).map((tagName: string) => (
                          <Link
                            key={tagName}
                            href={`/posts?tag=${tagName}`}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-surface-warm-100 text-brand-charcoal/60 hover:bg-brand-copper/10 hover:text-brand-copper transition-colors"
                          >
                            #{tagName}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <PageCTA />
    </>
  );
}
