import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5b4be6 0%, #4636c9 100%)",
          color: "#ffffff",
          fontSize: 116,
          fontWeight: 800,
          fontFamily: "sans-serif",
          borderRadius: 40,
        }}
      >
        E
      </div>
    ),
    size
  );
}
