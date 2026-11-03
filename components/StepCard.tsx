"use client";

import type { ReactNode } from "react";

/**
 * The frame every editor screen sits in: a white card, a titled header with a
 * rule under it, and a grid that fits as many field columns as the width
 * allows. One place to change how every form in the builder is laid out.
 */
export function StepCard({
  title,
  sub,
  aside,
  children,
  grid = true,
  plain = false,
  className,
}: {
  title?: ReactNode;
  sub?: string;
  aside?: ReactNode;
  children: ReactNode;
  grid?: boolean;
  /** The screen's leading question: no card chrome, large heading. */
  plain?: boolean;
  className?: string;
}) {
  const headed = title != null || sub || aside;
  const classes = [plain ? "card is-plain" : "card", className].filter(Boolean).join(" ");
  return (
    <section className={classes}>
      {headed ? (
        <header className="card-head">
          <div>
            {title != null ? <h1>{title}</h1> : null}
            {sub ? <p>{sub}</p> : null}
          </div>
          {aside}
        </header>
      ) : null}
      {grid ? <div className="card-grid">{children}</div> : <div className="card-body">{children}</div>}
    </section>
  );
}
