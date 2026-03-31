import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://najin-webapp.vercel.app";
const locales = ["ko", "en", "zh"];

function withAlternates(route: string) {
  return {
    languages: Object.fromEntries(
      locales.map((l) => [l, `${BASE_URL}/${l}${route}`])
    ),
  };
}

const routePriorities: Record<string, number> = {
  "": 1.0,
  "/about": 0.9,
  "/business": 0.9,
  "/portfolio": 0.9,
  "/quote": 0.8,
  "/faq": 0.8,
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
      .select("id, updated_at")
      .eq("is_published", true)
      .is("deleted_at", null);

    if (notices) {
      noticeEntries = notices.flatMap((notice) =>
        locales.map((locale) => ({
          url: `${BASE_URL}/${locale}/notices/${notice.id}`,
          lastModified: new Date(notice.updated_at),
          changeFrequency: "monthly" as const,
          priority: 0.5,
          alternates: withAlternates(`/notices/${notice.id}`),
        }))
      );
    }
  } catch {
    // skip dynamic entries on error
  }

  return [...staticEntries, ...noticeEntries];
}
