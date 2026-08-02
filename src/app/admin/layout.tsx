import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { fontVariables } from "@/lib/fonts";
import { SITE_URL } from "@/lib/env";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "관리자",
    template: "%s — 나진테크 관리자",
  },
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: "나진테크 관리자",
    statusBarStyle: "default",
  },
};

// app/layout.tsx 를 없애면서 이 파일이 관리자 브랜치의 root layout 이 됐다.
// 공개 사이트([locale]/layout.tsx)와 쪼갠 이유는 <html lang> 을 로케일별로
// 서버에서 확정하기 위해서다. 관리자 화면은 한국어 전용이라 lang="ko" 고정.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
