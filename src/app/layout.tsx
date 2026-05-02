import type { Metadata } from "next";
import { Geist, Noto_Sans_KR, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AdminFab } from "@/components/admin-fab";
import { SITE_URL } from "@/lib/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  preload: true,
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "700"],
  preload: false,
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${notoSansKR.variable} ${notoSansSC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "나진테크 | NAJIN TECHNOLOGY",
              alternateName: ["나진테크", "NAJIN TECHNOLOGY", "纳进科技"],
              url: SITE_URL,
              inLanguage: ["ko-KR", "en-US", "zh-CN"],
              publisher: {
                "@type": "Organization",
                name: "나진테크",
                url: SITE_URL,
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "나진테크",
              alternateName: "NAJIN TECHNOLOGY",
              url: SITE_URL,
              logo: `${SITE_URL}/images/logo/najin-logo.png`,
              foundingDate: "2002-12",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+82-55-367-2596",
                contactType: "customer service",
                areaServed: "KR",
                availableLanguage: ["Korean", "English", "Chinese"],
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "산막공단남14길 170",
                addressLocality: "양산시",
                addressRegion: "경상남도",
                addressCountry: "KR",
              },
              knowsAbout: [
                "Urethane Molding",
                "CNC Precision Machining",
                "Synthetic Resin Processing",
                "Mold Fabrication",
                "EV Parts Manufacturing",
              ],
              award: [
                "ISO 9001 Quality Management Certification",
                "CLEAN Workplace Certification",
                "Urethane Mold Base Patent",
              ],
              numberOfEmployees: {
                "@type": "QuantitativeValue",
                minValue: 20,
                maxValue: 50,
              },
              naics: "326199",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "나진테크",
              url: SITE_URL,
              image: `${SITE_URL}/images/factory/workshop-1.jpg`,
              telephone: "+82-55-367-2596",
              faxNumber: "+82-55-367-2597",
              email: "kinghak1@naver.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "산막공단남14길 170",
                addressLocality: "양산시",
                addressRegion: "경상남도",
                addressCountry: "KR",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 35.335,
                longitude: 129.0265,
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "08:30",
                closes: "17:30",
              },
            }),
          }}
        />
        {children}
        <Analytics />
        <AdminFab />
      </body>
    </html>
  );
}
