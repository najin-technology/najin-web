import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// edge runtime 을 쓰면 정적 생성이 꺼진다(빌드 경고). 이 이미지는 완전 정적이라
// 기본 Node 런타임 + 빌드 타임 생성이 맞다.
export const alt = "나진테크 | NAJIN TECHNOLOGY";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/og 가 번들하는 폰트는 Geist-Regular 하나뿐이고 한글 글리프가 0개다.
// 폰트를 넘기지 않으면 아래 한글 문구가 전부 두부(□)로 렌더된다.
// 실제 사용 글자만 담은 Noto Sans KR 서브셋(각 ~10KB)을 public/fonts 에 동봉해 쓴다.
// (fetch(new URL(..., import.meta.url)) 패턴은 Turbopack Node 런타임에서
//  /_next/static/media/... 상대경로로 해석돼 ERR_INVALID_URL 이 난다 → fs 로 읽는다.)
const loadFont = (file: string) =>
  readFile(path.join(process.cwd(), "public", "fonts", file));

export default async function Image() {
  const [regular, bold] = await Promise.all([
    loadFont("og-noto-kr-400.ttf"),
    loadFont("og-noto-kr-700.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1B2A4A 0%, #0F1A30 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#B87333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            N
          </div>
          <span style={{ color: "#B87333", fontSize: "24px", fontWeight: 600 }}>
            NAJIN TECHNOLOGY
          </span>
        </div>
        <div
          style={{
            fontSize: "52px",
            fontWeight: "bold",
            color: "white",
            lineHeight: 1.2,
            marginBottom: "24px",
          }}
        >
          25년 전통의 정밀 가공 전문기업
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "40px",
          }}
        >
          우레탄 성형 · 합성수지 가공 · CNC 정밀가공 · 금형 제작 · EV 부품
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span>ISO 9001</span>
          <span>·</span>
          <span>특허 보유</span>
          <span>·</span>
          <span>국내외 주요 산업 고객사 납품</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans KR", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans KR", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}
