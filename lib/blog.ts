import { siteUrl } from "./site";

export type BlogPostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  keyword: string;
  coverImage: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogPost = BlogPostListItem & {
  body: string;
  html: string;
};

function apiOrigin() {
  return process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000";
}

export async function fetchBlogPosts(): Promise<BlogPostListItem[]> {
  try {
    const response = await fetch(`${apiOrigin()}/api/blog`, { next: { revalidate: 120 } });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload.posts) ? payload.posts : [];
  } catch {
    return [];
  }
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`${apiOrigin()}/api/blog/${encodeURIComponent(slug)}`, {
      next: { revalidate: 120 },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.post || null;
  } catch {
    return null;
  }
}

export function blogPath(slug?: string) {
  return slug ? `/blog/${slug}` : "/blog";
}

export function blogAbsoluteUrl(slug?: string) {
  return siteUrl(blogPath(slug));
}

export function formatBlogDate(value: string | null | undefined) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
