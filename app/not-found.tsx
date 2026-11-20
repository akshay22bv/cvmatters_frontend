import Link from "next/link";
import { Logo } from "@/components/icons";
import { SITE_NAME } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="billing-return">
      <div className="billing-return-card">
        <Link href="/" className="billing-return-brand" aria-label={`${SITE_NAME} home`}>
          <Logo />
          <span>
            <b>CV</b> Matters
          </span>
        </Link>
        <p className="billing-return-kicker">404</p>
        <h1 className="billing-return-title">Page not found</h1>
        <p className="billing-return-lead">
          That link doesn&apos;t match a page or public resume on {SITE_NAME}. It may have been moved or set to private.
        </p>
        <Link className="btn-cta" href="/">
          Back to home
        </Link>
        <Link className="btn-quiet" href="/cv/details">
          Open CV editor
        </Link>
      </div>
    </main>
  );
}
