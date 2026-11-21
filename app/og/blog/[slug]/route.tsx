import { ImageResponse } from "next/og";
import { fetchBlogPost, formatBlogDate } from "@/lib/blog";
import { SITE_NAME, siteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clampText(raw: string, max: number): string {
  const clean = raw.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${trimmed.replace(/[,;:\-–—]+$/, "").trimEnd()}…`;
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const post = await fetchBlogPost(slug);

  const title = clampText(post?.title || "Resume & online CV guides", 86);
  const excerpt = clampText(
    post?.excerpt || "Practical guides on online resumes, shareable CV links, and recruiter-ready layouts.",
    165,
  );
  const keyword = clampText(post?.keyword || "Career guide", 36);
  const dateLabel = formatBlogDate(post?.publishedAt || post?.createdAt);
  const host = siteUrl("/").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const displayUrl = post ? `${host}/blog/${post.slug}` : `${host}/blog`;
  const titleFontSize = title.length > 62 ? 44 : title.length > 42 ? 50 : 56;

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
          {/* Top emerald strip */}
          <div style={{ width: "100%", height: 10, background: "#10a37f", display: "flex" }} />

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "42px 56px 38px",
            }}
          >
            {/* Header pills */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    padding: "7px 16px",
                    borderRadius: 999,
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    color: "#065f46",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {`${SITE_NAME} Blog`}
                </div>
                {keyword ? (
                  <div
                    style={{
                      padding: "7px 16px",
                      borderRadius: 999,
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      color: "#334155",
                      fontSize: 17,
                      fontWeight: 500,
                    }}
                  >
                    {keyword}
                  </div>
                ) : null}
              </div>
              {dateLabel ? <div style={{ fontSize: 18, color: "#64748b" }}>{dateLabel}</div> : null}
            </div>

            {/* Article title & excerpt */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  fontSize: titleFontSize,
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.12,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 23,
                  color: "#475569",
                  lineHeight: 1.46,
                }}
              >
                {excerpt}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 22,
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: 19, color: "#64748b", fontWeight: 500 }}>{displayUrl}</div>
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
        "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
