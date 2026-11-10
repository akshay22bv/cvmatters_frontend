/** Public site URL for canonical links, Open Graph, and sitemaps. */
export const SITE_NAME = "CV Matters";

export const SITE_TAGLINE = "Build a resume, match a job post, and learn from people in your field.";

/** Primary support inbox — shown on Contact and in the footer. */
export const SUPPORT_EMAIL = "developer28tester@gmail.com";

export const DEFAULT_DESCRIPTION =
  "Free resume builder with live preview and ATS-friendly templates. Paste a job description to tailor your CV, browse resumes in your field, and export a PDF.";

export const SITE_KEYWORDS = [
  "resume builder",
  "CV builder",
  "ATS resume",
  "job-tailored resume",
  "resume templates",
  "cover letter",
  "curriculum vitae",
  "PDF resume",
];

function normalizeBase(url: string) {
  return url.replace(/\/+$/, "");
}

export function siteUrl(path = "/") {
  const base = normalizeBase(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://cvmatters.com");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
