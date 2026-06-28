import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ARAGAL — Mario Aravena | Compositor y Productor Musical";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
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
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          color: "#fcfaf0",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Gold glow */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
          }}
        />
        {/* Title */}
        <div
          style={{
            fontSize: 180,
            fontWeight: 800,
            letterSpacing: 12,
            background: "linear-gradient(135deg, #d4af37 0%, #fcfaf0 50%, #b8860b 100%)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 20,
          }}
        >
          ARAGAL
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: "#a0a0a0",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Mario Aravena · Compositor & Productor
        </div>
        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: "#d4af37",
            marginTop: 24,
            letterSpacing: 2,
          }}
        >
          Son cubano · Música espiritual · Raíz latina
        </div>
      </div>
    ),
    size
  );
}
