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

export const revalidate = 3600;
export const dynamic = "force-static";

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
      ko: "나진테크 서비스 자주 묻는 질문 8선. 우레탄 성형, CNC 정밀가공, 합성수지 가공 가능 소재 종류, 최소 주문량, 평균 납기, 견적 요청 절차, ISO 9001 품질 인증 현황까지 핵심 답변 정리.",
      en: "8 frequently asked questions about NAJIN TECHNOLOGY. Materials we machine, urethane and CNC processing capabilities, minimum order quantity, average lead time, how to request a quote, and ISO 9001 quality certification status.",
      zh: "关于纳进科技服务的8个常见问题。聚氨酯成型、CNC精密加工、合成树脂加工的可加工材料、最低订单量、平均交期、报价申请流程及ISO 9001质量认证现状等核心解答。",
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
                <AccordionTrigger className="text-left font-bold text-brand-charcoal">
                  {t(`question${n}`)}
                </AccordionTrigger>
                <AccordionContent className="text-brand-charcoal/90 leading-relaxed font-medium">
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
