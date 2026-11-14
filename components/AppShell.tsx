"use client";

import { usePathname } from "next/navigation";
import Builder from "./Builder";
import { ConfirmProvider } from "./ConfirmProvider";
import { MobileFormStable } from "./MobileFormStable";

/** Keeps the builder mounted across /cv/* routes so section changes do not remount. */
export function AppShell() {
  const pathname = usePathname() || "";
  // Blog routes are server-rendered for SEO — skip the SPA shell.
  if (pathname === "/blog" || pathname.startsWith("/blog/")) return null;

  return (
    <ConfirmProvider>
      <MobileFormStable />
      <Builder />
    </ConfirmProvider>
  );
}
