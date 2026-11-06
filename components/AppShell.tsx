"use client";

import Builder from "./Builder";
import { MobileFormStable } from "./MobileFormStable";

/** Keeps the builder mounted across /cv/* routes so section changes do not remount. */
export function AppShell() {
  return (
    <>
      <MobileFormStable />
      <Builder />
    </>
  );
}
