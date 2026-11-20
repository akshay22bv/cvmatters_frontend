import type { MetadataRoute } from "next";
import { fetchBlogPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await fetchBlogPosts();
  return [
    {
      url: siteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: siteUrl("/examples"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: siteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: siteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: siteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: siteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: siteUrl("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    ...posts.map((post) => ({
      url: siteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt || post.publishedAt || now),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
