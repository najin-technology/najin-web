import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { FALLBACK_CLIENT_SLUGS } from "@/lib/clients";
import {
  getClientDeliveries,
  getPostsForClient,
  getClientGrid,
  getClientGridRowBySlug,
} from "@/lib/queries";
import { createPageMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd, SEGMENTS } from "@/lib/schema/breadcrumb";
import { Calendar, Phone, ArrowRight, FileText, ImageIcon } from "lucide-react";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const grid = await getClientGrid();
    if (grid.length > 0) return grid.map((c) => ({ slug: c.slug }));
  } catch {
    // fall through
  }
  return FALLBACK_CLIENT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  let client;
  try {
    client = await getClientGridRowBySlug(slug);
  } catch {
    client = null;
  }
  if (!client) {
    return { title: "Not Found" };
  }
  const en = client.nameEn || client.name;
  const titleKo = `${client.name} 협업사례`;
  const titleEn = `${en} — Collaboration`;
  const titleZh = `${en} 合作案例`;
  return createPageMetadata({
    locale,
    path: `/clients/${slug}`,
    titles: { ko: titleKo, en: titleEn, zh: titleZh },
    descriptions: {
      ko: `${client.name}와의 검증된 납품 이력과 협업사례를 소개합니다.`,
      en: `Verified delivery history and collaboration with ${en}.`,
      zh: `与 ${en} 的合作交付记录。`,
    },
  });
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  let client;
  try {
    client = await getClientGridRowBySlug(slug);
  } catch {
    client = null;
  }
  if (!client) notFound();

  const t = await getTranslations("clients");
  const tc = await getTranslations("common");
  const tp = await getTranslations("portfolio");
  const locale = await getLocale();

  let deliveries: Awaited<ReturnType<typeof getClientDeliveries>> = [];
  let relatedPosts: Awaited<ReturnType<typeof getPostsForClient>> = [];
  try {
    [deliveries, relatedPosts] = await Promise.all([
      getClientDeliveries(slug),
      getPostsForClient(slug),
    ]);
  } catch {
    // empty fallback
  }

  const clientName = locale === "ko" ? client.name : client.nameEn || client.name;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    SEGMENTS.portfolio,
    {
      ko: clientName,
      en: clientName,
      zh: clientName,
      path: `/clients/${slug}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Hero with logo */}
      <section className="relative bg-brand-navy text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 hero-gradient hero-pattern opacity-40" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white rounded-xl p-6 w-40 h-24 md:w-48 md:h-28 flex items-center justify-center shrink-0">
              <Image
                src={client.logo}
                alt={client.name}
                width={160}
                height={64}
                className="max-h-16 w-auto object-contain"
                unoptimized
                priority
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {locale === "ko" ? client.name : client.nameEn}
              </h1>
              {client.name !== client.nameEn && locale === "ko" && (
                <p className="text-white/85 text-sm mb-2 font-medium">{client.nameEn}</p>
              )}
              {client.registeredYear && (
                <p className="text-brand-copper text-sm font-bold tabular-nums">
                  {t("registeredYear", { year: client.registeredYear })}
                </p>
              )}
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-8 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />
      </section>

      <Breadcrumb
        items={[
          { label: tp("pageTitle"), href: "/portfolio" },
          { label: t("breadcrumb"), href: "/portfolio" },
          { label: (locale === "ko" ? client.name : client.nameEn) || client.name },
        ]}
      />

      {/* Deliveries */}
      <section className="py-12 md:py-20 bg-surface-warm-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-3"
            data-animate="fade-up"
          >
            {t("deliveriesTitle")}
          </h2>
          <p
            className="text-brand-charcoal/85 mb-8 text-sm font-medium leading-relaxed"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {t("deliveriesDesc")}
          </p>

          {deliveries.length === 0 ? (
            <div
              className="text-center py-12 md:py-16 bg-white rounded-2xl border border-surface-warm-200"
              data-animate="fade-up"
            >
              <FileText className="w-10 h-10 text-brand-charcoal/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-brand-navy mb-2">
                {t("noDeliveriesTitle")}
              </h3>
              <p className="text-sm text-brand-charcoal/85 max-w-md mx-auto mb-6 font-medium leading-relaxed">
                {t("noDeliveriesDesc", {
                  name: (locale === "ko" ? client.name : client.nameEn) || client.name,
                })}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/quote">
                  <Button className="bg-brand-copper hover:bg-brand-copper-light text-white font-semibold">
                    {t("ctaQuote")}
                  </Button>
                </Link>
                <a
                  href="tel:055-367-2596"
                  aria-label="전화 걸기 055-367-2596"
                  className="flex items-center gap-2 text-brand-charcoal/85 hover:text-brand-navy text-sm font-semibold tabular-nums"
                >
                  <Phone className="w-4 h-4" />
                  <span>055-367-2596</span>
                </a>
              </div>
            </div>
          ) : (
            <ol className="relative border-l-2 border-brand-copper/30 pl-6 space-y-6">
              {deliveries.map((d, i) => {
                const desc =
                  locale === "ko"
                    ? d.description_ko
                    : d.description_en || d.description_ko;
                return (
                  <li
                    key={d.id}
                    className="relative bg-white rounded-xl border border-surface-warm-200 p-5 shadow-sm"
                    data-animate="fade-up"
                    data-animate-delay={String(Math.min((i % 3) + 1, 3))}
                  >
                    <span className="absolute -left-[34px] top-5 w-3 h-3 rounded-full bg-brand-copper border-4 border-surface-warm-50" />
                    <div className="flex items-center gap-2 text-[13px] text-brand-copper font-bold mb-2 tabular-nums">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {d.year}
                        {d.month ? ` · ${t("monthLabel", { month: d.month })}` : ""}
                      </span>
                    </div>
                    <p className="text-brand-charcoal/90 leading-relaxed font-medium">{desc}</p>
                    {d.source && (
                      <p className="text-xs text-brand-charcoal/60 mt-3 font-medium">
                        {t("sourceLabel")}: {d.source}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* Related case-study posts (if any) */}
      {relatedPosts.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-xl md:text-2xl font-bold text-brand-navy mb-2"
              data-animate="fade-up"
            >
              관련 제작사례
            </h2>
            <p
              className="text-sm text-brand-charcoal/80 mb-6 font-medium"
              data-animate="fade-up"
              data-animate-delay="1"
            >
              {locale === "ko" ? client.name : client.nameEn}와의 작업 사례입니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPosts.map((post) => {
                const title =
                  locale === "ko" ? post.title_ko : post.title_en || post.title_ko;
                const excerpt =
                  locale === "ko" ? post.excerpt_ko : post.excerpt_en || post.excerpt_ko;
                const date =
                  post.original_date || post.published_at;
                return (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="group block bg-white rounded-xl border border-surface-warm-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[16/10] bg-surface-warm-100 overflow-hidden">
                      {post.thumbnail_url ? (
                        <Image
                          src={post.thumbnail_url}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-10 h-10 text-brand-charcoal/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-brand-navy text-sm mb-1 line-clamp-2 group-hover:text-brand-blue transition-colors">
                        {title}
                      </h3>
                      {excerpt && (
                        <p className="text-[13px] text-brand-charcoal/80 line-clamp-2 mb-2 font-medium leading-relaxed">
                          {excerpt}
                        </p>
                      )}
                      {date && (
                        <p className="text-xs text-brand-charcoal/60 tabular-nums font-medium">
                          {new Date(date).toLocaleDateString(
                            locale === "ko" ? "ko-KR" : locale === "zh" ? "zh-CN" : "en-US"
                          )}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Reference: catalog links */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-xl md:text-2xl font-bold text-brand-navy mb-2"
            data-animate="fade-up"
          >
            {t("browseCatalogTitle")}
          </h2>
          <p
            className="text-sm text-brand-charcoal/60 mb-6"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {t("browseCatalogDesc")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/portfolio">
              <Button variant="outline" className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy/5">
                {t("viewAllPortfolio")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/posts">
              <Button variant="outline" className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy/5">
                {t("viewAllPosts")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-brand-navy text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            {tc("ctaTitle")}
          </h2>
          <p className="text-white/70 mb-6 text-sm">{tc("ctaDesc")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/quote">
              <Button
                size="lg"
                className="bg-brand-copper hover:bg-brand-copper-light text-white px-8"
              >
                {t("ctaQuote")}
              </Button>
            </Link>
            <a
              href="tel:055-367-2596"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>055-367-2596</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
