"use client";

import Builder from "./Builder";
import { ConfirmProvider } from "./ConfirmProvider";
import { MobileFormStable } from "./MobileFormStable";

/** Keeps the builder mounted across /cv/* routes so section changes do not remount. */
export function AppShell() {
  return (
    <ConfirmProvider>
      <MobileFormStable />
      <Builder />
    </ConfirmProvider>
  );
}
