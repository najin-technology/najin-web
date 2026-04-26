import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageCTA } from "@/components/page-cta";
import { getPublishedNotices } from "@/lib/queries";
import { Link } from "@/i18n/routing";
import { FileText, Calendar } from "lucide-react";

import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: "/notices",
    titles: { ko: "회사소식", en: "Company News", zh: "公司动态" },
    descriptions: {
      ko: "나진테크 회사 소식. 최신 공지, 공장 이전·확장, ISO 인증 취득, 신제품·기술 도입, 산업박람회·전시 참여 등 경남 양산 정밀가공 전문기업 25년 나진테크의 최근 동향과 주요 업데이트.",
      en: "NAJIN TECHNOLOGY company news. Latest announcements, factory relocation and expansion, ISO certifications, new products and technologies, trade show participation — recent updates from a 25-year precision manufacturing leader in Yangsan, South Korea.",
      zh: "纳进科技公司动态。最新公告、工厂搬迁与扩建、ISO认证取得、新产品与新技术导入、产业博览会参展等——庆南梁山25年精密加工专业企业纳进科技的近期动向。",
    },
  });
}

export default async function NoticesPage() {
  const t = await getTranslations("notices");
  const locale = await getLocale();

  let notices: Awaited<ReturnType<typeof getPublishedNotices>> = [];
  try {
    notices = await getPublishedNotices();
  } catch {
    // fallback
  }

  return (
    <>
      <PageHeader
        titleKey="pageTitle"
        namespace="notices"
        descriptionKey="pageDescription"
        bgImage="/images/factory/milling.jpg"
      />
      <Breadcrumb items={[{ label: t("pageTitle") }]} />

      <section className="py-12 md:py-20 bg-surface-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {notices.length === 0 ? (
            <div
              className="text-center py-16 bg-white rounded-2xl border border-surface-warm-200"
              data-animate="fade-up"
            >
              <FileText className="w-10 h-10 text-brand-charcoal/30 mx-auto mb-3" />
              <p className="text-brand-charcoal/60">{t("noNotices")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice, index) => (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  className="block bg-white rounded-xl border border-surface-warm-200 border-l-4 border-l-transparent p-6 hover:border-l-brand-copper hover:shadow-md transition-all hover-lift"
                  data-animate="fade-up"
                  data-animate-delay={String(Math.min(index + 1, 6))}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-copper/10 flex items-center justify-center mt-0.5">
                      <FileText className="w-5 h-5 text-brand-copper" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-navy mb-2 truncate">
                        {locale === "ko"
                          ? notice.title_ko
                          : notice.title_en || notice.title_ko}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-brand-charcoal/60">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {notice.published_at
                            ? new Date(
                                notice.published_at
                              ).toLocaleDateString(
                                locale === "ko" ? "ko-KR" : locale === "zh" ? "zh-CN" : "en-US"
                              )
                            : new Date(
                                notice.created_at
                              ).toLocaleDateString(
                                locale === "ko" ? "ko-KR" : locale === "zh" ? "zh-CN" : "en-US"
                              )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <PageCTA />
    </>
  );
}
