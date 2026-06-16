import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL as BASE_URL } from "@/lib/env";

const locales = ["ko", "en", "zh"];

// 색인 가능한 언어만 hreflang/sitemap에 포함한다.
// 번역 없는 언어는 페이지에서 noindex 처리되므로, sitemap에 넣으면
// GSC "제출된 URL이 noindex로 표시됨" 에러가 난다 → ko는 항상, en/zh는 번역 있을 때만.
function langsFor(hasEn: boolean, hasZh: boolean): string[] {
  return ["ko", ...(hasEn ? ["en"] : []), ...(hasZh ? ["zh"] : [])];
}

function withAlternates(route: string, langs: string[] = locales) {
  return {
    languages: {
      ...Object.fromEntries(langs.map((l) => [l, `${BASE_URL}/${l}${route}`])),
      "x-default": `${BASE_URL}/ko${route}`,
    },
  };
}

const routePriorities: Record<string, number> = {
  "": 1.0,
  "/about": 0.9,
  "/business": 0.9,
  "/portfolio": 0.9,
  "/quote": 0.8,
  "/faq": 0.8,
  "/posts": 0.7,
  "/careers": 0.6,
  "/notices": 0.6,
  "/privacy": 0.3,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = Object.keys(routePriorities);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: routePriorities[route] ?? 0.5,
      alternates: withAlternates(route),
    }))
  );

  // Dynamic notice pages
  let noticeEntries: MetadataRoute.Sitemap = [];
  try {
    if (!supabase) throw new Error("Supabase not configured");
    const { data: notices } = await supabase
      .from("notices")
      .select("id, updated_at, title_en")
      .eq("is_published", true)
      .is("deleted_at", null);

    if (notices) {
      noticeEntries = notices.flatMap((notice) => {
        // notices엔 title_zh 컬럼이 없어 zh는 항상 noindex → 제외.
        const langs = langsFor(Boolean(notice.title_en), false);
        const route = `/notices/${notice.id}`;
        return langs.map((locale) => ({
          url: `${BASE_URL}/${locale}${route}`,
          lastModified: new Date(notice.updated_at),
          changeFrequency: "monthly" as const,
          priority: 0.5,
          alternates: withAlternates(route, langs),
        }));
      });
    }
  } catch (err) {
    console.error("[sitemap] notices fetch failed:", err);
  }

  // Dynamic post pages
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    if (!supabase) throw new Error("Supabase not configured");
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at, title_en, title_zh")
      .eq("is_published", true)
      .is("deleted_at", null);

    if (posts) {
      postEntries = posts.flatMap((post) => {
        const langs = langsFor(Boolean(post.title_en), Boolean(post.title_zh));
        const route = `/posts/${post.slug}`;
        return langs.map((locale) => ({
          url: `${BASE_URL}/${locale}${route}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: "monthly" as const,
          priority: 0.6,
          alternates: withAlternates(route, langs),
        }));
      });
    }
  } catch (err) {
    console.error("[sitemap] posts fetch failed:", err);
  }

  // Dynamic client pages (/clients/[slug])
  let clientEntries: MetadataRoute.Sitemap = [];
  try {
    if (!supabase) throw new Error("Supabase not configured");
    const { data: clients } = await supabase
      .from("customers")
      .select("client_slug, updated_at")
      .not("client_slug", "is", null)
      .is("deleted_at", null);

    if (clients) {
      clientEntries = clients
        .filter((c) => c.client_slug)
        .flatMap((client) =>
          locales.map((locale) => ({
            url: `${BASE_URL}/${locale}/clients/${client.client_slug}`,
            lastModified: client.updated_at ? new Date(client.updated_at as string) : new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
            alternates: withAlternates(`/clients/${client.client_slug}`),
          }))
        );
    }
  } catch (err) {
    console.error("[sitemap] clients fetch failed:", err);
  }

  return [...staticEntries, ...noticeEntries, ...postEntries, ...clientEntries];
}
