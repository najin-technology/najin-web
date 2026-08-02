import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { AdminFab } from "@/components/admin-fab";
import { fontVariables } from "@/lib/fonts";
import { SiteJsonLd } from "@/components/site-json-ld";
import { SITE_URL } from "@/lib/env";
import "../globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollAnimationObserver } from "@/components/scroll-animation-observer";
import { MobileCTA } from "@/components/mobile-cta";
import { DesktopFloatingCTA } from "@/components/desktop-floating-cta";
import { Toaster } from "@/components/ui/sonner";
import { PageTracker } from "@/components/analytics/page-tracker";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "나진테크 | NAJIN TECHNOLOGY",
    template: "%s | 나진테크",
  },
  description:
    "경남 양산 우레탄 성형, 합성수지 가공, CNC 정밀가공, 금형 제작 전문기업 나진테크",
  keywords: [
    "나진테크",
    "NAJIN TECHNOLOGY",
    "우레탄 성형",
    "합성수지 가공",
    "CNC 가공",
    "금형 제작",
    "양산",
    "경남",
  ],
  openGraph: {
    type: "website",
    siteName: "나진테크 | NAJIN TECHNOLOGY",
    locale: "ko_KR",
    alternateLocale: ["en_US", "zh_CN"],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    types: {
      "application/rss+xml": [
        { url: `${SITE_URL}/feed.xml`, title: "나진테크 RSS" },
      ],
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    other: {
      ...(process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION?.trim()
        ? { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION.trim() }
        : {}),
    },
  },
};

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
  // Load messages directly by locale and pass them to the provider. During
  // static prerender, client components (forms) read the provider's messages;
  // getMessages()/propless provider can fall back to the default locale here,
  // so we import the locale's messages explicitly to guarantee correctness.
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    // 이 파일이 공개 사이트 브랜치의 root layout 이다(app/layout.tsx 없음).
    // 예전엔 app/layout.tsx 가 lang="ko" 로 하드코딩돼 있고 여기서 클라이언트
    // 스크립트로 document.documentElement.lang 을 덮어썼는데, JS 를 실행하지 않는
    // 크롤러·스크린리더에는 /en 과 /zh 도 한국어로 보였다. 이제 서버에서 확정한다.
    <html lang={locale} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteJsonLd />
        <NextIntlClientProvider locale={locale} messages={messages}>
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
          <DesktopFloatingCTA />
          <ScrollAnimationObserver />
          <PageTracker locale={locale} />
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
        <Analytics />
        <AdminFab />
      </body>
    </html>
  );
}
