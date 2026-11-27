import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { IconCheck, IconLock } from "@/components/icons";
import { OG_IMAGE_PATH, SITE_NAME, siteUrl } from "@/lib/site";
import { getSiteSettings } from "@/lib/siteSettings";

const title = `Pricing · ${SITE_NAME}`;
const description =
  "Start free with up to 2 CVs on CV Matters. Unlock unlimited PDF exports from ₹48/month, ₹498/year, or ₹4,999 for 10 years.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: siteUrl("/pricing") },
  openGraph: {
    type: "website",
    title,
    description,
    url: siteUrl("/pricing"),
    images: [{ url: siteUrl(OG_IMAGE_PATH), width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [siteUrl(OG_IMAGE_PATH)],
  },
};

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    cadence: "forever",
    blurb: "Draft, preview, and share a link before you need a PDF export.",
    perks: [
      "Up to 2 CVs",
      "All templates in the editor",
      "Live preview & public share link",
      "PDF downloads on paid plans",
    ],
    ctaLabel: "Start free",
    ctaHref: "/start",
    featured: false,
    badge: "",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹48",
    cadence: "per month",
    blurb: "Full access for active job searches, billed for 30 days.",
    perks: [
      "Unlimited PDF downloads",
      "Unlimited CVs",
      "All ATS-friendly templates",
      "Tailor to any job post",
      "Cancel any time — no lock-in",
    ],
    ctaLabel: "Get Monthly",
    ctaHref: "/signup?next=/profile",
    featured: false,
    badge: "",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "₹498",
    cadence: "per year",
    blurb: "Same full access for 365 days — save compared to paying monthly.",
    perks: [
      "Unlimited PDF downloads",
      "Unlimited CVs",
      "All ATS-friendly templates",
      "Tailor to any job post",
      "Cancel any time — no lock-in",
    ],
    ctaLabel: "Get Yearly",
    ctaHref: "/signup?next=/profile",
    featured: false,
    badge: "",
  },
  {
    id: "ten_year",
    name: "10 Year",
    price: "₹4,999",
    cadence: "for 10 years",
    blurb: "One payment, a decade of full access — ideal if you update your CV across many roles.",
    perks: [
      "Unlimited PDF downloads",
      "Unlimited CVs",
      "All ATS-friendly templates",
      "Tailor to any job post",
      "Single checkout · no renewals for 10 years",
    ],
    ctaLabel: "Get 10 Year",
    ctaHref: "/signup?next=/profile",
    featured: true,
    badge: "Best long-term value",
  },
] as const;

const PRICING_FAQS = [
  {
    q: "What payment methods are accepted?",
    a: "All paid plans are billed in Indian Rupees (₹) through Cashfree Payments, supporting UPI, domestic and international credit/debit cards, and net banking.",
  },
  {
    q: "What happens if I cancel or my plan expires?",
    a: "Your paid access continues until the end of the period you paid for. After that, your account simply returns to the free tier — your saved resumes and public link stay intact.",
  },
] as const;

export default async function PricingPage() {
  const { supportEmail } = await getSiteSettings();
  const refundFaq = {
    q: "What is your refund policy?",
    a: `If you were charged in error or run into a billing problem, write to ${supportEmail} within 7 days of payment with your order ID and we will review and refund eligible charges back to your original payment method.`,
  };
  const faqs = [...PRICING_FAQS, refundFaq];
  return (
    <div className="board board-static">
      <section className="board-section board-about-hero" aria-labelledby="pricing-page-title">
        <div className="board-rail">
          <p className="board-kicker">Pricing</p>
          <h1 id="pricing-page-title" className="board-heading">
            Start free, upgrade when you need PDFs.
          </h1>
          <p className="board-lead is-narrow">
            The free plan includes up to 2 CVs, every template, and a public link. Paid plans add unlimited CVs and PDF exports —
            monthly, yearly, or once for ten years.
          </p>
          <div className="board-about-acts">
            <Link href="/start" className="board-pill board-pill-primary">
              <span className="board-pill-label">Create my resume</span>
            </Link>
            <Link href="/login" className="board-pill board-pill-outline">
              <span className="board-pill-label">Sign in</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="board-section is-soft" aria-label="Plans">
        <div className="board-rail">
          <div className="pricing-grid">
            {TIERS.map((tier) => (
              <article
                key={tier.id}
                className={`pricing-card${tier.featured ? " is-featured" : ""}${tier.id === "free" ? " is-free" : ""}`}
              >
                <div className="pricing-card-head">
                  <div className="pricing-card-top">
                    <h2>{tier.name}</h2>
                    {tier.badge ? <span className="pricing-badge">{tier.badge}</span> : null}
                  </div>
                  <div className="pricing-price">
                    <strong>{tier.price}</strong>
                    <span>{tier.cadence}</span>
                  </div>
                  <p className="pricing-blurb">{tier.blurb}</p>
                </div>

                <ul className="pricing-perks">
                  {tier.perks.map((perk) => (
                    <li key={perk}>
                      <IconCheck />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.ctaHref}
                  className={`board-pill pricing-cta ${tier.featured ? "board-pill-primary" : "board-pill-outline"}`}
                >
                  <span className="board-pill-label">{tier.ctaLabel}</span>
                </Link>
              </article>
            ))}
          </div>

          <p className="pricing-trust">
            <IconLock />
            <span>
              Secure checkout in INR (₹) via Cashfree · UPI, domestic &amp; international cards, and net banking ·{" "}
              <Link href="/terms">Terms &amp; cancellation policy</Link>
            </span>
          </p>
        </div>
      </section>

      <section className="board-section" aria-labelledby="pricing-faq-title">
        <div className="board-rail">
          <div className="board-intro">
            <p className="board-kicker">Questions</p>
            <h2 id="pricing-faq-title" className="board-heading">
              Billing &amp; plans FAQ
            </h2>
          </div>
          <div className="board-faq-list">
            {faqs.map((item) => (
              <details key={item.q} className="board-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
