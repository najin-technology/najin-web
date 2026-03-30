import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
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
  { name: "국내외 주요 완성차사", nameEn: "Major automaker", category: "automotive" },
  { name: "주요 부품사", nameEn: "Major parts supplier", category: "automotive" },
  { name: "국내 완성차사", nameEn: "Domestic automaker", category: "automotive" },
  { name: "SK", nameEn: "SK", category: "industrial" },
  { name: "한화케미칼", nameEn: "Hanwha Chemical", category: "industrial" },
  { name: "주요 부품사", nameEn: "Major parts supplier", category: "automotive" },
  { name: "주요 부품사", nameEn: "Major parts supplier", category: "automotive" },
  { name: "주요 부품사", nameEn: "Major parts supplier", category: "automotive" },
  { name: "Overseas automaker", nameEn: "Overseas automaker", category: "overseas" },
  { name: "해외 부품사", nameEn: "해외 부품사", category: "overseas" },
];

const galleryItems = [
  { src: "/images/products/3d-mc-part-1.jpg", title: "3D MC 형상가공품", category: "3D가공" },
  { src: "/images/products/3d-mc-part-2.jpg", title: "3D MC 형상가공품", category: "3D가공" },
  { src: "/images/products/machined-part-1.jpg", title: "합성수지 가공품", category: "합성수지" },
  { src: "/images/products/machined-part-2.jpg", title: "합성수지 가공품", category: "합성수지" },
  { src: "/images/products/machined-part-3.jpg", title: "정밀 가공품", category: "CNC/MCT" },
  { src: "/images/products/machined-part-4.jpg", title: "정밀 가공품", category: "CNC/MCT" },
  { src: "/images/products/pe-rod-1.jpg", title: "PE 환봉 가공", category: "합성수지" },
  { src: "/images/products/pe-rod-2.jpg", title: "PE 환봉 가공", category: "합성수지" },
  { src: "/images/products/machined-part-5.jpg", title: "금형 가공품", category: "금형" },
  { src: "/images/products/machined-part-6.jpg", title: "금형 가공품", category: "금형" },
  { src: "/images/products/pe-rod-3.jpg", title: "PE 가공 완성품", category: "합성수지" },
  { src: "/images/products/pe-rod-4.jpg", title: "PE 가공 완성품", category: "합성수지" },
];

export default function PortfolioPage() {
  const t = useTranslations("portfolio");
  const tc = useTranslations("common");

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
                    <p className="text-xs text-gray-400 mt-1">{client.nameEn}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Gallery */}
      <section className="py-16 md:py-24 bg-surface-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-8"
            data-animate="fade-up"
          >
            {t("galleryTitle")}
          </h2>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item, i) => (
              <div
                key={`${item.src}-${i}`}
                className="bg-white rounded-xl border border-surface-warm-200 overflow-hidden hover-lift"
                data-animate="fade-up"
                data-animate-delay={String(Math.min((i % 4) + 1, 4))}
              >
                <div className="relative aspect-square">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <span className="inline-block text-xs font-medium text-brand-copper bg-brand-copper/10 px-2 py-0.5 rounded-full mb-1">
                    {item.category}
                  </span>
                  <p className="text-sm font-medium text-brand-navy">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 hero-gradient text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            data-animate="fade-up"
          >
            {t("clientsTitle")}
          </h2>
          <p
            className="text-gray-300 mb-8"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {t("clientsDesc")}
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
              className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors text-sm mt-2"
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
