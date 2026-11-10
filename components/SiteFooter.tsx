"use client";

import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, SUPPORT_EMAIL } from "@/lib/site";
import { IconChevronRight, IconLock } from "./icons";

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
  const showActions = Boolean(onBuild && onJob && onField);
  const templatesHref = showActions ? "#templates" : "/#templates";
  const year = new Date().getFullYear();

  return (
    <footer className="board-foot">
      <div className="board-foot-surface">
        <div className="board-foot-glow" aria-hidden="true" />
        <div className="board-rail board-foot-layout">
          <div className="board-foot-brand">
            <p className="board-foot-kicker">Resume builder</p>
            <strong className="board-foot-title">{SITE_NAME}</strong>
            <p className="board-foot-tagline">{SITE_TAGLINE}</p>

            {showActions ? (
              <div className="board-foot-cta">
                <button type="button" className="board-pill board-pill-primary board-pill-compact" disabled={busy} onClick={onBuild}>
                  <span className="board-pill-label">Build your CV</span>
                  <span className="board-pill-icon" aria-hidden="true">
                    <IconChevronRight />
                  </span>
                </button>
                <button type="button" className="board-pill board-pill-outline board-pill-compact board-foot-pill" disabled={busy} onClick={onJob}>
                  <span className="board-pill-label">Match a job</span>
                  <span className="board-pill-icon" aria-hidden="true">
                    <IconChevronRight />
                  </span>
                </button>
                <button type="button" className="board-pill board-pill-outline board-pill-compact board-foot-pill" disabled={busy} onClick={onField}>
                  <span className="board-pill-label">Your field</span>
                  <span className="board-pill-icon" aria-hidden="true">
                    <IconChevronRight />
                  </span>
                </button>
              </div>
            ) : (
              <Link href="/cv/details" className="board-pill board-pill-primary board-pill-compact board-foot-start">
                <span className="board-pill-label">Start your CV</span>
                <span className="board-pill-icon" aria-hidden="true">
                  <IconChevronRight />
                </span>
              </Link>
            )}
          </div>

          <div className="board-foot-columns">
            <nav className="board-foot-col" aria-label="Product">
              <h3 className="board-foot-col-title">Product</h3>
              <ul className="board-foot-list">
                <li>
                  <Link href="/cv/details">CV editor</Link>
                </li>
                <li>
                  <Link href="/cv/job">Job matching</Link>
                </li>
                <li>
                  <Link href="/cv/compare">PDF download</Link>
                </li>
                <li>
                  <a href={templatesHref}>Templates</a>
                </li>
              </ul>
            </nav>

            <nav className="board-foot-col" aria-label="Explore">
              <h3 className="board-foot-col-title">Explore</h3>
              <ul className="board-foot-list">
                <li>
                  <Link href="/examples">Examples by field</Link>
                </li>
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/about#how-it-works">How it works</Link>
                </li>
              </ul>
            </nav>

            <nav className="board-foot-col" aria-label="Support and legal">
              <h3 className="board-foot-col-title">Support</h3>
              <ul className="board-foot-list">
                <li>
                  <Link href="/contact">Contact us</Link>
                </li>
                <li>
                  <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                </li>
                <li>
                  <Link href="/about#privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/about#terms">Terms</Link>
                </li>
                <li>
                  <a href={`mailto:${SUPPORT_EMAIL}?subject=Billing%20help`}>Billing help</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="board-foot-bar">
        <div className="board-rail board-foot-bar-inner">
          <p className="board-foot-copyline">
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <p className="board-foot-trust">
            <IconLock />
            <span>Secure checkout · UPI · Cards · Net banking via Cashfree</span>
          </p>
          <div className="board-foot-bar-links">
            <Link href="/contact">Contact</Link>
            <Link href="/about#privacy">Privacy</Link>
            <Link href="/about#terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
