import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "주요실적",
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

export default function PortfolioPage() {
  const t = useTranslations("portfolio");

  return (
    <>
      <PageHeader titleKey="pageTitle" namespace="portfolio" />

      {/* Major Clients */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4">
            {t("clientsTitle")}
          </h2>
          <p className="text-[#2D3748] mb-8">{t("clientsDesc")}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {clients.map((client) => (
              <div
                key={client.name}
                className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-2">
                  {client.category === "automotive"
                    ? "🚗"
                    : client.category === "overseas"
                      ? "🌏"
                      : "🏭"}
                </div>
                <p className="font-medium text-[#1B2A4A] text-sm">
                  {client.name}
                </p>
                {client.name !== client.nameEn && (
                  <p className="text-xs text-gray-400 mt-1">{client.nameEn}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Placeholder */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-8">
            {t("galleryTitle")}
          </h2>
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">{t("galleryPlaceholder")}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/quote">
            <Button
              size="lg"
              className="bg-[#3182CE] hover:bg-[#2B6CB0] text-white text-lg px-8 py-3"
            >
              {t("clientsTitle")} →
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
