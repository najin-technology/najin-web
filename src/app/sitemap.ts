import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://najin-webapp.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["ko", "en"];
  const staticRoutes = [
    "",
    "/about",
    "/business",
    "/portfolio",
    "/quote",
    "/careers",
    "/notices",
    "/privacy",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.8,
    }))
  );

  // Dynamic notice pages
  let noticeEntries: MetadataRoute.Sitemap = [];
  try {
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
          priority: 0.6,
        }))
      );
    }
  } catch {
    // skip dynamic entries on error
  }

  return [...staticEntries, ...noticeEntries];
}
