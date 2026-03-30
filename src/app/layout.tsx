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
    default: "나진테크 | NAJIN TECH",
    template: "%s | 나진테크",
  },
  description:
    "경남 양산 우레탄 성형, 합성수지 가공, CNC 정밀가공, 금형 제작 전문기업 나진테크",
  keywords: [
    "나진테크",
    "NAJIN TECH",
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
        {children}
        <Analytics />
        <AdminFab />
      </body>
    </html>
  );
}
