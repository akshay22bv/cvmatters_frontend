import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hide the floating Next.js "N" badge so it does not sit on the builder bar.
  devIndicators: false,
  outputFileTracingRoot: path.join(__dirname, ".."),
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://127.0.0.1:4000/:path*",
      },
    ];
  },
};

export default nextConfig;
