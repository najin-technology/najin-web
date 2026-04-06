import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageCTA } from "@/components/page-cta";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: "/faq",
    titles: {
      ko: "자주 묻는 질문",
      en: "FAQ",
      zh: "常见问题",
    },
    descriptions: {
      ko: "나진테크 서비스에 대한 자주 묻는 질문. 가공 서비스, 소재, 인증, 납기, 견적 등.",
      en: "Frequently asked questions about NAJIN TECHNOLOGY services. Processing, materials, certifications, lead time, quotes.",
      zh: "关于纳进科技服务的常见问题。加工服务、材料、资质认证、交期、报价等。",
    },
  });
}

const faqItems = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export default function FAQPage() {
  const t = useTranslations("faq");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((n) => ({
      "@type": "Question",
      name: t(`question${n}`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`answer${n}`),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageHeader titleKey="pageTitle" namespace="faq" descriptionKey="pageDescription" bgImage="/images/factory/urethane-machine.jpg" />
      <Breadcrumb items={[{ label: t("pageTitle") }]} />

      <section className="py-12 md:py-20 bg-surface-warm-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion>
            {faqItems.map((n) => (
              <AccordionItem key={n} value={`faq-${n}`}>
                <AccordionTrigger className="text-left font-medium text-brand-charcoal">
                  {t(`question${n}`)}
                </AccordionTrigger>
                <AccordionContent className="text-brand-charcoal/80 leading-relaxed">
                  {t(`answer${n}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <PageCTA />
    </>
  );
}
