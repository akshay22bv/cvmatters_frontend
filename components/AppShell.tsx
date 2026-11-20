"use client";

import { usePathname } from "next/navigation";
import Builder from "./Builder";
import { ConfirmProvider } from "./ConfirmProvider";
import { MobileFormStable } from "./MobileFormStable";
import { isBuilderPath } from "@/lib/paths";

/** Keeps the builder mounted across /cv/* routes so section changes do not remount. */
export function AppShell() {
  const pathname = usePathname() || "/";
  // Standalone SSR pages (/blog, /privacy, /terms, /about, /contact, /:username, /billing, 404)
  // render through their own page components without mounting the SPA shell.
  if (!isBuilderPath(pathname)) return null;

  return (
    <ConfirmProvider>
      <MobileFormStable />
      <Builder />
    </ConfirmProvider>
  );
}
