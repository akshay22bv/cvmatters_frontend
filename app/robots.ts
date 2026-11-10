import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/examples", "/about", "/contact"],
        disallow: ["/cv/", "/profile", "/auth/", "/backend/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
