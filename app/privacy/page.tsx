import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { OG_IMAGE_PATH, SITE_NAME, SUPPORT_EMAIL, siteUrl } from "@/lib/site";

const title = `Privacy Policy · ${SITE_NAME}`;
const description = `How ${SITE_NAME} collects, stores, and protects your account, resume content, and payment information.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: siteUrl("/privacy") },
  openGraph: {
    type: "website",
    title,
    description,
    url: siteUrl("/privacy"),
    images: [{ url: siteUrl(OG_IMAGE_PATH), width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [siteUrl(OG_IMAGE_PATH)],
  },
};

export default function PrivacyPage() {
  return (
    <div className="board board-static">
      <section className="board-section board-about-hero" aria-labelledby="privacy-page-title">
        <div className="board-rail">
          <p className="board-kicker">Legal</p>
          <h1 id="privacy-page-title" className="board-heading">
            Privacy Policy
          </h1>
          <p className="board-lead is-narrow">
            Last updated: November 20, 2026. We keep only the data needed to build, save, and share your CV — and we never sell it.
          </p>
          <div className="board-about-acts">
            <Link href="/" className="board-pill board-pill-outline">
              <span className="board-pill-label">Back to home</span>
            </Link>
            <Link href="/terms" className="board-pill board-pill-outline">
              <span className="board-pill-label">Terms of use</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="board-section is-soft">
        <div className="board-rail board-legal-doc">
          <article className="board-legal-block">
            <h2>1. What we collect</h2>
            <p>
              When you use {SITE_NAME}, we store the resume content you enter (name, contact details, work history, education, skills,
              and optional job descriptions), plus your account email and name when you sign in. Before you sign in, drafts are tied
              to an anonymous browser key in your local storage.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>2. How we use your data</h2>
            <p>
              We use your data solely to render your CV preview, export PDFs, tailor copy when you request job matching, host your
              optional public link (<code>cvmatters.net/your-username</code>), and manage your subscription status. We do not sell,
              rent, or broker your personal data or resume content to third parties or recruiters.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>3. Public resume links</h2>
            <p>
              Your CV is private by default. If you choose a public username and turn on sharing from your profile, the selected CV
              becomes visible to anyone with that URL and may appear in the Examples gallery. You can turn sharing off or change your
              public CV at any time.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>4. Payments</h2>
            <p>
              Paid subscriptions are processed securely by Cashfree Payments. Card numbers, UPI IDs, and banking credentials are
              handled directly by Cashfree — {SITE_NAME} never sees or stores your full payment details. We keep only order IDs,
              plan status, and payment confirmation timestamps so your account stays unlocked.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>5. Cookies and local storage</h2>
            <p>
              We use browser local storage and session storage to keep you signed in, remember your active draft, and refresh
              subscription status after checkout. We do not use third-party advertising trackers.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>6. Access, export, and deletion</h2>
            <p>
              You own the content you write. You can delete individual CVs from your profile at any time, or email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> (or use our <Link href="/contact">contact form</Link>) to
              request a copy of your data or permanent deletion of your account.
            </p>
          </article>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
