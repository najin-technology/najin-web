import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { getHistoryItems } from "@/lib/queries";
import Image from "next/image";
import { ImageFade } from "@/components/image-fade";
import {
  Award,
  Building2,
  FileCheck,
  Eye,
  Target,
  MapPin,
  Phone,
  Printer,
} from "lucide-react";

const fallbackHistory = [
  { id: "h1", year: 2002, month: 12, description_ko: "나진테크 설립", description_en: "NAJIN TECHNOLOGY Founded" },
  { id: "h2", year: 2003, month: 6, description_ko: "㈜한화종합화학 등록", description_en: "Registered with Hanwha Chemical" },
  { id: "h3", year: 2005, month: 6, description_ko: "부산 사상구 괘법동 공장 설립", description_en: "Busan Sasang Factory Established" },
  { id: "h4", year: 2010, month: 6, description_ko: "㈜성우하이텍 등록", description_en: "Registered with Sungwoo Hightech" },
  { id: "h5", year: 2013, month: 4, description_ko: "경남 양산 산막공단 자가공장 설립", description_en: "Yangsan Sanmak Factory Established" },
  { id: "h6", year: 2013, month: 6, description_ko: "ISO 9001 획득", description_en: "ISO 9001 Certified" },
  { id: "h7", year: 2013, month: 8, description_ko: "CLEAN 사업장 인정", description_en: "CLEAN Workplace Certified" },
  { id: "h8", year: 2014, month: 1, description_ko: "르노삼성 자동차㈜ 등록", description_en: "Registered with Renault Samsung Motors" },
  { id: "h9", year: 2014, month: 2, description_ko: "동희산업 등록", description_en: "Registered with Donghee Industrial" },
  { id: "h10", year: 2016, month: 4, description_ko: "SK㈜ 등록", description_en: "Registered with SK" },
  { id: "h11", year: 2016, month: 6, description_ko: "우레탄 금형 받침대 특허 획득", description_en: "Urethane Mold Base Patent Acquired" },
  { id: "h12", year: 2022, month: 2, description_ko: "확장 이전 (산막공단남14길 170)", description_en: "Expanded & Relocated to New Factory" },
];

