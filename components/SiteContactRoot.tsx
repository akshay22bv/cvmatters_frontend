import { getSiteSettings } from "@/lib/siteSettings";
import { SiteContactProvider } from "./SiteContactProvider";

export async function SiteContactRoot({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return <SiteContactProvider value={settings}>{children}</SiteContactProvider>;
}