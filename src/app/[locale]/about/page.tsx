import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { getHistoryItems } from "@/lib/queries";

export const metadata = {
  title: "회사소개",
};

export default async function AboutPage() {
  const t = await getTranslations("about");
  const locale = await getLocale();

  let historyItems: Awaited<ReturnType<typeof getHistoryItems>> = [];
  try {
    historyItems = await getHistoryItems();
  } catch {
    // fallback to empty if fetch fails
  }

  return (
    <>
      <PageHeader titleKey="pageTitle" namespace="about" />

      {/* CEO Greeting */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-6">
            {t("ceoTitle")}
          </h2>
          <div className="text-[#2D3748] leading-relaxed whitespace-pre-line">
            {t("ceoContent")}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-[#1B2A4A] mb-4">
                {t("visionTitle")}
              </h3>
              <p className="text-[#2D3748] leading-relaxed">
                {t("visionContent")}
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-[#1B2A4A] mb-4">
                {t("missionTitle")}
              </h3>
              <p className="text-[#2D3748] leading-relaxed">
                {t("missionContent")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-8">
            {t("historyTitle")}
          </h2>
          <div className="space-y-6">
            {historyItems.map((item) => (
              <div key={item.id} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="text-lg font-bold text-[#3182CE]">
                    {item.year}
                  </span>
                  {item.month && (
                    <span className="text-sm text-gray-500 ml-1">
                      .{String(item.month).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <div className="flex-shrink-0 w-px bg-gray-200 self-stretch" />
                <div className="pt-1 text-[#2D3748]">
                  {locale === "ko"
                    ? item.description_ko
                    : item.description_en || item.description_ko}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-8">
            {t("certTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
              <div className="text-3xl mb-3">🏅</div>
              <h3 className="font-semibold text-[#1B2A4A] mb-2">ISO 9001</h3>
              <p className="text-sm text-gray-500">{t("certIso")}</p>
              <p className="text-xs text-gray-400 mt-2">2013 ~</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="font-semibold text-[#1B2A4A] mb-2">
                CLEAN {locale === "ko" ? "사업장" : "Workplace"}
              </h3>
              <p className="text-sm text-gray-500">{t("certClean")}</p>
              <p className="text-xs text-gray-400 mt-2">2013 ~</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
              <div className="text-3xl mb-3">📜</div>
              <h3 className="font-semibold text-[#1B2A4A] mb-2">
                {locale === "ko" ? "우레탄 금형베이스 특허" : "Urethane Mold Base Patent"}
              </h3>
              <p className="text-sm text-gray-500">{t("certPatent")}</p>
              <p className="text-xs text-gray-400 mt-2">2016 ~</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-6">
            {t("mapTitle")}
          </h2>
          <p className="text-[#2D3748] mb-6">{t("mapAddress")}</p>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3262.3!2d129.0!3d35.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sko!2skr!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t("mapTitle")}
            />
          </div>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>TEL: 055-367-2596 / FAX: 055-367-2597</p>
          </div>
        </div>
      </section>
    </>
  );
}
