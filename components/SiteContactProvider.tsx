"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SITE_CONTACT_FALLBACK, type SiteContactSettings } from "@/lib/siteSettings";

const SiteContactContext = createContext<SiteContactSettings>(SITE_CONTACT_FALLBACK);

export function SiteContactProvider({ value, children }: { value: SiteContactSettings; children: ReactNode }) {
  return <SiteContactContext.Provider value={value}>{children}</SiteContactContext.Provider>;
}

export function useSiteContact() {
  return useContext(SiteContactContext);
}