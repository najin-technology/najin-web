import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { StatsCounter } from "@/components/stats-counter";
import Image from "next/image";
import {
  Droplets,
  FlaskConical,
  Cog,
  Box,
  Award,
  Building2,
  FileCheck,
  Calendar,
  Users,
  Phone,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const clients = [
  "국내외 주요 완성차사",
  "주요 부품사",
  "국내 완성차사",
  "SK",
  "한화케미칼",
  "주요 부품사",
  "주요 부품사",
  "주요 부품사",
  "Overseas automaker",
  "해외 부품사",
];

const businessAreas: {
  key: string;
  icon: LucideIcon;
  image: string;
}[] = [
  { key: "urethane", icon: Droplets, image: "/images/factory/workshop-2.jpg" },
  { key: "resin", icon: FlaskConical, image: "/images/products/pe-rod-1.jpg" },
  { key: "cnc", icon: Cog, image: "/images/products/3d-mc-part-1.jpg" },
  { key: "mold", icon: Box, image: "/images/products/3d-mc-part-2.jpg" },
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
        <Image
          src="/images/factory/workshop-1.jpg"
          alt="나진테크 공장"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-brand-navy/80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl">
            <h1
              className="text-3xl md:text-[44px] lg:text-[52px] font-bold leading-[1.2] mb-4 text-white whitespace-pre-line"
              data-animate="fade-up"
            >
              {t("heroTitle")}
            </h1>
            <p
              className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl"
              data-animate="fade-up"
              data-animate-delay="1"
            >
              {t("heroSubtitle")}
            </p>
            <div
              className="flex flex-wrap gap-4 mb-12"
              data-animate="fade-up"
              data-animate-delay="2"
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
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-3"
                >
                  {t("aboutLink")}
                </Button>
              </Link>
            </div>

            {/* Inline certifications */}
            <div
              className="flex flex-wrap gap-6 items-center"
              data-animate="fade-up"
              data-animate-delay="3"
            >
              {[
                { icon: Award, label: "ISO 9001" },
                { icon: Building2, label: "CLEAN 사업장" },
                { icon: FileCheck, label: "특허 보유" },
              ].map((cert) => (
                <div key={cert.label} className="flex items-center gap-2">
                  <cert.icon className="w-4 h-4 text-brand-copper" />
                  <span className="text-sm text-gray-300 font-medium">{cert.label}</span>
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

      {/* Client Logo Wall — structured grid (tight padding for rhythm) */}
      <section className="py-10 md:py-14 bg-surface-warm-50 border-y border-surface-warm-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-center text-sm font-semibold text-brand-charcoal/60 uppercase tracking-[0.2em] mb-8"
            data-animate="fade-in"
          >
            {t("clientsTitle")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-surface-warm-200">
            {clients.map((client, i) => (
              <div
                key={client}
                className="bg-white flex items-center justify-center py-6 px-4 hover:bg-surface-warm-50 transition-colors duration-300"
                data-animate="fade-in"
                data-animate-delay={String((i % 5) + 1)}
              >
                <span className="text-sm md:text-base font-bold text-brand-navy/70 hover:text-brand-navy transition-colors tracking-tight text-center leading-tight">
                  {client}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Areas — photo cards */}
      <section className="py-16 md:py-20 bg-surface-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-10"
            data-animate="fade-up"
          >
            {t("businessTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessAreas.map((area, i) => (
              <Link
                key={area.key}
                href="/business"
                className="group block bg-white rounded-xl overflow-hidden border border-surface-warm-200 hover-lift"
                data-animate="fade-up"
                data-animate-delay={String(i + 1)}
              >
                <div className="relative h-36 md:h-48 overflow-hidden">
                  <Image
                    src={area.image}
                    alt={tb(`${area.key}.title`)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <area.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-brand-navy group-hover:text-brand-blue transition-colors flex items-center gap-1">
                    {tb(`${area.key}.title`)}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{tb(`${area.key}.desc`).substring(0, 40)}...</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats — generous padding for emphasis */}
      <section className="py-20 md:py-28 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-center text-2xl md:text-3xl font-bold mb-12"
            data-animate="fade-up"
          >
            {t("numbersTitle")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div data-animate="fade-up" data-animate-delay="1">
              <Calendar className="w-6 h-6 mx-auto mb-3 text-brand-copper" />
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <StatsCounter end={24} suffix="+" />
              </div>
              <div className="text-sm text-gray-400">{t("statsYears")}</div>
            </div>
            <div data-animate="fade-up" data-animate-delay="2">
              <Users className="w-6 h-6 mx-auto mb-3 text-brand-copper" />
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <StatsCounter end={20} suffix="+" />
              </div>
              <div className="text-sm text-gray-400">{t("statsClients")}</div>
            </div>
            <div data-animate="fade-up" data-animate-delay="3">
              <Award className="w-6 h-6 mx-auto mb-3 text-brand-copper" />
              <div className="text-4xl md:text-5xl font-bold mb-2">
                ISO 9001
              </div>
              <div className="text-sm text-gray-400">{t("statsCertified")}</div>
            </div>
            <div data-animate="fade-up" data-animate-delay="4">
              <FileCheck className="w-6 h-6 mx-auto mb-3 text-brand-copper" />
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <StatsCounter end={1} suffix="+" />
              </div>
              <div className="text-sm text-gray-400">{t("statsPatent")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section — tighter to stats */}
      <section className="py-12 md:py-16 hero-gradient text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            data-animate="fade-up"
          >
            {t("ctaTitle")}
          </h2>
          <p
            className="text-gray-300 mb-4"
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
              <span>{t("ctaPhone")}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
