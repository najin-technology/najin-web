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
  return {
    title: titles[locale] || titles.ko,
    description: descriptions[locale] || descriptions.ko,
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  };
}
