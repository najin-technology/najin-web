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
  "현대자동차",
  "현대파워텍",
  "르노삼성",
  "SK",
  "한화케미칼",
  "동희산업",
  "화신",
  "성우하이텍",
  "GM Shanghai",
  "Lear Dymos",
];

const businessAreas: {
  key: string;
  titleKo: string;
  descKo: string;
  icon: LucideIcon;
  image: string;
}[] = [
  {
    key: "urethane",
    titleKo: "우레탄 성형",
    descKo: "특허 금형베이스 기술을 활용한 우레탄 성형 전문",
    icon: Droplets,
    image: "/images/factory/urethane-machine.jpg",
  },
  {
    key: "resin",
    titleKo: "합성수지 가공",
    descKo: "PC, PE, 아세탈 등 다양한 소재의 정밀 가공",
    icon: FlaskConical,
    image: "/images/products/pe-rod-1.jpg",
  },
  {
    key: "cnc",
    titleKo: "CNC/MCT 정밀가공",
    descKo: "알루미늄, 황동, 합성수지 등 CNC/MCT 정밀 가공",
    icon: Cog,
    image: "/images/products/3d-mc-part-1.jpg",
  },
  {
    key: "mold",
    titleKo: "금형 제작",
    descKo: "EV 부품, 배터리팩 등 고정밀 금형 설계 및 제작",
    icon: Box,
    image: "/images/products/machined-part-1.jpg",
  },
];

export default function HomePage() {
  const t = useTranslations("home");
  const tc = useTranslations("common");

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
          <div className="max-w-3xl">
            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-white"
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

      {/* Client Logo Wall — big text, high impact */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-10"
            data-animate="fade-in"
          >
            {t("clientsTitle")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 md:gap-x-16">
            {clients.map((client, i) => (
              <span
                key={client}
                className="text-lg md:text-2xl font-bold text-brand-navy/30 hover:text-brand-navy transition-colors duration-300"
                data-animate="fade-in"
                data-animate-delay={String((i % 5) + 1)}
              >
                {client}
              </span>
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
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={area.image}
                    alt={area.titleKo}
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
                    {area.titleKo}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{area.descKo}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20 bg-brand-navy text-white">
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
