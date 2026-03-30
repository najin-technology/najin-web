import { getTranslations, getLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { getPublishedNotices } from "@/lib/queries";
import { Link } from "@/i18n/routing";

export const metadata = {
  title: "공지사항",
};

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
      <PageHeader titleKey="pageTitle" namespace="notices" />

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {notices.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">{t("noNotices")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-[#1B2A4A] mb-2">
                    {locale === "ko"
                      ? notice.title_ko
                      : notice.title_en || notice.title_ko}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {notice.published_at
                      ? new Date(notice.published_at).toLocaleDateString(
                          locale === "ko" ? "ko-KR" : "en-US"
                        )
                      : new Date(notice.created_at).toLocaleDateString(
                          locale === "ko" ? "ko-KR" : "en-US"
                        )}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
