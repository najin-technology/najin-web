import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { QuoteForm } from "./quote-form";
import Image from "next/image";
import { Phone, MapPin, Mail } from "lucide-react";

export const metadata = {
  title: "견적문의",
};

export default function QuotePage() {
  const t = useTranslations("quote");

  return (
    <>
      <PageHeader
        titleKey="pageTitle"
        namespace="quote"
        descriptionKey="pageDescription"
      />

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
                      <p className="text-sm font-medium text-brand-charcoal">
                        Phone
                      </p>
                      <p className="text-sm text-brand-charcoal/70 mt-0.5">
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
                      <p className="text-sm font-medium text-brand-charcoal">
                        Address
                      </p>
                      <p className="text-sm text-brand-charcoal/70 mt-0.5">
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
                      <p className="text-sm font-medium text-brand-charcoal">
                        Email
                      </p>
                      <p className="text-sm text-brand-charcoal/70 mt-0.5">
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
                  <p className="text-xs font-semibold text-brand-charcoal mb-3 uppercase tracking-wide">
                    {t("processTitle")}
                  </p>
                  <div className="space-y-3">
                    {["processStep1", "processStep2", "processStep3", "processStep4"].map((step, i) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-navy text-white text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <p className="text-xs text-brand-charcoal/70">{t(step)}</p>
                      </div>
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
