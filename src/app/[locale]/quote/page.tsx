import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { QuoteForm } from "./quote-form";

export const metadata = {
  title: "견적문의",
};

export default function QuotePage() {
  const t = useTranslations("quote");

  return (
    <>
      <PageHeader titleKey="pageTitle" namespace="quote" />

      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-6">
            {t("formTitle")}
          </h2>
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
