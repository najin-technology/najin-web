import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "나진테크 관리자 로그인",
  robots: "noindex, nofollow",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
