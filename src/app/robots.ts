import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "Yeti", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "Naverbot", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "Daum", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap-images.xml`,
    ],
  };
}
