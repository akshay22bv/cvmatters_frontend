/** Public site URL for canonical links, Open Graph, and sitemaps. */
export const SITE_NAME = "CV Matters";

export const SITE_TAGLINE = "Build a resume, match a job post, and learn from people in your field.";

/** Primary support inbox — shown on Contact and in the footer. */
export const SUPPORT_EMAIL = "developer28tester@gmail.com";

/** Default Open Graph / Twitter share image route. */
export const OG_IMAGE_PATH = "/opengraph-image";

export const DEFAULT_DESCRIPTION =
  "Free resume builder with live preview and ATS templates. Tailor your CV to a job post, browse field examples, and share a link or PDF.";

export const SITE_KEYWORDS = [
  "resume builder",
  "CV builder",
  "ATS resume",
  "job-tailored resume",
  "resume templates",
  "cover letter",
  "curriculum vitae",
  "PDF resume",
  "online resume",
  "shareable resume",
  "online CV",
  "digital resume",
  "shareable CV link",
  "personal resume website",
];

function normalizeBase(url: string) {
  return url.replace(/\/+$/, "");
}

export function siteUrl(path = "/") {
  const base = normalizeBase(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://cvmatters.net");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