import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: "/about",
    titles: { ko: "회사소개", en: "About Us", zh: "公司介绍" },
    descriptions: {
      ko: "나진테크 회사소개. 2002년 설립, ISO 9001 인증, 특허 보유. 대표이사 인사말, 연혁, 인증현황, 오시는 길.",
      en: "About NAJIN TECHNOLOGY. Founded 2002, ISO 9001 certified, patent holder. CEO message, history, certifications, location.",
      zh: "纳进科技公司介绍。2002年成立，ISO 9001认证，专利持有。CEO致辞、发展历程、资质认证、交通指南。",
    },
  });
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const locale = await getLocale();

  let historyItems: Awaited<ReturnType<typeof getHistoryItems>> = [];
  try {
    historyItems = await getHistoryItems();
  } catch {
    // fallback to empty if fetch fails
  }
  // Use fallback if DB has fewer items than static data
  if (historyItems.length < fallbackHistory.length) {
    historyItems = fallbackHistory as typeof historyItems;
  }

  return (
    <>
      <PageHeader titleKey="pageTitle" namespace="about" descriptionKey="pageDescription" />
      <Breadcrumb items={[{ label: t("pageTitle") }]} />

      {/* CEO Greeting */}
      <section className="py-16 md:py-24 bg-surface-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-8"
            data-animate="fade-up"
          >
            {t("ceoTitle")}
          </h2>
          <div
            className="relative bg-white rounded-xl p-8 md:p-10 border border-surface-warm-200 border-l-4 border-l-brand-copper shadow-sm"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {/* Decorative large quote mark */}
            <span
              className="absolute -top-2 left-6 text-8xl leading-none text-brand-copper/20 font-serif select-none pointer-events-none"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <div className="relative text-brand-charcoal leading-relaxed whitespace-pre-line text-base md:text-lg">
              {t("ceoContent")}
            </div>
            <p className="mt-6 text-right text-brand-navy font-bold">
              {t("ceoName")}
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
            {/* Vision — larger card */}
            <div
              className="md:col-span-3 bg-brand-navy text-white rounded-xl p-8 md:p-10 relative overflow-hidden"
              data-animate="slide-right"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-brand-copper" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                {t("visionTitle")}
              </h3>
              <p className="text-white/70 leading-relaxed text-lg">
                {t("visionContent")}
              </p>
            </div>

            {/* Mission — smaller card */}
            <div
              className="md:col-span-2 bg-white rounded-xl p-8 md:p-10 border-2 border-brand-copper/20 relative"
              data-animate="slide-left"
            >
              <div className="w-14 h-14 rounded-full bg-brand-copper/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-brand-copper" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-4">
                {t("missionTitle")}
              </h3>
              <p className="text-brand-charcoal leading-relaxed">
                {t("missionContent")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16 md:py-24 bg-surface-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-12"
            data-animate="fade-up"
          >
            {t("historyTitle")}
          </h2>
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[39px] md:left-[59px] top-0 bottom-0 w-px bg-surface-warm-200" />

            <div className="space-y-8">
              {historyItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative flex gap-6 md:gap-8 items-start"
                  data-animate="fade-up"
                  data-animate-delay={String(Math.min((index % 6) + 1, 6))}
                >
                  {/* Year */}
                  <div className="flex-shrink-0 w-[80px] md:w-[120px] text-right pr-5 md:pr-7 relative">
                    <span className="text-lg md:text-xl font-bold text-brand-navy">
                      {item.year}
                    </span>
                    {item.month && (
                      <span className="text-sm text-brand-charcoal/60 ml-0.5">
                        .{String(item.month).padStart(2, "0")}
                      </span>
                    )}
                    {/* Timeline dot */}
                    <div className="absolute right-0 top-1.5 translate-x-1/2 w-3 h-3 rounded-full bg-brand-copper border-2 border-white shadow-sm" />
                  </div>

                  {/* Description */}
                  <div className="flex-1 bg-white rounded-lg p-4 border border-surface-warm-200 shadow-sm">
                    <p className="text-brand-charcoal">
                      {locale === "ko"
                        ? item.description_ko
                        : item.description_en || item.description_ko}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-10"
            data-animate="fade-up"
          >
            {t("certTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: "ISO 9001",
                desc: t("certIso"),
                year: "2013 ~",
              },
              {
                icon: Building2,
                title: `CLEAN ${locale === "ko" ? "사업장" : "Workplace"}`,
                desc: t("certClean"),
                year: "2013 ~",
              },
              {
                icon: FileCheck,
                title:
                  locale === "ko"
                    ? "우레탄 금형베이스 특허"
                    : "Urethane Mold Base Patent",
                desc: t("certPatent"),
                year: "2016 ~",
              },
            ].map((cert, i) => (
              <div
                key={cert.title}
                className="flex items-start gap-4 p-6 bg-white rounded-xl border border-surface-warm-200 shadow-sm hover-lift"
                data-animate="fade-up"
                data-animate-delay={String(i + 1)}
              >
                <div className="w-12 h-12 rounded-full bg-brand-copper/10 flex items-center justify-center shrink-0">
                  <cert.icon className="w-6 h-6 text-brand-copper" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-brand-charcoal/70 mt-1">{cert.desc}</p>
                  <p className="text-xs text-brand-charcoal/60 mt-1.5">{cert.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Contact */}
      <section className="py-16 md:py-24 bg-surface-warm-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-8"
            data-animate="fade-up"
          >
            {t("mapTitle")}
          </h2>

          {/* Address with icon */}
          <div
            className="flex items-start gap-3 mb-8"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            <div className="w-10 h-10 rounded-full bg-brand-copper/10 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 text-brand-copper" />
            </div>
            <p className="text-brand-charcoal text-lg leading-relaxed">
              {t("mapAddress")}
            </p>
          </div>

          {/* Map embed */}
          <div
            className="aspect-video bg-surface-warm-100 rounded-xl overflow-hidden border border-surface-warm-200 shadow-sm"
            data-animate="fade-up"
            data-animate-delay="2"
          >
            <iframe
              src="https://maps.google.com/maps?q=%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84+%EC%96%91%EC%82%B0%EC%8B%9C+%EC%82%B0%EB%A7%89%EA%B3%B5%EB%8B%A8%EB%82%A814%EA%B8%B8+170&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t("mapTitle")}
            />
          </div>

          {/* Contact info with icons */}
          <div
            className="mt-6 flex flex-col sm:flex-row gap-4 sm:gap-8"
            data-animate="fade-up"
            data-animate-delay="3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-copper/10 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-brand-copper" />
              </div>
              <div>
                <span className="text-xs text-brand-charcoal/60 uppercase tracking-wide">TEL</span>
                <p className="text-brand-charcoal font-medium">055-367-2596</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-copper/10 flex items-center justify-center shrink-0">
                <Printer className="w-4 h-4 text-brand-copper" />
              </div>
              <div>
                <span className="text-xs text-brand-charcoal/60 uppercase tracking-wide">FAX</span>
                <p className="text-brand-charcoal font-medium">055-367-2597</p>
              </div>
            </div>
          </div>

          {/* Factory Photo */}
          <div
            className="mt-8 rounded-xl overflow-hidden border border-surface-warm-200 shadow-sm"
            data-animate="fade-up"
            data-animate-delay="4"
          >
            <ImageFade
              src="/images/factory/workshop-1.jpg"
              alt="나진테크 공장 내부"
              width={960}
              height={721}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, 960px"
            />
          </div>
        </div>
      </section>
    </>
  );
}
