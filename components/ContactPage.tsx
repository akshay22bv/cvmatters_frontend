import Link from "next/link";
import { SUPPORT_EMAIL, SITE_NAME } from "@/lib/site";
import { IconMail } from "./icons";
import { SiteFooter } from "./SiteFooter";

function supportMail(subject: string, body?: string) {
  const params = new URLSearchParams();
  params.set("subject", subject);
  if (body) params.set("body", body);
  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
}

const CHANNELS = [
  {
    title: "Product & editor",
    body: "Templates, PDF export, job matching, or something not saving correctly.",
    subject: "CV Matters — product help",
  },
  {
    title: "Billing & subscriptions",
    body: "Receipts, plan changes, or checkout with Cashfree (UPI, cards, net banking).",
    subject: "CV Matters — billing",
  },
  {
    title: "Privacy & account",
    body: "Delete your account, download your data, or questions about how we store CV content.",
    subject: "CV Matters — privacy request",
  },
  {
    title: "Feedback & partnerships",
    body: "Ideas for the product, press, or working together.",
    subject: "CV Matters — feedback",
  },
] as const;

const SELF_SERVE = [
  { href: "/about#how-it-works", label: "How CV Matters works" },
  { href: "/cv/details", label: "Open the CV editor" },
  { href: "/examples", label: "Browse examples in your field" },
  { href: "/about#privacy", label: "Privacy policy" },
  { href: "/about#terms", label: "Terms of use" },
  { href: "/billing/return", label: "After payment — billing return page" },
] as const;

export function ContactPage() {
  return (
    <div className="board board-static">
      <section className="board-section board-contact-hero" aria-labelledby="contact-title">
        <div className="board-rail">
          <p className="board-kicker">Contact</p>
          <h1 id="contact-title" className="board-heading">
            We&apos;re here to help
          </h1>
          <p className="board-lead is-narrow">
            Questions about your CV, billing, or your account? Email us and include the details below so we can jump in
            quickly. We read every message — no call centre, no ticket maze.
          </p>

          <a className="board-contact-email" href={`mailto:${SUPPORT_EMAIL}`}>
            <IconMail />
            <span>{SUPPORT_EMAIL}</span>
          </a>

          <p className="board-contact-note">
            Typical reply time: <strong>1–2 business days</strong> (India time). Urgent billing issues? Put{" "}
            <strong>“Urgent billing”</strong> in the subject line.
          </p>

          <div className="board-about-acts">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="board-pill board-pill-primary">
              <span className="board-pill-label">Email us</span>
            </a>
            <Link href="/" className="board-pill board-pill-outline">
              <span className="board-pill-label">Back to home</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="board-section is-soft" aria-label="What to contact us about">
        <div className="board-rail">
          <h2 className="board-heading">Pick a topic</h2>
          <p className="board-lead is-narrow">Use a pre-filled subject so your message lands in the right place.</p>
          <div className="board-contact-channels">
            {CHANNELS.map((item) => (
              <article key={item.title} className="board-contact-channel">
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <a href={supportMail(item.subject, `Hi ${SITE_NAME} team,\n\n`)}>Email about this →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="board-section" aria-label="Before you email">
        <div className="board-rail">
          <h2 className="board-heading">Try these first</h2>
          <p className="board-lead is-narrow">Many answers are already in the product — you might not need to wait on us.</p>
          <ul className="board-contact-links">
            {SELF_SERVE.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="board-section is-soft" aria-labelledby="contact-details-title">
        <div className="board-rail">
          <h2 id="contact-details-title" className="board-heading">
            What to include
          </h2>
          <p className="board-lead is-narrow">The more context you send, the faster we can fix or explain.</p>
          <ul className="board-contact-checklist">
            <li>The email you use to sign in to {SITE_NAME}</li>
            <li>What you tried (e.g. “PDF download on Compare”, “Cashfree checkout”)</li>
            <li>Device and browser (e.g. Android Chrome, iPhone Safari, desktop Firefox)</li>
            <li>Screenshots if something looks broken — they help a lot</li>
            <li>For billing: date of payment and last four digits of UPI / card if you have them (never send full card numbers)</li>
          </ul>
          <aside className="board-contact-aside">
            We don&apos;t offer phone support yet. Email is the fastest way to reach the team building {SITE_NAME}.
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
