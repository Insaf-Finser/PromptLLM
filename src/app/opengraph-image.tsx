import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: -1 }}>
          PromptDesk
        </div>
        <div style={{ fontSize: 28, color: "#a3a3a3", marginTop: 16 }}>
          Version and eval-test your LLM prompts
        </div>
      </div>
    ),
    { ...size }
  );
}
