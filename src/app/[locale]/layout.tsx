import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollAnimationObserver } from "@/components/scroll-animation-observer";
import { MobileCTA } from "@/components/mobile-cta";

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
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileCTA />
      <ScrollAnimationObserver />
    </NextIntlClientProvider>
  );
}
