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

export async function GET() {
  const items: string[] = [];

  if (supabase) {
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, title_ko, excerpt_ko, thumbnail_url, original_date, published_at, created_at, updated_at")
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("original_date", { ascending: false })
      .limit(30);

    if (posts) {
      for (const p of posts) {
        const url = `${BASE_URL}/ko/posts/${p.slug}`;
        const date = new Date(p.original_date || p.published_at || p.created_at).toUTCString();
        const thumb = p.thumbnail_url ? `${BASE_URL}${p.thumbnail_url}` : `${BASE_URL}/images/logo/najin-logo.png`;
        items.push(
          `<item>
      <title>${escapeXml(p.title_ko as string)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(p.excerpt_ko as string)}</description>
      <enclosure url="${escapeXml(thumb)}" type="image/jpeg" />
      <category>제작사례</category>
    </item>`
        );
      }
    }

    const { data: notices } = await supabase
      .from("notices")
      .select("id, title_ko, content_ko, published_at, created_at, updated_at")
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("published_at", { ascending: false })
      .limit(20);

    if (notices) {
      for (const n of notices) {
        const url = `${BASE_URL}/ko/notices/${n.id}`;
        const date = new Date((n.published_at as string) || (n.created_at as string)).toUTCString();
        const desc = ((n.content_ko as string) || "").replace(/<[^>]*>/g, "").slice(0, 280);
        items.push(
          `<item>
      <title>${escapeXml(n.title_ko as string)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(desc)}</description>
      <category>회사소식</category>
    </item>`
        );
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>나진테크 — NAJIN TECHNOLOGY</title>
    <link>${BASE_URL}/ko</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>경남 양산 우레탄 성형, 합성수지 가공, CNC 정밀가공, 금형 제작 전문기업 나진테크의 제작사례와 회사소식.</description>
    <language>ko-KR</language>
    <copyright>© ${new Date().getFullYear()} 나진테크. All rights reserved.</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Next.js</generator>
    ${items.join("\n    ")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
