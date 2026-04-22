import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { CLIENTS, getClientBySlug } from "@/lib/clients";
import { getClientDeliveries } from "@/lib/queries";
import { createPageMetadata } from "@/lib/metadata";
import { Calendar, Phone, ArrowRight, FileText } from "lucide-react";

export async function generateStaticParams() {
  return CLIENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const client = getClientBySlug(slug);
  if (!client) {
    return { title: "Not Found" };
  }
  const titleKo = `${client.name} 협업사례`;
  const titleEn = `${client.nameEn} — Collaboration`;
  const titleZh = `${client.nameEn} 合作案例`;
  return createPageMetadata({
    locale,
    path: `/clients/${slug}`,
    titles: { ko: titleKo, en: titleEn, zh: titleZh },
    descriptions: {
      ko: `${client.name}와의 검증된 납품 이력과 협업사례를 소개합니다.`,
      en: `Verified delivery history and collaboration with ${client.nameEn}.`,
      zh: `与 ${client.nameEn} 的合作交付记录。`,
    },
  });
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const client = getClientBySlug(slug);
  if (!client) notFound();

  const t = await getTranslations("clients");
  const tc = await getTranslations("common");
  const tp = await getTranslations("portfolio");
  const locale = await getLocale();

  let deliveries: Awaited<ReturnType<typeof getClientDeliveries>> = [];
  try {
    deliveries = await getClientDeliveries(slug);
  } catch {
    // empty fallback
  }

  return (
    <>
      {/* Hero with logo */}
      <section className="relative bg-brand-navy text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 hero-gradient hero-pattern opacity-40" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white rounded-xl p-6 w-40 h-24 md:w-48 md:h-28 flex items-center justify-center shrink-0">
              <Image
                src={client.logo}
                alt={client.name}
                width={160}
                height={64}
                className="max-h-16 w-auto object-contain"
                unoptimized
                priority
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {locale === "ko" ? client.name : client.nameEn}
              </h1>
              {client.name !== client.nameEn && locale === "ko" && (
                <p className="text-white/70 text-sm mb-2">{client.nameEn}</p>
              )}
              {client.registeredYear && (
                <p className="text-brand-copper text-sm font-medium">
                  {t("registeredYear", { year: client.registeredYear })}
                </p>
              )}
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-8 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />
      </section>

      <Breadcrumb
        items={[
          { label: tp("pageTitle"), href: "/portfolio" },
          { label: t("breadcrumb"), href: "/portfolio" },
          { label: locale === "ko" ? client.name : client.nameEn },
        ]}
      />

      {/* Deliveries */}
      <section className="py-12 md:py-20 bg-surface-warm-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-brand-navy mb-3"
            data-animate="fade-up"
          >
            {t("deliveriesTitle")}
          </h2>
          <p
            className="text-brand-charcoal/70 mb-8 text-sm"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {t("deliveriesDesc")}
          </p>

          {deliveries.length === 0 ? (
            <div
              className="text-center py-12 md:py-16 bg-white rounded-2xl border border-surface-warm-200"
              data-animate="fade-up"
            >
              <FileText className="w-10 h-10 text-brand-charcoal/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-navy mb-2">
                {t("noDeliveriesTitle")}
              </h3>
              <p className="text-sm text-brand-charcoal/70 max-w-md mx-auto mb-6">
                {t("noDeliveriesDesc", {
                  name: locale === "ko" ? client.name : client.nameEn,
                })}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/quote">
                  <Button className="bg-brand-copper hover:bg-brand-copper-light text-white">
                    {t("ctaQuote")}
                  </Button>
                </Link>
                <a
                  href="tel:055-367-2596"
                  className="flex items-center gap-2 text-brand-charcoal/70 hover:text-brand-navy text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>055-367-2596</span>
                </a>
              </div>
            </div>
          ) : (
            <ol className="relative border-l-2 border-brand-copper/30 pl-6 space-y-6">
              {deliveries.map((d, i) => {
                const desc =
                  locale === "ko"
                    ? d.description_ko
                    : d.description_en || d.description_ko;
                return (
                  <li
                    key={d.id}
                    className="relative bg-white rounded-xl border border-surface-warm-200 p-5 shadow-sm"
                    data-animate="fade-up"
                    data-animate-delay={String(Math.min((i % 3) + 1, 3))}
                  >
                    <span className="absolute -left-[34px] top-5 w-3 h-3 rounded-full bg-brand-copper border-4 border-surface-warm-50" />
                    <div className="flex items-center gap-2 text-xs text-brand-copper font-semibold mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {d.year}
                        {d.month ? ` · ${t("monthLabel", { month: d.month })}` : ""}
                      </span>
                    </div>
                    <p className="text-brand-charcoal leading-relaxed">{desc}</p>
                    {d.source && (
                      <p className="text-[11px] text-brand-charcoal/40 mt-3">
                        {t("sourceLabel")}: {d.source}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* Reference: catalog links */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-xl md:text-2xl font-bold text-brand-navy mb-2"
            data-animate="fade-up"
          >
            {t("browseCatalogTitle")}
          </h2>
          <p
            className="text-sm text-brand-charcoal/60 mb-6"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {t("browseCatalogDesc")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/portfolio">
              <Button variant="outline" className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy/5">
                {t("viewAllPortfolio")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/posts">
              <Button variant="outline" className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy/5">
                {t("viewAllPosts")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-brand-navy text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            {tc("ctaTitle")}
          </h2>
          <p className="text-white/70 mb-6 text-sm">{tc("ctaDesc")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/quote">
              <Button
                size="lg"
                className="bg-brand-copper hover:bg-brand-copper-light text-white px-8"
              >
                {t("ctaQuote")}
              </Button>
            </Link>
            <a
              href="tel:055-367-2596"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>055-367-2596</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
