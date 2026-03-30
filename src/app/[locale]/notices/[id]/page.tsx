import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getNoticeById } from "@/lib/queries";
import { Link } from "@/i18n/routing";
import DOMPurify from "isomorphic-dompurify";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const notice = await getNoticeById(id);
  if (!notice) return { title: "Not Found" };
  return { title: notice.title_ko };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const tc = await getTranslations("common");

  const notice = await getNoticeById(id);
  if (!notice) notFound();

  const title =
    locale === "ko" ? notice.title_ko : notice.title_en || notice.title_ko;
  const content =
    locale === "ko"
      ? notice.content_ko
      : notice.content_en || notice.content_ko;
  const date = notice.published_at || notice.created_at;

  // Check if content contains HTML tags (from Tiptap editor)
  const isHtml = content ? /<[a-z][\s\S]*>/i.test(content) : false;
  const sanitizedHtml = isHtml && content ? DOMPurify.sanitize(content) : null;

  return (
    <>
      <section className="bg-[#1B2A4A] text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{title}</h1>
          <p className="text-gray-300 text-sm">
            {new Date(date).toLocaleDateString(
              locale === "ko" ? "ko-KR" : "en-US",
              { year: "numeric", month: "long", day: "numeric" }
            )}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {sanitizedHtml ? (
            <div
              className="prose prose-gray max-w-none text-[#2D3748] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <div className="prose prose-gray max-w-none text-[#2D3748] leading-relaxed whitespace-pre-line">
              {content}
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/notices"
              className="text-sm font-medium text-[#3182CE] hover:underline"
            >
              ← {tc("backToList")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
