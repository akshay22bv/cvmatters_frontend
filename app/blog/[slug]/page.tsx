import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogAbsoluteUrl, blogPath, fetchBlogPost, fetchBlogPosts, formatBlogDate } from "@/lib/blog";
import { SITE_KEYWORDS, SITE_NAME, siteUrl } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await fetchBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "Post not found" };
  const url = blogAbsoluteUrl(post.slug);
  const description = post.excerpt || post.title;
  // WhatsApp, LinkedIn, and X ignore SVG og:images — serve a 1200x630 PNG card for SVG/missing covers.
  const isRasterCover = /\.(png|jpe?g|webp)(\?.*)?$/i.test(post.coverImage || "");
  const ogImageUrl = isRasterCover
    ? siteUrl(post.coverImage)
    : siteUrl(`/og/blog/${encodeURIComponent(post.slug)}`);
  return {
    title: post.title,
    description,
    keywords: [post.keyword, ...SITE_KEYWORDS].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  const allPosts = await fetchBlogPosts();
  const currentIndex = allPosts.findIndex((item) => item.slug === post.slug);
  // Posts are ordered newest-first: previous = older (index + 1), next = newer (index - 1).
  const prevPost = currentIndex >= 0 && currentIndex + 1 < allPosts.length ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const others = allPosts
    .filter((item) => item.slug !== post.slug && item.slug !== prevPost?.slug && item.slug !== nextPost?.slug)
    .slice(0, 3);

  return (
    <main className="blog-main">
      <article className="board-rail blog-article">
        <header className="blog-article-head">
          <p className="board-kicker">
            <Link href="/blog">Blog</Link>
            {post.keyword ? <> · {post.keyword}</> : null}
          </p>
          <h1 className="blog-article-title">{post.title}</h1>
          <p className="blog-article-excerpt">{post.excerpt}</p>
          <time className="blog-article-date" dateTime={post.publishedAt || post.createdAt}>
            {formatBlogDate(post.publishedAt || post.createdAt)}
          </time>
        </header>

        <div className="blog-article-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage || "/blog/online-resume.svg"} alt={post.title} width={1200} height={675} />
        </div>

        <div className="blog-prose" dangerouslySetInnerHTML={{ __html: post.html }} />

        <aside className="blog-cta-box">
          <h2>Build a shareable CV on {SITE_NAME}</h2>
          <p>Create an online resume, publish a public link, and download a PDF when portals need a file.</p>
          <Link href="/cv/details" className="board-pill board-pill-primary">
            <span className="board-pill-label">Start your CV</span>
          </Link>
        </aside>

        {prevPost || nextPost ? (
          <nav className="blog-pager" aria-label="Previous and next guides">
            {prevPost ? (
              <Link href={blogPath(prevPost.slug)} className="blog-pager-card">
                <span className="blog-pager-label">← Previous guide</span>
                <strong>{prevPost.title}</strong>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {nextPost ? (
              <Link href={blogPath(nextPost.slug)} className="blog-pager-card is-next">
                <span className="blog-pager-label">Next guide →</span>
                <strong>{nextPost.title}</strong>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>
        ) : null}
      </article>

      {others.length ? (
        <section className="board-rail blog-more" aria-label="More guides">
          <h2>More guides</h2>
          <ul>
            {others.map((item) => (
              <li key={item.id}>
                <Link href={blogPath(item.slug)}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt || post.createdAt,
            dateModified: post.updatedAt,
            mainEntityOfPage: blogAbsoluteUrl(post.slug),
            image: post.coverImage ? siteUrl(post.coverImage) : undefined,
            keywords: post.keyword,
            author: { "@type": "Organization", name: SITE_NAME },
            publisher: { "@type": "Organization", name: SITE_NAME, url: siteUrl("/") },
          }),
        }}
      />
    </main>
  );
}
