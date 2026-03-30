import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

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

const businessAreas = [
  {
    key: "urethane",
    titleKo: "우레탄 성형",
    titleEn: "Urethane Molding",
    descKo: "특허 금형베이스 기술을 활용한 우레탄 성형 전문",
    descEn: "Specialized urethane molding with patented mold base technology",
    icon: "🔧",
  },
  {
    key: "resin",
    titleKo: "합성수지 가공",
    titleEn: "Resin Processing",
    descKo: "PC, PE, 아세탈 등 다양한 소재의 정밀 가공",
    descEn: "Precision processing of PC, PE, acetal and other materials",
    icon: "⚙️",
  },
  {
    key: "cnc",
    titleKo: "CNC/MCT 정밀가공",
    titleEn: "CNC/MCT Machining",
    descKo: "알루미늄, 황동, 합성수지 등 CNC/MCT 정밀 가공",
    descEn: "CNC/MCT precision machining for aluminum, brass, and synthetics",
    icon: "🏭",
  },
  {
    key: "mold",
    titleKo: "금형 제작",
    titleEn: "Mold Fabrication",
    descKo: "EV 부품, 배터리팩 등 고정밀 금형 설계 및 제작",
    descEn: "High-precision mold design for EV parts and battery packs",
    icon: "🔩",
  },
];

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#1B2A4A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              {t("heroSubtitle")}
            </p>
            <Link href="/quote">
              <Button
                size="lg"
                className="bg-[#3182CE] hover:bg-[#2B6CB0] text-white text-lg px-8 py-3"
              >
                {t("heroCta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Client Logos */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
            {t("clientsTitle")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center justify-items-center">
            {clients.map((client) => (
              <div
                key={client}
                className="text-center text-sm font-medium text-[#2D3748] bg-white rounded-lg px-4 py-3 shadow-sm w-full"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-8">
            {t("certTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-3">🏅</div>
              <h3 className="font-semibold text-[#1B2A4A]">ISO 9001</h3>
              <p className="text-sm text-gray-500 mt-1">2013 ~</p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="font-semibold text-[#1B2A4A]">CLEAN 사업장</h3>
              <p className="text-sm text-gray-500 mt-1">2013 ~</p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-3">📜</div>
              <h3 className="font-semibold text-[#1B2A4A]">
                우레탄 금형베이스 특허
              </h3>
              <p className="text-sm text-gray-500 mt-1">2016 ~</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Areas */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-8">
            {t("businessTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessAreas.map((area) => (
              <Link
                key={area.key}
                href="/business"
                className="group block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-3xl mb-4">{area.icon}</div>
                <h3 className="text-lg font-semibold text-[#1B2A4A] group-hover:text-[#3182CE] transition-colors">
                  {area.titleKo}
                </h3>
                <p className="text-sm text-gray-500 mt-2">{area.descKo}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-8">
            {t("numbersTitle")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-[#3182CE]">25</div>
              <div className="text-sm text-gray-500 mt-1">
                {t("statsYears")}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#3182CE]">20+</div>
              <div className="text-sm text-gray-500 mt-1">
                {t("statsClients")}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#3182CE]">ISO</div>
              <div className="text-sm text-gray-500 mt-1">
                {t("statsCertified")}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#3182CE]">1+</div>
              <div className="text-sm text-gray-500 mt-1">
                {t("statsPatent")}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
