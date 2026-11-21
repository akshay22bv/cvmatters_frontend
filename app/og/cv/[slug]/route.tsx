import { ImageResponse } from "next/og";
import {
  collectPublicSkills,
  firstExperienceLine,
  hasPublicResumeContent,
  safeOgHexColor,
  type PublicResumeDataLike,
} from "@/lib/publicResume";
import { SITE_NAME, siteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PublicResumeApi = {
  slug?: string;
  data?: PublicResumeDataLike;
};

function initialsFrom(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "CV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function clampText(raw: string, max: number): string {
  const clean = raw.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${trimmed.replace(/[,;:\-–—]+$/, "").trimEnd()}…`;
}

function accentForCard(raw?: string): string {
  const hex = safeOgHexColor(raw);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Avoid near-black or near-white accents blending into the dark frame or white card.
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness < 38 || brightness > 215) return "#10a37f";
  return hex;
}

async function resolveSafePhoto(photoUrl?: string): Promise<string | null> {
  const raw = (photoUrl || "").trim();
  if (!raw) return null;
  if (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(raw) && raw.length < 2_500_000) {
    return raw;
  }
  if (/^https?:\/\//i.test(raw)) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(raw, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      if (!/^image\/(png|jpe?g|gif|webp)$/.test(contentType)) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength === 0 || buf.byteLength > 2_000_000) return null;
      return `data:${contentType};base64,${buf.toString("base64")}`;
    } catch {
      return null;
    }
  }
  return null;
}

function fallbackCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 68px",
          background: "#0a0c10",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: "#10a37f",
            }}
          />
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{SITE_NAME}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 58, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08 }}>
            Online resumes that look great everywhere.
          </div>
          <div style={{ fontSize: 24, color: "#94a3b8" }}>
            Live preview, ATS-friendly templates, and one clean link to share.
          </div>
        </div>
        <div style={{ fontSize: 20, color: "#64748b" }}>{siteUrl("/").replace(/^https?:\/\//, "").replace(/\/+$/, "")}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=300, s-maxage=600" },
    },
  );
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const origin = process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000";

  let record: PublicResumeApi | null = null;
  try {
    const res = await fetch(`${origin}/api/resumes/${encodeURIComponent(slug)}/public`, {
      cache: "no-store",
    });
    if (res.ok) {
      record = (await res.json()) as PublicResumeApi;
    }
  } catch {
    record = null;
  }

  if (!record?.data || !hasPublicResumeContent(record.data)) {
    return fallbackCard();
  }

  const data = record.data;
  const name = clampText(data.personal?.fullName?.trim() || slug, 44);
  const role = clampText(data.personal?.title?.trim() || "", 64);
  const location = clampText(data.personal?.location?.trim() || "", 42);
  const summaryRaw = (data.summary || "").trim().replace(/\s+/g, " ");
  const expLine = firstExperienceLine(data);
  const excerpt = clampText(summaryRaw || (expLine ? `Currently ${expLine}` : ""), 175);
  const skills = collectPublicSkills(data, 5);
  const accent = accentForCard(data.accent);
  const photo = await resolveSafePhoto(data.personal?.photoUrl);
  const initials = initialsFrom(name);
  const host = siteUrl("/").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const displayUrl = `${host}/${record.slug || slug}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 36,
          background: "#0b0d11",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#ffffff",
            borderRadius: 28,
            overflow: "hidden",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Accent top bar */}
          <div style={{ width: "100%", height: 10, background: accent, display: "flex" }} />

          {/* Main content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "42px 54px 36px",
            }}
          >
            {/* Identity row */}
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  width={122}
                  height={122}
                  style={{
                    width: 122,
                    height: 122,
                    borderRadius: 24,
                    objectFit: "cover",
                    border: "2px solid #e2e8f0",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 112,
                    height: 112,
                    borderRadius: 24,
                    background: `${accent}1a`,
                    border: `2px solid ${accent}40`,
                    color: accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 42,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {initials}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 700,
                    color: "#0f172a",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.08,
                  }}
                >
                  {name}
                </div>
                {role ? (
                  <div
                    style={{
                      fontSize: 27,
                      fontWeight: 500,
                      color: "#334155",
                      lineHeight: 1.25,
                    }}
                  >
                    {role}
                  </div>
                ) : null}
                {location ? (
                  <div style={{ fontSize: 19, color: "#64748b", marginTop: 2 }}>{location}</div>
                ) : null}
              </div>
            </div>

            {/* Summary / latest role */}
            {excerpt ? (
              <div
                style={{
                  fontSize: 22,
                  color: "#475569",
                  lineHeight: 1.48,
                  marginTop: 12,
                }}
              >
                {excerpt}
              </div>
            ) : null}

            {/* Skills */}
            {skills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                {skills.map((skill) => (
                  <div
                    key={skill}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      color: "#1e293b",
                      fontSize: 18,
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Footer bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 22,
                borderTop: "1px solid #e2e8f0",
                marginTop: 12,
              }}
            >
              <div style={{ fontSize: 20, color: "#64748b", fontWeight: 500 }}>{displayUrl}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "#10a37f",
                  }}
                />
                <span>{SITE_NAME}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
      },
    },
  );
}
