import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { getProductsByCategory } from "@/lib/queries";
import Image from "next/image";
import {
  Car,
  Globe,
  Factory,
  Phone,
  type LucideIcon,
} from "lucide-react";

export const metadata = {
  title: "주요실적",
};

const categoryIcons: Record<string, LucideIcon> = {
  automotive: Car,
  overseas: Globe,
  industrial: Factory,
};

const clients = [
  { name: "현대자동차", nameEn: "Hyundai Motor", category: "automotive" },
  { name: "현대파워텍", nameEn: "Hyundai Powertech", category: "automotive" },
  { name: "르노삼성", nameEn: "Renault Samsung", category: "automotive" },
  { name: "SK", nameEn: "SK", category: "industrial" },
  { name: "한화케미칼", nameEn: "Hanwha Chemical", category: "industrial" },
  { name: "동희산업", nameEn: "Donghee Industrial", category: "automotive" },
  { name: "화신", nameEn: "Hwashin", category: "automotive" },
  { name: "성우하이텍", nameEn: "Sungwoo Hitech", category: "automotive" },
  { name: "GM Shanghai", nameEn: "GM Shanghai", category: "overseas" },
  { name: "Lear Dymos", nameEn: "Lear Dymos", category: "overseas" },
];

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
      <PageHeader titleKey="pageTitle" namespace="portfolio" descriptionKey="pageDescription" />

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
            {clients.map((client, i) => {
              const IconComponent = categoryIcons[client.category] || Factory;
              return (
                <div
                  key={client.name}
                  className="bg-white rounded-xl border border-surface-warm-200 p-6 text-center hover-lift"
                  data-animate="fade-up"
                  data-animate-delay={String(Math.min((i % 5) + 1, 5))}
                >
                  <div className="w-12 h-12 rounded-full bg-brand-copper/10 flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="w-6 h-6 text-brand-copper" />
                  </div>
                  <p className="font-semibold text-brand-navy text-sm">
                    {client.name}
                  </p>
                  {client.name !== client.nameEn && (
                    <p className="text-xs text-brand-charcoal/40 mt-1">{client.nameEn}</p>
                  )}
                </div>
              );
            })}
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
              ? `${products.length}개 제품 · ${["우레탄", "합성수지", "CNC", "금형", "EV"].filter(cat => products.some(p => p.category === cat)).join(" · ")}`
              : ""
            }
          </p>

          {/* Gallery Grid — varied sizes for rhythm */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {galleryItems.map((item, i) => {
              const isLarge = i < 2;
              return (
                <div
                  key={`${item.src}-${i}`}
                  className={`group bg-white rounded-xl overflow-hidden border border-surface-warm-200 hover-lift ${
                    isLarge ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                  data-animate="fade-up"
                  data-animate-delay={String(Math.min((i % 4) + 1, 4))}
                >
                  <div className={`relative overflow-hidden ${isLarge ? "aspect-[4/3]" : "aspect-square"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {item.src.startsWith("http") ? (
                      // External image (Naver blog CDN)
                      <img
                        src={item.src}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      // Local image
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:from-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 md:translate-y-full md:group-hover:translate-y-0 transition-transform">
                      <span className="inline-block text-[10px] md:text-xs font-medium text-white bg-brand-copper px-1.5 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      <p className={`font-medium text-white mt-0.5 ${isLarge ? "text-sm md:text-base" : "text-xs md:text-sm"}`}>
                        {item.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
              href="tel:055-367-2596"
              className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mt-2"
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
