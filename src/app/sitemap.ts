import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL as BASE_URL } from "@/lib/env";

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

  // Dynamic post pages
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    if (!supabase) throw new Error("Supabase not configured");
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("is_published", true)
      .is("deleted_at", null);

    if (posts) {
      postEntries = posts.flatMap((post) =>
        locales.map((locale) => ({
          url: `${BASE_URL}/${locale}/posts/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: "monthly" as const,
          priority: 0.6,
          alternates: withAlternates(`/posts/${post.slug}`),
        }))
      );
    }
  } catch {
    // skip dynamic entries on error
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
  } catch {
    // skip dynamic entries on error
  }

  return [...staticEntries, ...noticeEntries, ...postEntries, ...clientEntries];
}
