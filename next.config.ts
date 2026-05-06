import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // 모바일 360 ~ 4K 디스플레이 커버
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // small assets (logo, icon, thumbnail)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 1년 캐시 (immutable optimized output)
    minimumCacheTTL: 31536000,
    qualities: [50, 75, 90],
  },
  turbopack: {
    resolveAlias: {
      // dxf-viewer 가 `import opentype from "opentype.js"` 로 default import 사용.
      // opentype.js 1.3.5 의 .mjs 는 named exports 만 제공 → Turbopack 빌드 에러.
      // .js (UMD) 는 default 포함이라 강제로 UMD 빌드 사용.
      "opentype.js": "opentype.js/dist/opentype.js",
    },
  },
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/icon" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: *.supabase.co; font-src 'self' https://fonts.gstatic.com; connect-src 'self' *.supabase.co https://va.vercel-scripts.com https://challenges.cloudflare.com https://nid.naver.com https://openapi.naver.com; frame-src 'self' https://maps.google.com https://challenges.cloudflare.com; frame-ancestors 'self'",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: *.supabase.co; font-src 'self'; connect-src 'self' *.supabase.co https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
