"use client";

import Link from "next/link";
import { IconChevronRight } from "./icons";

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

  return (
    <footer className="board-foot">
      <div className="board-rail board-foot-grid">
        <div className="board-foot-copy">
          <strong>CV Matters</strong>
          <p>Write a resume, match a job, and learn from people in your field.</p>
        </div>
        <nav className="board-foot-nav" aria-label="Footer">
          {showActions ? (
            <>
              <button type="button" className="board-pill board-pill-outline board-pill-compact" disabled={busy} onClick={onBuild}>
                <span className="board-pill-label">Build your CV</span>
                <span className="board-pill-icon" aria-hidden="true">
                  <IconChevronRight />
                </span>
              </button>
              <button type="button" className="board-pill board-pill-outline board-pill-compact" disabled={busy} onClick={onJob}>
                <span className="board-pill-label">Match a job</span>
                <span className="board-pill-icon" aria-hidden="true">
                  <IconChevronRight />
                </span>
              </button>
              <button type="button" className="board-pill board-pill-outline board-pill-compact" disabled={busy} onClick={onField}>
                <span className="board-pill-label">Your field</span>
                <span className="board-pill-icon" aria-hidden="true">
                  <IconChevronRight />
                </span>
              </button>
            </>
          ) : null}
          <a className="board-foot-link" href={templatesHref}>
            Templates
          </a>
          <Link className="board-foot-link" href="/examples">
            Examples
          </Link>
          <Link className="board-foot-link" href="/about">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}
