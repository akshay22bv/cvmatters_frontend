"use client";

import Builder from "./Builder";

/** Keeps the builder mounted across /cv/* routes so section changes do not remount. */
export function AppShell() {
  return <Builder />;
}
