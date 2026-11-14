"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Builder from "./Builder";
import { ConfirmProvider } from "./ConfirmProvider";
import { LoadScreen } from "./LoadScreen";
import { MobileFormStable } from "./MobileFormStable";

/** Keeps the builder mounted across /cv/* routes so section changes do not remount. */
export function AppShell() {
  const pathname = usePathname() || "";
  // Blog routes are server-rendered for SEO — skip the SPA shell.
  if (pathname === "/blog" || pathname.startsWith("/blog/")) return null;

  return (
    <ConfirmProvider>
      <MobileFormStable />
      <Suspense fallback={<LoadScreen message="Opening CV Matters…" />}>
        <Builder />
      </Suspense>
    </ConfirmProvider>
  );
}
