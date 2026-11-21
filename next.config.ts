import type { NextConfig } from "next";

const apiOrigin = process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000";
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://sdk.cashfree.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://api.cashfree.com https://sandbox.cashfree.com https://sdk.cashfree.com",
  "frame-src 'self' https://sdk.cashfree.com https://payments.cashfree.com https://sandbox.cashfree.com https://api.cashfree.com",
  "form-action 'self' https://payments.cashfree.com https://sandbox.cashfree.com https://api.cashfree.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hide the floating Next.js "N" badge so it does not sit on the builder bar.
  devIndicators: false,
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  // Vercel file tracing only follows JS imports — ship chromium.br + al2023.tar.br for PDF.
  outputFileTracingIncludes: {
    "/api/resumes/pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  async headers() {
    const immutableAsset = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    const swrPage = [{ key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" }];
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      { source: "/about", headers: swrPage },
      { source: "/contact", headers: swrPage },
      { source: "/pricing", headers: swrPage },
      { source: "/privacy", headers: swrPage },
      { source: "/terms", headers: swrPage },
      { source: "/blog", headers: swrPage },
      { source: "/blog/:slug", headers: swrPage },
      // Keep immutable static asset rules after page rules so /blog/*.svg wins over /blog/:slug.
      { source: "/blog/:file(.+\\.svg)", headers: immutableAsset },
      { source: "/:file(icon[^/]*\\.png|apple-icon\\.png|logo[^/]*|favicon\\.ico)", headers: immutableAsset },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
