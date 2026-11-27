"use client";

import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { useSiteContact } from "./SiteContactProvider";
import { Logo } from "./icons";

type FootLink =
  | { type: "link"; href: string; label: string }
  | { type: "action"; label: string; onClick: () => void; disabled?: boolean };

function FootPanel({
  title,
  links,
  defaultOpen = false,
}: {
  title: string;
  links: FootLink[];
  defaultOpen?: boolean;
}) {
  return (
    <details className="board-foot-panel" open={defaultOpen}>
      <summary className="board-foot-panel-summary">{title}</summary>
      <ul className="board-foot-link-grid">
        {links.map((item) => (
          <li key={item.label}>
            {item.type === "link" ? (
              item.href.startsWith("#") ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )
            ) : (
              <button type="button" className="board-foot-action-link" disabled={item.disabled} onClick={item.onClick}>
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function SiteFooter({
  busy = false,
  onBuild,
  onJob,
  onField,
}: {
  busy?: boolean;
  onBuild?: () => void;
  onJob?: () => void;
  onField?: () => void;
}) {
  const { supportEmail } = useSiteContact();
  const showActions = Boolean(onBuild && onJob && onField);
  const templatesHref = showActions ? "#templates" : "/#templates";
  const year = new Date().getFullYear();

  const productLinks: FootLink[] = [
    { type: "link", href: "/cv/details", label: "CV editor" },
    { type: "link", href: "/cv/job", label: "Job matching" },
    { type: "link", href: "/cv/compare", label: "PDF download" },
    { type: "link", href: templatesHref, label: "Templates" },
    { type: "link", href: "/pricing", label: "Pricing" },
    { type: "link", href: "/login", label: "Sign in" },
  ];

  if (showActions) {
    productLinks.push(
      { type: "action", label: "Build your CV", onClick: onBuild!, disabled: busy },
      { type: "action", label: "Match a job", onClick: onJob!, disabled: busy },
      { type: "action", label: "Your field", onClick: onField!, disabled: busy },
    );
  }

  const siteLinks: FootLink[] = [
    { type: "link", href: "/examples", label: "Examples by field" },
    { type: "link", href: "/blog", label: "Blog" },
    { type: "link", href: "/help", label: "Help" },
    { type: "link", href: "/about", label: "About us" },
    { type: "link", href: "/contact", label: "Contact us" },
    { type: "link", href: "/about#how-it-works", label: "How it works" },
    { type: "link", href: `mailto:${supportEmail}?subject=Billing%20help`, label: "Billing help" },
    { type: "link", href: "/privacy", label: "Privacy" },
    { type: "link", href: "/terms", label: "Terms" },
  ];

  return (
    <footer className="board-foot">
      <div className="board-foot-surface">
        <div className="board-rail board-foot-inner">
          <div className="board-foot-head">
            <Link href="/" className="board-foot-logo" aria-label={`${SITE_NAME} home`}>
              <Logo />
            </Link>
            <div className="board-foot-connect">
              <p className="board-foot-connect-label">Connect with us</p>
              <a className="board-foot-connect-link" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
            </div>
          </div>

          <div className="board-foot-panels">
            <FootPanel title="Product" links={productLinks} defaultOpen />
            <FootPanel title={SITE_NAME} links={siteLinks} defaultOpen />
          </div>
        </div>
      </div>

      <div className="board-foot-legal">
        <p className="board-foot-legal-line">
          {`© ${year} ${SITE_NAME}. All rights reserved. `}
          <Link href="/terms">Terms of Use</Link>
          {" and "}
          <Link href="/privacy">Privacy Policy</Link>
        </p>
        <p className="board-foot-legal-trust">
          Checkout in INR (₹) · UPI, international &amp; domestic cards, net banking via Cashfree
        </p>
      </div>
    </footer>
  );
}