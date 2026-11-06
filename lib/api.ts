import { readToken } from "./session";
import type { Account, Category, Entitlement, Plan, RatingSummary, ResumeData, ResumeRecord, TemplateId } from "./types";

type SaveBody = {
  ownerKey: string;
  templateId: TemplateId;
  category: Category;
  isPublic: boolean;
  jobDescription: string;
  data: ResumeData;
  /** Pass to set or clear the public username. */
  slug?: string | null;
};

/** Thrown by `request` so callers can branch on *why* a call failed. */
export class ApiError extends Error {
  status: number;
  code: string;
  field: string;

  constructor(message: string, status: number, code = "", field = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.field = field;
  }

  get needsSignIn() {
    return this.status === 401 || this.code === "signin_required";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = readToken();
  const response = await fetch(`/backend${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const fallback =
      response.status >= 500
        ? "Can't reach the server. Start it, then refresh."
        : `Request failed (${response.status})`;
    throw new ApiError(body.error || fallback, response.status, body.code, body.field);
  }
  return response.json();
}

export function loadMine(ownerKey: string, id?: string) {
  const query = new URLSearchParams({ ownerKey });
  if (id) query.set("id", id);
  return request<ResumeRecord>(`/api/resumes/mine?${query}`);
}

export function listResumes(ownerKey: string) {
  return request<ResumeRecord[]>(`/api/resumes?ownerKey=${encodeURIComponent(ownerKey)}`);
}

export function createResume(ownerKey: string) {
  return request<ResumeRecord>("/api/resumes", {
    method: "POST",
    body: JSON.stringify({ ownerKey }),
  });
}

export function ensureResume(ownerKey: string, templateId: TemplateId, category: Category, data: ResumeData) {
  return request<ResumeRecord>("/api/resumes/ensure", {
    method: "POST",
    body: JSON.stringify({ ownerKey, templateId, category, data }),
  });
}

export function updateResume(id: string, body: SaveBody) {
  return request<ResumeRecord>(`/api/resumes/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** Set username / public flag without rewriting CV fields. */
export function updateHosting(id: string, body: { ownerKey: string; slug?: string | null; isPublic?: boolean }) {
  return request<ResumeRecord>(`/api/resumes/${encodeURIComponent(id)}/hosting`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function loadGallery(category?: Category) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return request<ResumeRecord[]>(`/api/gallery${query}`);
}

/** One listed resume for the public `/:username` page. */
export function loadPublicResume(id: string) {
  return request<ResumeRecord & { isMine?: boolean }>(`/api/resumes/${encodeURIComponent(id)}/public`);
}

export function improveText(input: { kind: "summary" | "bullets" | "tailor"; text: string; role: string; jobDescription: string }) {
  return request<{ text: string; source: string }>("/api/ai/improve", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function adjustResume(input: { summary: string; experience: ResumeData["experience"]; role: string; jobDescription: string }) {
  return request<{ summary: string; experience: ResumeData["experience"]; source: string }>("/api/ai/adjust", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function readJobLink(url: string) {
  return request<{ text: string }>("/api/job/read", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function importResume(filename: string, data: string) {
  return request<{ data: ResumeData }>("/api/import", {
    method: "POST",
    body: JSON.stringify({ filename, data }),
  });
}

/* ----------------------------------------------------------- accounts -- */

type Session = { token: string; expiresAt: string; user: Account; entitlement: Entitlement };

export function signUp(input: { email: string; name: string; password: string; ownerKey: string }) {
  return request<Session>("/api/auth/signup", { method: "POST", body: JSON.stringify(input) });
}

export function signIn(input: { email: string; password: string; ownerKey: string }) {
  return request<Session>("/api/auth/login", { method: "POST", body: JSON.stringify(input) });
}

export function signOut() {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export function loadAccount() {
  return request<{ user: Account; entitlement: Entitlement }>("/api/auth/me");
}

/* ------------------------------------------------------------ billing -- */

export function loadPlans() {
  return request<{ plans: Plan[] }>("/api/billing/plans");
}

export function startCheckout(plan: string) {
  return request<{ order: { id: string; plan: string; amount: number; currency: string }; plan: Plan }>(
    "/api/billing/checkout",
    { method: "POST", body: JSON.stringify({ plan }) },
  );
}

export function payOrder(input: { orderId: string; cardNumber: string; expiry: string; cvc: string; nameOnCard: string }) {
  return request<{ subscription: Entitlement["subscription"]; receipt: Receipt; canDownload: boolean }>(
    "/api/billing/pay",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export type Receipt = {
  orderId: string;
  reference: string;
  last4: string;
  amount: number;
  price: string;
  plan: string;
};

export function loadBilling() {
  return request<Entitlement & { orders: { id: string; plan: string; amount: number; status: string; createdAt: string }[] }>(
    "/api/billing/status",
  );
}

/* ------------------------------------------------------------ ratings -- */

export function rateResume(id: string, stars: number, note: string) {
  return request<RatingSummary>(`/api/resumes/${id}/rating`, {
    method: "POST",
    body: JSON.stringify({ stars, note }),
  });
}

export function loadRatings(id: string) {
  return request<RatingSummary & { notes: { stars: number; note: string; name: string; at: string }[] }>(
    `/api/resumes/${id}/ratings`,
  );
}

/* ------------------------------------------------------------- skills -- */

/** Suggestions from ESCO, Indeed (by country), and Stack Overflow tags. */
export function searchSkills(q: string, kind: "skill" | "occupation" = "skill", group?: string) {
  const groupQuery = group ? `&group=${encodeURIComponent(group)}` : "";
  return request<{ results: string[]; source: string }>(
    `/api/skills/search?q=${encodeURIComponent(q)}&kind=${kind}${groupQuery}`,
  );
}

export type Country = { code: string; name: string };

/** Country names from the public country list, cached on the server. */
export function loadCountries() {
  return request<{ countries: Country[]; source: string }>("/api/countries");
}
