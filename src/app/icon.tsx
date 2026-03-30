import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Left half - blue */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "50%",
            height: "100%",
            background: "#00428B",
          }}
        />
        {/* Right half - dark */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "50%",
            height: "100%",
            background: "#1B2A4A",
          }}
        />
        {/* White center accent */}
        <div
          style={{
            position: "absolute",
            width: 3,
            height: "70%",
            background: "#FFFFFF",
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
