import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: "",
    titles: {
      ko: "25년 전통 정밀 가공 전문기업",
      en: "Precision Manufacturing Since 2002",
      zh: "25年精密加工专业企业",
    },
    descriptions: {
      ko: "경남 양산 우레탄 성형, 합성수지 가공, CNC 정밀가공, 금형 제작 전문기업 나진테크. 현대자동차, SK, GM Shanghai 등 20+ 거래처 납품.",
      en: "NAJIN TECHNOLOGY - Urethane molding, synthetic resin, CNC machining, mold fabrication in Yangsan, Korea. Supplying Hyundai, SK, GM Shanghai and 20+ clients.",
      zh: "纳进科技 — 庆南梁山聚氨酯成型、合成树脂加工、CNC精密加工、模具制作专业企业。向现代汽车、SK、GM上海等20+客户供货。",
    },
  });
}
import { Button } from "@/components/ui/button";
import { StatsCounter } from "@/components/stats-counter";
import { TypewriterText } from "@/components/typewriter-text";
import Image from "next/image";
import { ImageFade } from "@/components/image-fade";
import { LatestPosts } from "@/components/latest-posts";
import { CallbackForm } from "@/components/callback-form";
import {
  Droplets,
  FlaskConical,
  Cog,
  Box,
  Zap,
  Award,
  Building2,
  FileCheck,
  Calendar,
  Users,
  Phone,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const clients: { name: string; logo?: string }[] = [
  { name: "현대자동차", logo: "/images/logos/hyundai.svg" },
  { name: "현대파워텍", logo: "/images/logos/hyundai-powertech.svg" },
  { name: "르노삼성", logo: "/images/logos/renault.svg" },
  { name: "SK", logo: "/images/logos/sk.svg" },
  { name: "한화케미칼", logo: "/images/logos/hanwha.svg" },
  { name: "동희산업", logo: "/images/logos/donghee.svg" },
  { name: "화신", logo: "/images/logos/hwashin.svg" },
  { name: "성우하이텍", logo: "/images/logos/sungwoo.svg" },
  { name: "GM Shanghai", logo: "/images/logos/gm.svg" },
  { name: "Lear Dymos", logo: "/images/logos/lear.svg" },
];

const businessAreas: {
  key: string;
  icon: LucideIcon;
  image: string;
  tag: string;
}[] = [
  { key: "urethane", icon: Droplets, image: "/images/factory/workshop-2.jpg", tag: "우레탄" },
  { key: "resin", icon: FlaskConical, image: "/images/products/pe-rod-1.jpg", tag: "합성수지" },
  { key: "cnc", icon: Cog, image: "/images/products/3d-mc-part-1.jpg", tag: "CNC" },
  { key: "mold", icon: Box, image: "/images/products/3d-mc-part-2.jpg", tag: "금형" },
  { key: "ev", icon: Zap, image: "/images/products/db-4421a7e9-0.jpg", tag: "EV" },
];

export default function HomePage() {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const tb = useTranslations("business");

  return (
    <>
      {/* Hero with photo background */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background photo */}
        <ImageFade
          src="/images/factory/workshop-1.jpg"
          alt="나진테크 공장"
          fill
          className="object-cover"
          sizes="100vw"
          priority
          fast
        />
        {/* Dark overlay — slightly transparent to let factory image show through */}
        <div className="absolute inset-0 bg-brand-navy/75" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl">
            <h1
              className="text-3xl md:text-[44px] lg:text-[52px] font-bold leading-[1.2] mb-4 text-white"
            >
              <TypewriterText text={t("heroTitle")} delayMs={50} startDelayMs={300} />
            </h1>
            <p
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl"
              data-animate="fade-up"
              data-animate-delay="1"
            >
              {t("heroSubtitle")}
            </p>
            <div
              className="flex flex-wrap gap-4 mb-12"
              data-animate="fade-up"
              data-animate-delay="1"
            >
              <Link href="/quote">
                <Button
                  size="lg"
                  className="bg-brand-copper hover:bg-brand-copper-light text-white text-lg px-8 py-3"
                >
                  {t("heroCta")}
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/60 text-white bg-white/10 hover:bg-white/20 text-lg px-8 py-3"
                >
                  {t("aboutLink")}
                </Button>
              </Link>
            </div>

            {/* Response promise badge */}
            <p
              className="text-sm text-brand-copper font-medium mb-8"
              data-animate="fade-up"
              data-animate-delay="1"
            >
              {t("heroResponsePromise")}
            </p>

            {/* Inline certifications */}
            <div
              className="flex flex-wrap gap-6 items-center"
              data-animate="fade-up"
              data-animate-delay="2"
            >
              {[
                { icon: Award, label: "ISO 9001" },
                { icon: Building2, label: t("badgeClean") },
                { icon: FileCheck, label: t("badgePatent") },
              ].map((cert) => (
                <div key={cert.label} className="flex items-center gap-2">
                  <cert.icon className="w-4 h-4 text-brand-copper" />
                  <span className="text-sm text-white/80 font-medium">{cert.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagonal bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />
      </section>

      {/* Client Logos — static grid, equal treatment */}
      <section className="py-10 md:py-14 bg-surface-warm-50 border-y border-surface-warm-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-center text-sm font-semibold text-brand-charcoal/60 uppercase tracking-[0.2em] mb-8"
            data-animate="fade-in"
          >
            {t("clientsTitle")}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 md:gap-8 items-center justify-items-center" data-animate="fade-up">
            {clients.map((client) => (
              <Link
                key={client.name}
                href={`/posts?tag=${client.name}`}
                className="flex items-center justify-center h-12 w-full transition-opacity opacity-50 hover:opacity-100"
              >
                {client.logo ? (
                  <Image
                    src={client.logo}
                    alt={client.name}
                    width={120}
                    height={40}
                    className="h-8 md:h-10 w-auto object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm font-bold text-brand-navy/60 tracking-tight">
                    {client.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Business Areas — photo cards (white bg to contrast with warm-50 clients above) */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-10"
            data-animate="fade-up"
          >
            {t("businessTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {businessAreas.map((area, i) => (
              <Link
                key={area.key}
                href={`/posts?tag=${area.tag}`}
                className="group block bg-white rounded-xl overflow-hidden border border-surface-warm-200 hover-lift"
                data-animate="fade-up"
                data-animate-delay={String(i + 1)}
              >
                <div className="relative h-36 md:h-44 overflow-hidden">
                  <ImageFade
                    src={area.image}
                    alt={tb(`${area.key}.title`)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-brand-navy group-hover:text-brand-blue transition-colors flex items-center gap-1.5">
                    <area.icon className="w-4 h-4 text-brand-copper shrink-0" />
                    {tb(`${area.key}.title`)}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                  </h3>
                  <p className="text-sm text-brand-charcoal/70 mt-1 line-clamp-2">{tb(`${area.key}.desc`)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why NAJIN — differentiators */}
      <section className="py-16 md:py-20 bg-surface-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-3"
            data-animate="fade-up"
          >
            {t("whyTitle")}
          </h2>
          <p
            className="text-brand-charcoal/70 mb-10 max-w-2xl"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {t("whySubtitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {([
              {
                title: t("why1Title"),
                desc: t("why1Desc"),
                icon: FileCheck,
              },
              {
                title: t("why2Title"),
                desc: t("why2Desc"),
                icon: Cog,
              },
              {
                title: t("why3Title"),
                desc: t("why3Desc"),
                icon: Users,
              },
              {
                title: t("why4Title"),
                desc: t("why4Desc"),
                icon: Zap,
              },
            ] as const).map((item, i) => (
              <div
                key={i}
                className="group flex gap-4 p-5 bg-white rounded-xl border border-surface-warm-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                data-animate="fade-up"
                data-animate-delay={String(i + 1)}
              >
                <div className="w-10 h-10 rounded-lg bg-brand-copper/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-brand-copper icon-hover-bounce" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy mb-1">{item.title}</h3>
                  <p className="text-sm text-brand-charcoal/70 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10" data-animate="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-3">
              {t("portfolioTitle")}
            </h2>
            <p className="text-brand-charcoal/70">{t("portfolioSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: "portfolio1", image: "/images/products/pe-rod-1.jpg", logo: "/images/logos/hyundai.svg" },
              { key: "portfolio2", image: "/images/products/3d-mc-part-1.jpg", logo: "/images/logos/sk.svg" },
              { key: "portfolio3", image: "/images/products/db-4421a7e9-0.jpg", logo: "/images/logos/gm.svg" },
            ].map((item, i) => (
              <div
                key={item.key}
                className="group bg-white rounded-xl border border-surface-warm-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                data-animate="fade-up"
                data-animate-delay={String(i + 1)}
              >
                <div className="relative aspect-[16/10] bg-surface-warm-100 overflow-hidden">
                  <ImageFade
                    src={item.image}
                    alt={t(item.key)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5 flex items-center gap-3">
                  <Image
                    src={item.logo}
                    alt=""
                    width={28}
                    height={28}
                    className="object-contain opacity-60"
                    unoptimized
                  />
                  <p className="text-sm font-medium text-brand-charcoal line-clamp-1">{t(item.key)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8" data-animate="fade-up">
            <Link href="/portfolio">
              <Button variant="outline" className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy/5">
                {t("portfolioViewAll")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <LatestPosts />

      {/* Stats — generous padding for emphasis */}
      <section className="py-20 md:py-28 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-center text-2xl md:text-3xl font-bold mb-8"
            data-animate="fade-up"
          >
            {t("numbersTitle")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div data-animate="fade-up" data-animate-delay="1">
              <Calendar className="w-6 h-6 mx-auto mb-3 text-brand-copper" />
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <StatsCounter end={25} suffix="+" />
              </div>
              <div className="text-sm text-white/80">{t("statsYears")}</div>
            </div>
            <div data-animate="fade-up" data-animate-delay="2">
              <Users className="w-6 h-6 mx-auto mb-3 text-brand-copper" />
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <StatsCounter end={20} suffix="+" />
              </div>
              <div className="text-sm text-white/80">{t("statsClients")}</div>
            </div>
            <div data-animate="fade-up" data-animate-delay="3">
              <Award className="w-6 h-6 mx-auto mb-3 text-brand-copper" />
              <div className="text-4xl md:text-5xl font-bold mb-2">
                ISO 9001
              </div>
              <div className="text-sm text-white/80">{t("statsCertified")}</div>
            </div>
            <div data-animate="fade-up" data-animate-delay="4">
              <FileCheck className="w-6 h-6 mx-auto mb-3 text-brand-copper" />
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <StatsCounter end={1} suffix="+" />
              </div>
              <div className="text-sm text-white/80">{t("statsPatent")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section — tighter to stats */}
      <section className="py-12 md:py-16 hero-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: CTA text + button */}
            <div className="text-center lg:text-left">
              <h2
                className="text-2xl md:text-3xl font-bold mb-4"
                data-animate="fade-up"
              >
                {t("ctaTitle")}
              </h2>
              <p
                className="text-white/80 mb-4"
                data-animate="fade-up"
                data-animate-delay="1"
              >
                {t("ctaSubtitle")}
              </p>
              <p
                className="text-brand-copper font-medium mb-8"
                data-animate="fade-up"
                data-animate-delay="1"
              >
                {t("ctaPersuasion")}
              </p>
              <div
                className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
                data-animate="fade-up"
                data-animate-delay="2"
              >
                <Link href="/quote">
                  <Button
                    size="lg"
                    className="bg-brand-copper hover:bg-brand-copper-light text-white text-xl px-12 py-6 shadow-lg cta-glow"
                  >
                    {tc("requestQuote")}
                  </Button>
                </Link>
                <a
                  href="tel:+82-55-367-2596"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mt-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t("ctaPhone")}</span>
                </a>
              </div>
            </div>

            {/* Right: Callback quick form */}
            <div
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
              data-animate="slide-left"
            >
              <CallbackForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
