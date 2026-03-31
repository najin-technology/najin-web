import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";
import Image from "next/image";
import {
  Droplets,
  FlaskConical,
  Cog,
  Box,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: "/business",
    titles: { ko: "사업영역", en: "Business Areas", zh: "业务领域" },
    descriptions: {
      ko: "나진테크 사업영역. 우레탄 성형, 합성수지 가공, CNC/MCT 정밀가공, 금형 제작, EV 부품 가공 전문.",
      en: "NAJIN TECHNOLOGY business areas. Urethane molding, synthetic resin processing, CNC machining, mold fabrication, EV parts.",
      zh: "纳进科技业务领域。聚氨酯成型、合成树脂加工、CNC精密加工、模具制作、电动汽车零部件加工。",
    },
  });
}

const categories: {
  key: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
}[] = [
  { key: "urethane", icon: Droplets, image: "/images/factory/workshop-2.jpg", imageAlt: "우레탄 성형 장비" },
  { key: "resin", icon: FlaskConical, image: "/images/products/pe-rod-1.jpg", imageAlt: "PE 환봉 가공" },
  { key: "cnc", icon: Cog, image: "/images/products/3d-mc-part-1.jpg", imageAlt: "3D MC 형상 가공품" },
  { key: "mold", icon: Box, image: "/images/products/3d-mc-part-2.jpg", imageAlt: "금형 가공품" },
  { key: "ev", icon: Zap, image: "/images/products/pe-rod-4.jpg", imageAlt: "EV 부품 가공" },
];

export default function BusinessPage() {
  const t = useTranslations("business");

  return (
    <>
      <PageHeader titleKey="pageTitle" namespace="business" descriptionKey="pageDescription" />
      <Breadcrumb items={[{ label: t("pageTitle") }]} />

      {/* Category Quick Nav */}
      <nav className="sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-surface-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <a
                key={cat.key}
                href={`#${cat.key}`}
                className="group flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-charcoal rounded-lg transition-all hover:bg-brand-copper/10 hover:text-brand-copper"
              >
                <cat.icon className="w-4 h-4 text-brand-charcoal/40 group-hover:text-brand-copper transition-colors" />
                {t(`${cat.key}.title`)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Category Sections */}
      {categories.map((cat, index) => (
        <section
          key={cat.key}
          id={cat.key}
          className={`py-16 md:py-24 ${index % 2 === 1 ? "bg-surface-warm-50" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Text content */}
              <div className={index % 2 === 1 ? "md:order-2" : ""} data-animate="fade-up">
                {/* Icon + title */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-full bg-brand-copper/10 flex items-center justify-center shrink-0">
                    <cat.icon className="w-8 h-8 text-brand-copper" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">
                    {t(`${cat.key}.title`)}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-brand-charcoal leading-relaxed text-base md:text-lg mb-8">
                  {t(`${cat.key}.desc`)}
                </p>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-2">
                  {t(`${cat.key}.features`)
                    .split(" · ")
                    .map((feature) => (
                      <span
                        key={feature}
                        className="inline-block px-3.5 py-1.5 text-sm font-medium text-brand-copper bg-brand-copper/10 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                </div>
              </div>

              {/* Product image */}
              <div
                className={`relative aspect-[4/3] rounded-xl overflow-hidden border border-surface-warm-200 shadow-sm ${index % 2 === 1 ? "md:order-1" : ""}`}
                data-animate={index % 2 === 1 ? "slide-right" : "slide-left"}
              >
                <Image
                  src={cat.image}
                  alt={cat.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
