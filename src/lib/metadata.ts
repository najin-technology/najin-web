const BASE_URL = "https://najin-webapp.vercel.app";
const LOCALES = ["ko", "en", "zh"] as const;

export function createPageMetadata({
  locale,
  path,
  titles,
  descriptions,
}: {
  locale: string;
  path: string;
  titles: Record<string, string>;
  descriptions: Record<string, string>;
}) {
  const title = titles[locale] || titles.ko;
  const description = descriptions[locale] || descriptions.ko;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}${path}`,
      siteName: "나진테크 | NAJIN TECHNOLOGY",
      locale: locale === "ko" ? "ko_KR" : locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      images: [
        {
          url: `${BASE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "나진테크 | NAJIN TECHNOLOGY",
        },
      ],
    },
  };
}
