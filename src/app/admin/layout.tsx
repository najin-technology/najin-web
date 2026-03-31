import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
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

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
