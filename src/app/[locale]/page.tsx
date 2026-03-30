import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { StatsCounter } from "@/components/stats-counter";
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
  titleKo: string;
  titleEn: string;
  descKo: string;
  descEn: string;
  icon: LucideIcon;
}[] = [
  {
    key: "urethane",
    titleKo: "우레탄 성형",
    titleEn: "Urethane Molding",
    descKo: "특허 금형베이스 기술을 활용한 우레탄 성형 전문",
    descEn: "Specialized urethane molding with patented mold base technology",
    icon: Droplets,
  },
  {
    key: "resin",
    titleKo: "합성수지 가공",
    titleEn: "Resin Processing",
    descKo: "PC, PE, 아세탈 등 다양한 소재의 정밀 가공",
    descEn: "Precision processing of PC, PE, acetal and other materials",
    icon: FlaskConical,
  },
  {
    key: "cnc",
    titleKo: "CNC/MCT 정밀가공",
    titleEn: "CNC/MCT Machining",
    descKo: "알루미늄, 황동, 합성수지 등 CNC/MCT 정밀 가공",
    descEn: "CNC/MCT precision machining for aluminum, brass, and synthetics",
    icon: Cog,
  },
  {
    key: "mold",
    titleKo: "금형 제작",
    titleEn: "Mold Fabrication",
    descKo: "EV 부품, 배터리팩 등 고정밀 금형 설계 및 제작",
    descEn: "High-precision mold design for EV parts and battery packs",
    icon: Box,
  },
];

export default function HomePage() {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <>
      {/* Hero */}
      <section className="relative hero-gradient hero-pattern text-white min-h-[85vh] flex items-center overflow-hidden">
        {/* Background image slot */}
        <div className="absolute inset-0 bg-cover bg-center opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
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
              className="flex flex-wrap gap-4"
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
          </div>
        </div>
        {/* Diagonal bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />
      </section>

      {/* Client Logos */}
      <section className="py-14 md:py-20 bg-surface-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-10"
            data-animate="fade-in"
          >
            {t("clientsTitle")}
          </h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 items-center">
            {clients.map((client, i) => (
              <span
                key={client}
                className="text-sm font-medium text-brand-charcoal/60 tracking-wide"
                data-animate="fade-in"
                data-animate-delay={String((i % 5) + 1)}
              >
                {client}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-center text-2xl md:text-3xl font-bold text-brand-navy mb-10"
            data-animate="fade-up"
          >
            {t("certTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Award, title: "ISO 9001", year: "2013 ~" },
              { icon: Building2, title: "CLEAN 사업장", year: "2013 ~" },
              {
                icon: FileCheck,
                title: "우레탄 금형베이스 특허",
                year: "2016 ~",
              },
            ].map((cert, i) => (
              <div
                key={cert.title}
                className="flex items-start gap-4 p-6 border-l-4 border-brand-copper bg-surface-warm-50 rounded-r-lg hover-lift"
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
                  <p className="text-sm text-gray-500 mt-0.5">{cert.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Areas */}
      <section className="py-16 md:py-20 bg-surface-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-center text-2xl md:text-3xl font-bold text-brand-navy mb-10"
            data-animate="fade-up"
          >
            {t("businessTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessAreas.map((area, i) => (
              <Link
                key={area.key}
                href="/business"
                className="group block bg-white rounded-lg p-6 border border-surface-warm-200 hover-lift"
                data-animate="fade-up"
                data-animate-delay={String(i + 1)}
              >
                <div className="w-12 h-12 rounded-full bg-brand-copper/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <area.icon className="w-6 h-6 text-brand-copper" />
                </div>
                <h3 className="text-lg font-semibold text-brand-navy group-hover:text-brand-blue transition-colors">
                  {area.titleKo}
                </h3>
                <p className="text-sm text-gray-500 mt-2">{area.descKo}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20 bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-center text-2xl md:text-3xl font-bold mb-12"
            data-animate="fade-up"
          >
            {t("numbersTitle")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              {
                icon: Calendar,
                end: 25,
                suffix: "",
                label: t("statsYears"),
              },
              {
                icon: Users,
                end: 20,
                suffix: "+",
                label: t("statsClients"),
              },
              {
                icon: Award,
                end: 0,
                suffix: "",
                prefix: "ISO",
                label: t("statsCertified"),
              },
              {
                icon: FileCheck,
                end: 1,
                suffix: "+",
                label: t("statsPatent"),
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                data-animate="fade-up"
                data-animate-delay={String(i + 1)}
              >
                <stat.icon className="w-6 h-6 mx-auto mb-3 text-brand-copper" />
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.prefix ? (
                    <span>{stat.prefix}</span>
                  ) : (
                    <StatsCounter
                      end={stat.end}
                      suffix={stat.suffix}
                    />
                  )}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="w-8 h-0.5 bg-brand-copper mx-auto mt-3" />
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
