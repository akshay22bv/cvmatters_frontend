import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { OG_IMAGE_PATH, SITE_NAME, SUPPORT_EMAIL, siteUrl } from "@/lib/site";

const title = `Terms of Use · ${SITE_NAME}`;
const description = `Terms governing use of ${SITE_NAME}, resume ownership, subscriptions, cancellation, billing in INR via Cashfree, refunds, governing law, and grievance redressal.`;

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
            Last updated: November 21, 2026. Plain-language terms for using {SITE_NAME}.
          </p>
          <div className="board-about-acts">
            <Link href="/" className="board-pill board-pill-outline">
              <span className="board-pill-label">Back to home</span>
            </Link>
            <Link href="/pricing" className="board-pill board-pill-outline">
              <span className="board-pill-label">View pricing</span>
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
              unlock unlimited PDF downloads and unlimited CVs for the subscription period shown on our{" "}
              <Link href="/pricing">pricing page</Link> and at checkout.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>4. Billing, currency, and refunds</h2>
            <p>
              All paid plans are billed in Indian Rupees (INR, ₹) through Cashfree Payments, supporting UPI, domestic and
              international credit/debit cards, and net banking. If you were charged in error, experienced a duplicate charge, or ran
              into a technical issue that prevented you from using a paid feature, contact{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> within 7 days of payment with your order ID. Approved refunds
              are issued back to the original payment method within 5–7 business days in accordance with Cashfree&apos;s settlement
              rules and applicable Indian consumer law.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>5. Cancellation and renewal</h2>
            <p>
              Paid plans provide fixed-term prepaid access (30 days for Monthly, 365 days for Yearly) with no lock-in contracts or
              hidden cancellation fees. You may stop or cancel any active plan or upcoming renewal at any time from your{" "}
              <Link href="/profile">account profile</Link> or by emailing <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              After cancellation, your paid features remain active until the end of the current paid period. Once a plan expires,
              your saved CVs and public link remain intact and editable within free-plan limits.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>6. Acceptable use</h2>
            <p>
              Do not publish unlawful, impersonating, or abusive content on public resume URLs, or attempt to scrape, overload, or
              reverse-engineer the service. We may suspend accounts or unpublish pages that violate these rules.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>7. Governing law and dispute resolution</h2>
            <p>
              These Terms of Use are governed by and construed in accordance with the laws of India. Any dispute arising out of or
              relating to {SITE_NAME} or these terms shall first be raised with our support team for good-faith resolution and, if
              unresolved, shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India —
              without limiting any mandatory rights you hold under the Consumer Protection Act, 2019.
            </p>
          </article>

          <article className="board-legal-block">
            <h2>8. Grievance Officer</h2>
            <p>
              In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and
              the Consumer Protection (E-Commerce) Rules, 2020, grievances regarding content, privacy, billing, or service issues may
              be addressed to our Grievance Officer:
            </p>
            <p>
              <strong>Grievance Officer — {SITE_NAME}</strong>
              <br />
              Email: <a href={`mailto:${SUPPORT_EMAIL}?subject=Grievance%20Redressal`}>{SUPPORT_EMAIL}</a>
              <br />
              Support form: <Link href="/contact">cvmatters.net/contact</Link>
              <br />
              Response timeline: Grievances are acknowledged within 48 hours and resolved within 15 days of receipt (and in all
              cases within 30 days as required by applicable law).
            </p>
          </article>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
