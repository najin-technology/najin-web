import { supabase } from "@/lib/supabase";
import { SITE_URL as BASE_URL } from "@/lib/env";

export const revalidate = 3600;

function escapeXml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function imgUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

export async function GET() {
  const urls: string[] = [];

  if (supabase) {
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, title_ko, thumbnail_url, image_urls")
      .eq("is_published", true)
      .is("deleted_at", null);

    if (posts) {
      for (const p of posts) {
        const pageUrl = `${BASE_URL}/ko/posts/${p.slug}`;
        const images: string[] = [];
        if (p.thumbnail_url) images.push(p.thumbnail_url as string);
        if (Array.isArray(p.image_urls)) images.push(...(p.image_urls as string[]));
        const unique = [...new Set(images)];
        if (unique.length === 0) continue;
        urls.push(
          `<url>
    <loc>${pageUrl}</loc>
    ${unique
      .map(
        (img) => `<image:image>
      <image:loc>${escapeXml(imgUrl(img))}</image:loc>
      <image:title>${escapeXml(p.title_ko as string)}</image:title>
    </image:image>`
      )
      .join("\n    ")}
  </url>`
        );
      }
    }

    const { data: products } = await supabase
      .from("products")
      .select("id, name_ko, image_urls")
      .eq("is_active", true)
      .is("deleted_at", null);

    if (products) {
      for (const pr of products) {
        const pageUrl = `${BASE_URL}/ko/portfolio`;
        const images: string[] = Array.isArray(pr.image_urls) ? (pr.image_urls as string[]) : [];
        if (images.length === 0) continue;
        urls.push(
          `<url>
    <loc>${pageUrl}</loc>
    ${images
      .map(
        (img) => `<image:image>
      <image:loc>${escapeXml(imgUrl(img))}</image:loc>
      <image:title>${escapeXml(pr.name_ko as string)}</image:title>
    </image:image>`
      )
      .join("\n    ")}
  </url>`
        );
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${urls.join("\n  ")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
