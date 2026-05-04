import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1B2A4A 0%, #0F1A30 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "32px",
        }}
      >
        <div
          style={{
            color: "#B87333",
            fontSize: "120px",
            fontWeight: 800,
            fontFamily: "sans-serif",
            letterSpacing: "-4px",
          }}
        >
          N
        </div>
      </div>
    ),
    { ...size }
  );
}
