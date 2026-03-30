import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { getActiveJobPostings } from "@/lib/queries";
import { ApplyForm } from "./apply-form";

export const metadata = {
  title: "채용정보",
};

export default async function CareersPage() {
  const t = await getTranslations("careers");
  const locale = await getLocale();

  let jobs: Awaited<ReturnType<typeof getActiveJobPostings>> = [];
  try {
    jobs = await getActiveJobPostings();
  } catch {
    // fallback
  }

  return (
    <>
      <PageHeader titleKey="pageTitle" namespace="careers" />

      {/* Job Listings */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-6">
            {t("openPositions")}
          </h2>

          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">{t("noOpenings")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
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
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden group"
                  >
                    <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                      <div>
                        <h3 className="font-semibold text-[#1B2A4A]">
                          {title}
                        </h3>
                        <div className="flex gap-2 mt-2">
                          {job.department && (
                            <span className="inline-block px-2 py-0.5 text-xs font-medium text-[#3182CE] bg-blue-50 rounded">
                              {job.department}
                            </span>
                          )}
                          {job.employment_type && (
                            <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                              {job.employment_type}
                            </span>
                          )}
                          {job.deadline && (
                            <span className="text-xs text-gray-500">
                              {t("deadlineLabel")}:{" "}
                              {new Date(job.deadline).toLocaleDateString(
                                locale === "ko" ? "ko-KR" : "en-US"
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
                      {description && (
                        <div className="text-sm text-[#2D3748] whitespace-pre-line">
                          {description}
                        </div>
                      )}
                      {requirements && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#1B2A4A] mb-1">
                            {t("requirements")}
                          </h4>
                          <p className="text-sm text-[#2D3748] whitespace-pre-line">
                            {requirements}
                          </p>
                        </div>
                      )}
                      {benefits && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#1B2A4A] mb-1">
                            {t("benefits")}
                          </h4>
                          <p className="text-sm text-[#2D3748] whitespace-pre-line">
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
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">
            {t("applyTitle")}
          </h2>
          <p className="text-[#2D3748] mb-6">{t("applyDesc")}</p>
          <ApplyForm />
        </div>
      </section>
    </>
  );
}
