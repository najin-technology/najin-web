import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { getActiveJobPostings } from "@/lib/queries";
import { ApplyForm } from "./apply-form";
import { Briefcase, ChevronDown, Clock } from "lucide-react";

import { createPageMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd, SEGMENTS } from "@/lib/schema/breadcrumb";
import { buildJobPostingsJsonLd } from "@/lib/schema/job-posting";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: "/careers",
    titles: { ko: "채용정보", en: "Careers", zh: "招聘信息" },
    descriptions: {
      ko: "나진테크 채용. 경남 양산 정밀 가공 제조업 일자리 — CNC 가공, 우레탄 성형, 영업, 사무직 채용 공고. 복리후생, 근무 환경, 지원 방법 안내. 안정된 25년 기업에서 함께 성장할 동료를 찾습니다.",
      en: "Careers at NAJIN TECHNOLOGY — precision manufacturing jobs in Yangsan, Gyeongnam Province. CNC machining, urethane molding, sales, and office positions. Benefits, work environment, and how to apply. Join a stable 25-year manufacturing leader.",
      zh: "纳进科技招聘——庆南梁山精密加工制造业岗位。CNC加工、聚氨酯成型、销售、办公职位招聘公告。福利待遇、工作环境、应聘方式介绍。在25年稳定企业寻找共同成长的同事。",
    },
  });
}

export default async function CareersPage() {
  const t = await getTranslations("careers");
  const locale = await getLocale();

  let jobs: Awaited<ReturnType<typeof getActiveJobPostings>> = [];
  try {
    jobs = await getActiveJobPostings();
  } catch {
    // fallback
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [SEGMENTS.careers]);
  const jobPostingJsonLd = buildJobPostingsJsonLd(jobs, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {jobPostingJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
        />
      )}
      <PageHeader
        titleKey="pageTitle"
        namespace="careers"
        descriptionKey="pageDescription"
        bgImage="/images/factory/mct.jpg"
      />
      <Breadcrumb items={[{ label: t("pageTitle") }]} />

      {/* Job Listings */}
      <section className="py-12 md:py-20 bg-surface-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-bold text-brand-navy mb-8"
            data-animate="fade-up"
          >
            {t("openPositions")}
          </h2>

          {jobs.length === 0 ? (
            <div
              className="text-center py-16 bg-white rounded-2xl border border-surface-warm-200"
              data-animate="fade-up"
            >
              <Briefcase className="w-10 h-10 text-brand-charcoal/40 mx-auto mb-3" />
              <p className="text-brand-charcoal/75 font-medium">{t("noOpenings")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => {
                const title =
                  locale === "ko"
                    ? job.title_ko
                    : job.title_en || job.title_ko;
                const description =
                  locale === "ko"
                    ? job.description_ko
                    : job.description_en || job.description_ko;
                const requirements =
                  locale === "ko"
                    ? job.requirements_ko
                    : job.requirements_en || job.requirements_ko;
                const benefits =
                  locale === "ko"
                    ? job.benefits_ko
                    : job.benefits_en || job.benefits_ko;

                return (
                  <details
                    key={job.id}
                    className="bg-white rounded-xl border border-surface-warm-200 overflow-hidden group hover-lift"
                    data-animate="fade-up"
                    data-animate-delay={String(Math.min(index + 1, 6))}
                  >
                    <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-warm-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-copper/10 flex items-center justify-center mt-0.5">
                          <Briefcase className="w-4 h-4 text-brand-copper" />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-navy">
                            {title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.department && (
                              <span className="inline-flex items-center px-2.5 py-0.5 text-[13px] font-bold text-brand-blue bg-blue-50 rounded-full">
                                {job.department}
                              </span>
                            )}
                            {job.employment_type && (
                              <span className="inline-flex items-center px-2.5 py-0.5 text-[13px] font-bold text-brand-copper bg-brand-copper/10 rounded-full">
                                {job.employment_type}
                              </span>
                            )}
                            {job.deadline && (
                              <span className="inline-flex items-center gap-1 text-[13px] text-brand-charcoal/75 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {t("deadlineLabel")}:{" "}
                                <span className="tabular-nums font-semibold">
                                {new Date(job.deadline).toLocaleDateString(
                                  locale === "ko" ? "ko-KR" : locale === "zh" ? "zh-CN" : "en-US"
                                )}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-brand-charcoal/40 transition-transform group-open:rotate-180 flex-shrink-0 ml-4" />
                    </summary>
                    <div className="px-6 pb-6 space-y-4 border-t border-surface-warm-200 pt-4 ml-12">
                      {description && (
                        <div className="text-sm text-brand-charcoal/90 whitespace-pre-line font-medium leading-relaxed">
                          {description}
                        </div>
                      )}
                      {requirements && (
                        <div>
                          <h4 className="text-sm font-bold text-brand-navy mb-1.5">
                            {t("requirements")}
                          </h4>
                          <p className="text-sm text-brand-charcoal/90 whitespace-pre-line font-medium leading-relaxed">
                            {requirements}
                          </p>
                        </div>
                      )}
                      {benefits && (
                        <div>
                          <h4 className="text-sm font-bold text-brand-navy mb-1.5">
                            {t("benefits")}
                          </h4>
                          <p className="text-sm text-brand-charcoal/90 whitespace-pre-line font-medium leading-relaxed">
                            {benefits}
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Application Form */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-animate="fade-up">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">
              {t("applyTitle")}
            </h2>
            <p className="text-brand-charcoal/90 mb-8 font-medium leading-relaxed">{t("applyDesc")}</p>
          </div>
          <div
            className="bg-surface-warm-50 rounded-2xl border border-surface-warm-200 p-8"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            <ApplyForm />
          </div>
        </div>
      </section>
    </>
  );
}
