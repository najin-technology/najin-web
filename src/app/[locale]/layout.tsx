import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollAnimationObserver } from "@/components/scroll-animation-observer";
import { MobileCTA } from "@/components/mobile-cta";
import { Toaster } from "@/components/ui/sonner";
import { PageTracker } from "@/components/analytics/page-tracker";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang="${locale}"` }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-brand-navy focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm"
      >
        {locale === "zh" ? "跳转到主要内容" : locale === "en" ? "Skip to main content" : "본문 바로가기"}
      </a>
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <MobileCTA />
      <ScrollAnimationObserver />
      <PageTracker locale={locale} />
      <Toaster position="top-center" richColors />
    </NextIntlClientProvider>
  );
}
