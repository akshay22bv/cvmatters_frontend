import type { Metadata } from "next";
import Link from "next/link";
import { blogAbsoluteUrl, blogPath, fetchBlogPosts, formatBlogDate } from "@/lib/blog";
import { DEFAULT_DESCRIPTION, OG_IMAGE_PATH, SITE_KEYWORDS, SITE_NAME, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resume & online CV guides",
  description:
    "Practical guides on online resumes, shareable CV links, LinkedIn sharing, and personal resume websites — from the CV Matters team.",
  keywords: [
    ...SITE_KEYWORDS,
    "online resume",
    "shareable resume",
    "online CV",
    "digital resume",
    "share CV on LinkedIn",
  ],
  alternates: { canonical: blogAbsoluteUrl() },
  openGraph: {
    title: `Resume & online CV guides · ${SITE_NAME}`,
    description: "Guides for shareable resumes, online CVs, and recruiter-ready links.",
    url: blogAbsoluteUrl(),
    type: "website",
    images: [{ url: siteUrl(OG_IMAGE_PATH), width: 1200, height: 630, alt: `${SITE_NAME} Blog` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Resume & online CV guides · ${SITE_NAME}`,
    description: "Guides for shareable resumes, online CVs, and recruiter-ready links.",
    images: [siteUrl(OG_IMAGE_PATH)],
  },
};

export default async function BlogIndexPage() {
  const posts = await fetchBlogPosts();

  return (
    <main className="blog-main">
      <section className="blog-hero board-rail">
        <p className="board-kicker">Blog</p>
        <h1 className="blog-hero-title">Guides for shareable resumes and online CVs</h1>
        <p className="blog-hero-lead">
          Practical SEO-friendly articles on online resumes, shareable links, LinkedIn, and personal CV websites — built around how{" "}
          {SITE_NAME} actually works.
        </p>
        <Link href="/cv/details" className="board-pill board-pill-primary blog-hero-cta">
          <span className="board-pill-label">Create your online resume</span>
        </Link>
      </section>

      <section className="board-rail blog-grid" aria-label="All posts">
        {posts.length === 0 ? (
          <p className="blog-empty">Posts are publishing soon. Check back shortly.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="blog-card">
              <Link href={blogPath(post.slug)} className="blog-card-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.coverImage || "/blog/online-resume.svg"} alt="" width={640} height={360} />
              </Link>
              <div className="blog-card-body">
                {post.keyword ? <p className="blog-card-keyword">{post.keyword}</p> : null}
                <h2 className="blog-card-title">
                  <Link href={blogPath(post.slug)}>{post.title}</Link>
                </h2>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-meta">
                  <time dateTime={post.publishedAt || post.createdAt}>
                    {formatBlogDate(post.publishedAt || post.createdAt)}
                  </time>
                  <Link href={blogPath(post.slug)} className="blog-card-more">
                    Read guide
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `${SITE_NAME} Blog`,
            description: DEFAULT_DESCRIPTION,
            url: blogAbsoluteUrl(),
            publisher: { "@type": "Organization", name: SITE_NAME, url: siteUrl("/") },
            blogPost: posts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              datePublished: post.publishedAt || post.createdAt,
              url: blogAbsoluteUrl(post.slug),
              keywords: post.keyword,
            })),
          }),
        }}
      />
    </main>
  );
}
