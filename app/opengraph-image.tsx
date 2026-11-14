import { readFile } from "fs/promises";
import { join } from "path";
import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const mark = await readFile(join(process.cwd(), "public", "logo-mark.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 72px",
          background: "#0b0f14",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <img src={markSrc} width={120} height={120} alt="" style={{ marginBottom: 28 }} />
        <div style={{ fontSize: 26, fontWeight: 600, color: "#34d399", marginBottom: 14 }}>Resume builder</div>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>{SITE_NAME}</div>
        <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.35, maxWidth: 920, color: "rgba(255,255,255,0.88)" }}>
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size },
  );
}
