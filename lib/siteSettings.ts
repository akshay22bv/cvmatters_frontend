export type SiteContactSettings = {
  operatorName: string;
  supportEmail: string;
  supportPhone: string;
};

/** Used when the API is down or the row is missing. */
export const SITE_CONTACT_FALLBACK: SiteContactSettings = {
  operatorName: "Akshay Vishwanath Bilagi",
  supportEmail: "developer28tester@gmail.com",
  supportPhone: "",
};

function backendOrigin() {
  return (process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000").replace(/\/+$/, "");
}

export async function getSiteSettings(): Promise<SiteContactSettings> {
  try {
    const response = await fetch(`${backendOrigin()}/api/site/settings`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return SITE_CONTACT_FALLBACK;
    const body = (await response.json()) as Partial<SiteContactSettings>;
    return {
      operatorName: String(body.operatorName || "").trim() || SITE_CONTACT_FALLBACK.operatorName,
      supportEmail: String(body.supportEmail || "").trim() || SITE_CONTACT_FALLBACK.supportEmail,
      supportPhone: String(body.supportPhone ?? "").trim(),
    };
  } catch {
    return SITE_CONTACT_FALLBACK;
  }
}