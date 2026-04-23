import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { getProductsByCategory } from "@/lib/queries";
import { CLIENTS } from "@/lib/clients";
import Image from "next/image";
import { ImageFade } from "@/components/image-fade";
import { Phone } from "lucide-react";
import { PortfolioGallery } from "@/components/portfolio-gallery";

import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: "/portfolio",
    titles: { ko: "주요실적", en: "Portfolio", zh: "主要业绩" },
    descriptions: {
      ko: "나진테크 주요실적. 국내외 주요 완성차사, SK, Overseas automaker 등 주요 대기업 납품. 프로젝트 사례 및 제품 갤러리.",
      en: "NAJIN TECHNOLOGY portfolio. Supplying to major clients including Hyundai, SK, Overseas automaker. Project cases and product gallery.",
      zh: "纳进科技主要业绩。向现代汽车、SK、海外整车厂等主要大企业供货。项目案例及产品展示。",
    },
  });
}

// Fallback gallery items if DB is empty
const fallbackGallery = [
  { src: "/images/products/3d-mc-part-1.jpg", title: "3D MC 형상가공품", category: "3D가공" },
  { src: "/images/products/tank-pad-1.jpg", title: "TANK PAD 우레탄", category: "우레탄" },
  { src: "/images/products/3d-mc-part-2.jpg", title: "3D MC 형상가공품", category: "3D가공" },
  { src: "/images/products/pe-rod-1.jpg", title: "PE 환봉 가공", category: "합성수지" },
  { src: "/images/products/product-2026-1.jpg", title: "최신 납품 제품", category: "CNC/MCT" },
  { src: "/images/products/pe-rod-2.jpg", title: "PE 환봉 소재", category: "합성수지" },
];

export default async function PortfolioPage() {
  const t = await getTranslations("portfolio");
  const tc = await getTranslations("common");
  const tq = await getTranslations("quote");
  const locale = await getLocale();

  // Fetch products from DB
  let products: Awaited<ReturnType<typeof getProductsByCategory>> = [];
  try {
    products = await getProductsByCategory();
  } catch {
    // fallback to empty
  }

  // Build gallery items from DB products (first image of each product)
  const galleryItems = products.length > 0
    ? products
        .filter((p) => p.image_urls && p.image_urls.length > 0)
        .map((p) => ({
          src: p.image_urls[0],
          title: locale === "ko" ? p.name_ko : (p.name_en || p.name_ko),
          category: p.category,
        }))
    : fallbackGallery;

  return (
    <>
      <PageHeader titleKey="pageTitle" namespace="portfolio" descriptionKey="pageDescription" bgImage="/images/factory/cnc-lathe.jpg" />
      <Breadcrumb items={[{ label: t("pageTitle") }]} />

      {/* Major Clients */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-4"
            data-animate="fade-up"
          >
            {t("clientsTitle")}
          </h2>
          <p
            className="text-brand-charcoal mb-10 text-lg"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {t("clientsDesc")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CLIENTS.map((client, i) => (
              <Link
                key={client.slug}
                href={`/clients/${client.slug}`}
                className="bg-white rounded-xl border border-surface-warm-200 p-6 text-center hover-lift block cursor-pointer"
                data-animate="fade-up"
                data-animate-delay={String(Math.min((i % 5) + 1, 5))}
                aria-label={client.name}
              >
                <div
                  className={`h-14 flex items-center justify-center mx-auto mb-3 rounded-md ${
                    client.needsDarkBg ? "bg-brand-navy px-3" : ""
                  }`}
                >
                  <Image
                    src={client.logo}
                    alt={client.name}
                    width={160}
                    height={56}
                    className={`max-h-12 w-auto max-w-[140px] object-contain transition-all duration-300 ${
                      client.needsDarkBg
                        ? "opacity-100"
                        : "grayscale hover:grayscale-0 opacity-80 hover:opacity-100"
                    }`}
                    unoptimized
                  />
                </div>
                <p className="font-semibold text-brand-navy text-sm">
                  {client.name}
                </p>
                {client.name !== client.nameEn && (
                  <p className="text-xs text-brand-charcoal/60 mt-1">{client.nameEn}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-3"
            data-animate="fade-up"
          >
            {t("caseStudiesTitle")}
          </h2>
          <p
            className="text-brand-charcoal/70 mb-10"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {t("caseStudiesDesc")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                titleKey: "case1Title",
                clientKey: "case1Client",
                descKey: "case1Desc",
                resultKey: "case1Result",
                image: "/images/products/db-4654fb31-0.jpg",
                category: t("case1Category"),
              },
              {
                titleKey: "case2Title",
                clientKey: "case2Client",
                descKey: "case2Desc",
                resultKey: "case2Result",
                image: "/images/products/3d-mc-part-1.jpg",
                category: t("case2Category"),
              },
              {
                titleKey: "case3Title",
                clientKey: "case3Client",
                descKey: "case3Desc",
                resultKey: "case3Result",
                image: "/images/products/db-4421a7e9-0.jpg",
                category: t("case3Category"),
              },
            ].map((cs, i) => (
              <div
                key={i}
                className="bg-surface-warm-50 rounded-xl overflow-hidden border border-surface-warm-200"
                data-animate="fade-up"
                data-animate-delay={String(i + 1)}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageFade
                    src={cs.image}
                    alt={t(cs.titleKey)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-brand-copper text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                      {cs.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-brand-copper font-semibold mb-1">{t(cs.clientKey)}</p>
                  <h3 className="font-bold text-brand-navy mb-2">{t(cs.titleKey)}</h3>
                  <p className="text-sm text-brand-charcoal/70 mb-3 leading-relaxed">{t(cs.descKey)}</p>
                  <div className="bg-white rounded-lg p-3 border border-surface-warm-200">
                    <p className="text-xs text-brand-charcoal/60 mb-0.5">{t("caseResult")}</p>
                    <p className="text-sm font-semibold text-brand-navy">{t(cs.resultKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Gallery — from DB */}
      <section className="py-16 md:py-24 bg-surface-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-2"
            data-animate="fade-up"
          >
            {t("galleryTitle")}
          </h2>
          <p
            className="text-brand-charcoal/60 mb-8"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {products.length > 0
              ? `${products.length}${t("productCountSuffix")} · ${["urethane", "resin", "cnc", "mold", "ev"].filter(cat => products.some(p => p.category === cat)).map(cat => tq(`processingTypes.${cat}` as `processingTypes.urethane`)).join(" · ")}`
              : ""
            }
          </p>

          <PortfolioGallery items={galleryItems} locale={locale} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 hero-gradient text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            data-animate="fade-up"
          >
            {t("ctaTitle")}
          </h2>
          <p
            className="text-white/70 mb-8"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {t("ctaDesc")}
          </p>
          <div
            className="flex flex-col items-center gap-4"
            data-animate="fade-up"
            data-animate-delay="2"
          >
            <Link href="/quote">
              <Button
                size="lg"
                className="bg-brand-copper hover:bg-brand-copper-light text-white text-xl px-12 py-6 shadow-lg"
              >
                {tc("requestQuote")}
              </Button>
            </Link>
            <a
              href="tel:+82-55-367-2596"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mt-2"
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
