import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { QuoteForm } from "./quote-form";
import Image from "next/image";
import { Phone, MapPin, Mail } from "lucide-react";

import { createPageMetadata } from "@/lib/metadata";

// 폼 자체는 client component, 페이지 셸은 정적 → ISR.
export const revalidate = 86400;
export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: "/quote",
    titles: { ko: "견적문의", en: "Request a Quote", zh: "询价咨询" },
    descriptions: {
      ko: "나진테크 견적문의. 도면을 첨부해 우레탄·합성수지·CNC·금형 가공 견적을 요청하실 수 있습니다.",
      en: "Request a quote from NAJIN TECHNOLOGY. Attach your drawings for urethane, resin, CNC, and mold machining quotes.",
      zh: "纳进科技询价咨询。附上图纸即可申请聚氨酯、合成树脂、CNC、模具加工报价。",
    },
  });
}

export default function QuotePage() {
  const t = useTranslations("quote");

  return (
    <>
      <PageHeader
        titleKey="pageTitle"
        namespace="quote"
        descriptionKey="pageDescription"
        bgImage="/images/factory/factory-new-1.jpg"
      />
      <Breadcrumb items={[{ label: t("pageTitle") }]} />

      <section className="py-12 md:py-20 bg-surface-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Left: Contact Info Card (40%) */}
            <div className="lg:col-span-2" data-animate="slide-right">
              <div className="bg-white rounded-2xl border border-surface-warm-200 overflow-hidden shadow-sm sticky top-28">
                {/* Factory photo for trust */}
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src="/images/factory/workshop-2.jpg"
                    alt="나진테크 작업장"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                </div>
                <div className="p-8 -mt-8 relative">
                <h2 className="text-xl font-bold text-brand-navy mb-6">
                  {t("formTitle")}
                </h2>

                <div className="space-y-6">
                  {/* Phone */}
                  <div
                    className="flex items-start gap-4"
                    data-animate="fade-up"
                    data-animate-delay="1"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-copper/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-brand-copper" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-charcoal uppercase tracking-wide">
                        {t("contactPhone")}
                      </p>
                      <p className="text-sm text-brand-charcoal/85 mt-0.5 font-semibold tabular-nums">
                        055-367-2596
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div
                    className="flex items-start gap-4"
                    data-animate="fade-up"
                    data-animate-delay="2"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-copper/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand-copper" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-charcoal uppercase tracking-wide">
                        {t("contactAddress")}
                      </p>
                      <p className="text-sm text-brand-charcoal/85 mt-0.5 font-medium leading-relaxed">
                        경상남도 양산시 산막공단남14길 170
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div
                    className="flex items-start gap-4"
                    data-animate="fade-up"
                    data-animate-delay="3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-copper/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-brand-copper" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-charcoal uppercase tracking-wide">
                        {t("contactEmail")}
                      </p>
                      <p className="text-sm text-brand-charcoal/85 mt-0.5 font-semibold">
                        kinghak1@naver.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* Response promise */}
                <div className="mt-6 bg-brand-copper/10 rounded-lg p-4 text-center">
                  <p className="text-sm font-semibold text-brand-copper">
                    {t("responsePromise")}
                  </p>
                </div>

                {/* Quote Process */}
                <div className="mt-6 pt-6 border-t border-surface-warm-200">
                  <p className="text-xs font-bold text-brand-charcoal mb-3 uppercase tracking-wide">
                    {t("processTitle")}
                  </p>
                  <div className="space-y-3">
                    {["processStep1", "processStep2", "processStep3", "processStep4"].map((step, i) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-navy text-white text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <p className="text-[13px] text-brand-charcoal/85 font-medium leading-relaxed">{t(step)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline FAQ */}
                <div className="mt-6 pt-6 border-t border-surface-warm-200">
                  <p className="text-xs font-bold text-brand-charcoal mb-3 uppercase tracking-wide">
                    {t("faqTitle")}
                  </p>
                  <div className="space-y-2">
                    {(["faq1", "faq2", "faq3"] as const).map((faq) => (
                      <details key={faq} className="group">
                        <summary className="text-[13px] font-semibold text-brand-charcoal/90 cursor-pointer hover:text-brand-blue transition-colors list-none flex items-start gap-2">
                          <span className="text-brand-copper mt-0.5 shrink-0 font-bold">Q.</span>
                          <span>{t(`${faq}Q`)}</span>
                        </summary>
                        <p className="text-[13px] text-brand-charcoal/75 mt-1.5 ml-5 leading-relaxed font-medium">
                          {t(`${faq}A`)}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Right: Form (60%) */}
            <div className="lg:col-span-3" data-animate="slide-left">
              <div className="bg-white rounded-2xl border border-surface-warm-200 p-8 shadow-sm">
                <QuoteForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
