import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "나진테크 | NAJIN TECHNOLOGY",
    short_name: "나진테크",
    description:
      "경남 양산 우레탄 성형, 합성수지 가공, CNC 정밀가공, 금형 제작 전문기업",
    start_url: "/ko",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1B2A4A",
    lang: "ko-KR",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
