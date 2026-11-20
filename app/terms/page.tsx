import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { OG_IMAGE_PATH, SITE_NAME, SUPPORT_EMAIL, siteUrl } from "@/lib/site";

const title = `Terms of Use · ${SITE_NAME}`;
const description = `Terms governing use of ${SITE_NAME}, resume ownership, subscriptions, billing in INR via Cashfree, and refunds.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: siteUrl("/terms") },
  openGraph: {
    type: "website",
    title,
    description,
    url: siteUrl("/terms"),
    images: [{ url: siteUrl(OG_IMAGE_PATH), width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [siteUrl(OG_IMAGE_PATH)],
  },
};

export default function TermsPage() {
  return (
    <div className="board board-static">
      <section className="board-section board-about-hero" aria-labelledby="terms-page-title">
        <div className="board-rail">
          <p className="board-kicker">Legal</p>
          <h1 id="terms-page-title" className="board-heading">
            Terms of Use
          </h1>
          <p className="board-lead is-narrow">
            Last updated: November 20, 2026. Plain-language terms for using {SITE_NAME}.
          </p>
          <div className="board-about-acts">
            <Link href="/" className="board-pill board-pill-outline">
              <span className="board-pill-label">Back to home</span>
            </Link>
            <Link href="/privacy" className="board-pill board-pill-outline">
              <span className="board-pill-label">Privacy policy</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="board-section is-soft">
        <div className="board-rail board-legal-doc">
          <article className="board-legal-block">
            <h2>1. Using {SITE_NAME}</h2>
            <p>
              {SITE_NAME} is provided for personal and career resume creation, job-post tailoring, and optional public CV hosting.
              You are responsible for the accuracy of everything on your resume and for keeping your account credentials secure.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>2. You own your content</h2>
            <p>
              You retain full ownership of all text, details, and files you enter into {SITE_NAME}. You grant us permission only to
              store, format, render, and — if you enable public sharing — display your resume at your chosen public link.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>3. Free and paid plans</h2>
            <p>
              You can draft up to two resumes, preview templates live, and publish a shareable resume link for free. Paid plans
              unlock unlimited PDF downloads and unlimited CVs for the subscription period shown at checkout.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>4. Billing, currency, and refunds</h2>
            <p>
              All paid plans are billed in Indian Rupees (INR, ₹) through Cashfree Payments, supporting UPI, domestic and
              international credit/debit cards, and net banking. If you were charged in error or run into a billing issue, contact{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> within 7 days of payment; refunds are processed in accordance
              with Cashfree&apos;s settlement rules and applicable Indian consumer law.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>5. Acceptable use</h2>
            <p>
              Do not publish unlawful, impersonating, or abusive content on public resume URLs, or attempt to scrape, overload, or
              reverse-engineer the service. We may suspend accounts or unpublish pages that violate these rules.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>6. Contact</h2>
            <p>
              Questions about these terms? Reach us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or via the{" "}
              <Link href="/contact">contact page</Link>.
            </p>
          </article>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
