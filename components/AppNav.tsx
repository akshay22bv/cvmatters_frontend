"use client";

import Link from "next/link";
import { IconUser, Logo } from "./icons";
import type { AppView } from "@/lib/paths";

export function AppNav({
  view,
  signedIn = false,
  onSignIn,
}: {
  view: AppView;
  signedIn?: boolean;
  onSignIn?: () => void;
}) {
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
        <nav className="app-nav-links" aria-label="Account">
          {signedIn ? (
            <Link href="/profile" className={view.kind === "profile" ? "app-nav-profile is-on" : "app-nav-profile"}>
              <IconUser />
              <span>Profile</span>
            </Link>
          ) : (
            <button type="button" className="app-nav-sign" onClick={onSignIn}>
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
