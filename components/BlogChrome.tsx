import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { Logo } from "./icons";
import { SiteFooter } from "./SiteFooter";

export function BlogChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="board board-static blog-shell">
      <header className="blog-top">
        <div className="board-rail blog-top-inner">
          <Link href="/" className="blog-brand" aria-label={`${SITE_NAME} home`}>
            <Logo />
            <span>{SITE_NAME}</span>
          </Link>
          <nav className="blog-top-nav" aria-label="Blog">
            <Link href="/pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/examples">Examples</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/cv/details" className="blog-top-cta">
              Build your CV
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <SiteFooter />
    </div>
  );
}
