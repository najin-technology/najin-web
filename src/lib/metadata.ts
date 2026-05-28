import { SITE_URL as BASE_URL } from "@/lib/env";

const LOCALES = ["ko", "en", "zh"] as const;

export function createPageMetadata({
  locale,
  path,
  titles,
  descriptions,
  noindex = false,
}: {
  locale: string;
  path: string;
  titles: Record<string, string>;
  descriptions: Record<string, string>;
  noindex?: boolean;
}) {
  const title = titles[locale] || titles.ko;
  const description = descriptions[locale] || descriptions.ko;
  const ogUrl = `${BASE_URL}/${locale}${path}`;
  const ogImage = `${BASE_URL}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: ogUrl,
      languages: {
        ...Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
        ),
        "x-default": `${BASE_URL}/ko${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: ogUrl,
      siteName: "나진테크 | NAJIN TECHNOLOGY",
      locale: locale === "ko" ? "ko_KR" : locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "나진테크 | NAJIN TECHNOLOGY",
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
