import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
