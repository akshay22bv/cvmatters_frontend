"use client";

import Link from "next/link";
import { Logo } from "./icons";
import { crumbsFor, type AppView } from "@/lib/paths";

const LINKS: { href: string; label: string; on: (view: AppView) => boolean }[] = [
  { href: "/", label: "Home", on: (view) => view.kind === "start" },
  { href: "/cv/details", label: "My CV", on: (view) => view.kind === "cv" && view.section !== "job" },
  { href: "/profile", label: "Profile", on: (view) => view.kind === "profile" },
  { href: "/cv/job", label: "Job post", on: (view) => view.kind === "cv" && view.section === "job" },
  { href: "/examples", label: "Your field", on: (view) => view.kind === "examples" },
];

export function AppNav({ view }: { view: AppView }) {
  const crumbs = crumbsFor(view);

  return (
    <header className="app-nav">
      <div className="app-nav-bar">
        <Link href="/" className="app-nav-brand">
          <span className="mn-mark">
            <Logo />
          </span>
          <span>
            <b>CV</b> Matters
          </span>
        </Link>
        <nav className="app-nav-links" aria-label="Site">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={link.on(view) ? "is-on" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <nav className="app-nav-path" aria-label="You are here">
        {crumbs.map((crumb, index) => (
          <span key={`${crumb.href}-${index}`}>
            {index > 0 ? <i>/</i> : null}
            {index === crumbs.length - 1 ? <strong>{crumb.label}</strong> : <Link href={crumb.href}>{crumb.label}</Link>}
          </span>
        ))}
      </nav>
    </header>
  );
}
