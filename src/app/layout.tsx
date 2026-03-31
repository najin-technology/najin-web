import type { Metadata } from "next";
import { Geist, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AdminFab } from "@/components/admin-fab";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  preload: false,
});

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${geistSans.variable} ${notoSansKR.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "나진테크",
              alternateName: "NAJIN TECHNOLOGY",
              url: "https://najin-webapp.vercel.app",
              logo: "https://najin-webapp.vercel.app/images/logo/najin-logo.jpg",
              foundingDate: "2002-12",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+82-55-367-2596",
                contactType: "customer service",
                areaServed: "KR",
                availableLanguage: ["Korean", "English"],
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "산막공단남14길 170",
                addressLocality: "양산시",
                addressRegion: "경상남도",
                addressCountry: "KR",
              },
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
              image: "https://najin-webapp.vercel.app/images/factory/workshop-1.jpg",
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
