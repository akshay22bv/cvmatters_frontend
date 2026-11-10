import type { NextConfig } from "next";

const apiOrigin = process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hide the floating Next.js "N" badge so it does not sit on the builder bar.
  devIndicators: false,
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
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
