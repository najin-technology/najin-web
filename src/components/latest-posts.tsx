import { getTranslations, getLocale } from "next-intl/server";
import { getHomePosts } from "@/lib/queries";
import { Link } from "@/i18n/routing";
import { Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";

const CATEGORY_COLORS: Record<string, string> = {
  제작사례: "bg-blue-100 text-blue-800",
  제품: "bg-amber-100 text-amber-800",
};

const CATEGORY_KEYS: Record<string, string> = {
  제작사례: "categoryCases",
  제품: "categoryProducts",
};

export async function LatestPosts() {
  const t = await getTranslations("posts");
  const locale = await getLocale();

  let latestPosts: Awaited<ReturnType<typeof getHomePosts>> = [];
  try {
    latestPosts = await getHomePosts();
  } catch {
    return null;
  }

  if (latestPosts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-surface-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center justify-between mb-10"
          data-animate="fade-up"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">
            {t("pageTitle")}
          </h2>
          <Link
            href="/posts"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:text-brand-blue-hover transition-colors"
          >
            {t("readMore")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestPosts.map((post, index) => {
            const title =
              locale === "ko"
                ? post.title_ko
                : post.title_en || post.title_ko;
            const excerpt =
              locale === "ko"
                ? post.excerpt_ko
                : post.excerpt_en || post.excerpt_ko;
            const date =
              post.original_date || post.published_at || post.created_at;
            const thumbnail = post.thumbnail_url || post.image_urls?.[0];

            return (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group bg-white rounded-xl border border-surface-warm-200 overflow-hidden hover:shadow-lg transition-all hover-lift"
                data-animate="fade-up"
                data-animate-delay={String(index + 1)}
              >
                <div className="relative aspect-[16/10] bg-surface-warm-100 overflow-hidden">
                  {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[13px] font-bold shadow-sm ${
                      CATEGORY_COLORS[post.category] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t(CATEGORY_KEYS[post.category] || post.category)}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-brand-navy mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">
                    {title}
                  </h3>
                  {excerpt && (
                    <p className="text-sm text-brand-charcoal/80 mb-3 line-clamp-2 font-medium leading-relaxed">
                      {excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-[13px] text-brand-charcoal/60 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="tabular-nums">
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
      </div>
    </section>
  );
}
