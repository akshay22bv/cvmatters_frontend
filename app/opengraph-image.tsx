import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #0d9488 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600, opacity: 0.85, marginBottom: 16 }}>Resume builder</div>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>{SITE_NAME}</div>
        <div style={{ marginTop: 28, fontSize: 32, lineHeight: 1.35, maxWidth: 900, opacity: 0.92 }}>{SITE_TAGLINE}</div>
      </div>
    ),
    { ...size },
  );
}
