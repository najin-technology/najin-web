import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["ko", "en", "zh"],
  defaultLocale: "ko",
  // localePrefix:"always" 가 default — path 가 locale source of truth.
  // NEXT_LOCALE 쿠키 set 비활성화: 응답에 set-cookie 가 들어가면 Vercel CDN 이
  // dynamic 으로 처리하여 cache-control: private 강제 → ISR 무효화. 따라서 OFF.
  localeCookie: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
