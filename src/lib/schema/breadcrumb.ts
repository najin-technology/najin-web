import { SITE_URL as BASE_URL } from "@/lib/env";

type Segment = {
  ko: string;
  en: string;
  zh: string;
  path: string;
};

const HOME: Segment = { ko: "홈", en: "Home", zh: "首页", path: "" };

export function buildBreadcrumbJsonLd(locale: string, segments: Segment[]) {
  const items = [HOME, ...segments];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((seg, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name:
        (locale === "en" && seg.en) ||
        (locale === "zh" && seg.zh) ||
        seg.ko,
      item: `${BASE_URL}/${locale}${seg.path}`,
    })),
  };
}

export const SEGMENTS = {
  about: { ko: "회사소개", en: "About", zh: "公司介绍", path: "/about" },
  business: { ko: "사업영역", en: "Business", zh: "业务领域", path: "/business" },
  portfolio: { ko: "주요실적", en: "Portfolio", zh: "主要业绩", path: "/portfolio" },
  posts: { ko: "제작사례", en: "Projects", zh: "制作案例", path: "/posts" },
  notices: { ko: "회사소식", en: "News", zh: "公司动态", path: "/notices" },
  faq: { ko: "자주 묻는 질문", en: "FAQ", zh: "常见问题", path: "/faq" },
  careers: { ko: "채용정보", en: "Careers", zh: "招聘信息", path: "/careers" },
  quote: { ko: "견적문의", en: "Get a Quote", zh: "立即询价", path: "/quote" },
  privacy: { ko: "개인정보처리방침", en: "Privacy Policy", zh: "隐私政策", path: "/privacy" },
  clients: { ko: "거래처", en: "Clients", zh: "合作伙伴", path: "/portfolio" },
} as const satisfies Record<string, Segment>;
