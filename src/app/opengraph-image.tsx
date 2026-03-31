import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "나진테크 | NAJIN TECHNOLOGY";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          fontFamily: "sans-serif",
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
          <span>현대자동차 · SK · GM Shanghai 납품</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
