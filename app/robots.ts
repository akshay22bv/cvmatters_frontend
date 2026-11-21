import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/examples", "/blog", "/about", "/contact", "/privacy", "/terms", "/og/"],
        disallow: ["/cv/", "/start", "/profile", "/auth/", "/billing/", "/backend/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
