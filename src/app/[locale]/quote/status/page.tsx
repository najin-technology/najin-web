import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { StatusForm } from "./status-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quote.status" });
  return {
    title: t("title"),
    description: t("description"),
    robots: "noindex, nofollow",
  };
}

export default async function QuoteStatusPage() {
  const t = await getTranslations("quote.status");

  return (
    <>
      <PageHeader titleKey="status.title" namespace="quote" descriptionKey="status.description" />
      <Breadcrumb items={[{ label: t("title") }]} />

      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={null}>
            <StatusForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
