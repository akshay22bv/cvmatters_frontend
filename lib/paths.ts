import type { PanelId } from "./types";

export type StartIntent = "build" | "job" | "field";
export type StartStep = "choose" | "upload" | "linkedin";

export type AppView =
  | { kind: "start" }
  | { kind: "begin"; step: StartStep; intent: StartIntent }
  | { kind: "about" }
  | { kind: "contact" }
  | { kind: "profile" }
  | { kind: "examples" }
  | { kind: "public"; id: string }
  | { kind: "cv"; section: PanelId }
  | { kind: "not-found" };

const SLUG_TO_PANEL: Record<string, PanelId> = {
  details: "details",
  summary: "bio",
  experience: "experience",
  education: "education",
  skills: "skills",
  extras: "extras",
  job: "job",
  compare: "compare",
  ats: "details",
};

const PANEL_TO_SLUG: Record<PanelId, string> = {
  details: "details",
  bio: "summary",
  experience: "experience",
  education: "education",
  skills: "skills",
  extras: "extras",
  job: "job",
  compare: "compare",
  ats: "ats",
};

/** Paths that must never be treated as a public username. */
const RESERVED_ROOT = new Set([
  "404",
  "500",
  "about",
  "account",
  "accounts",
  "admin",
  "ai",
  "api",
  "app",
  "assets",
  "auth",
  "backend",
  "billing",
  "blog",
  "careers",
  "chat",
  "checkout",
  "contact",
  "css",
  "cv",
  "cvmatters",
  "dashboard",
  "delete",
  "discover",
  "docs",
  "download",
  "edit",
  "examples",
  "explore",
  "export",
  "faq",
  "features",
  "feedback",
  "fonts",
  "forgot",
  "gallery",
  "help",
  "home",
  "images",
  "img",
  "import",
  "jobs",
  "js",
  "legal",
  "linkedin",
  "login",
  "logout",
  "mail",
  "me",
  "media",
  "new",
  "null",
  "official",
  "og",
  "pay",
  "payment",
  "payments",
  "pdf",
  "plan",
  "plans",
  "preview",
  "pricing",
  "print",
  "privacy",
  "pro",
  "profile",
  "public",
  "r",
  "register",
  "reset",
  "resume",
  "resumes",
  "robots",
  "root",
  "search",
  "security",
  "settings",
  "share",
  "signin",
  "signout",
  "signup",
  "sitemap",
  "staff",
  "start",
  "static",
  "status",
  "subscribe",
  "subscription",
  "support",
  "system",
  "team",
  "template",
  "templates",
  "terms",
  "undefined",
  "upgrade",
  "upload",
  "user",
  "users",
  "verify",
  "www",
  "sitemap.xml",
  "robots.txt",
  "opengraph-image",
  "twitter-image",
  "icon.png",
  "icon-48.png",
  "icon-192.png",
  "apple-icon.png",
  "logo.png",
  "logo-mark.png",
  "logo-dark.png",
  "logo-square.jpg",
  "favicon.ico",
  "sw.js",
]);

export const SECTION_LABEL: Record<string, string> = {
  start: "Home",
  begin: "Start",
  about: "About",
  contact: "Contact",
  profile: "Profile",
  examples: "Resumes in your field",
  details: "Details",
  bio: "Summary",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  extras: "Extra sections",
  job: "Job post",
  ats: "ATS check",
  compare: "Download",
};

export function parseStartIntent(value: string | null | undefined): StartIntent {
  if (value === "job" || value === "field") return value;
  return "build";
}

export function parseStartStep(value: string | null | undefined): StartStep {
  if (value === "upload" || value === "linkedin") return value;
  return "choose";
}

export function startPath(step: StartStep = "choose", intent: StartIntent = "build") {
  const base = step === "choose" ? "/start" : `/start/${step}`;
  return intent === "build" ? base : `${base}?intent=${intent}`;
}

/** Where to land after sign-in — blocks open redirects and auth loops. */
export function safeNextPath(raw: string | null | undefined, fallback = "/cv/details"): string {
  const value = String(raw || "").trim();
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  const path = value.split("#")[0] || fallback;
  if (path.startsWith("/auth/") || path.startsWith("/backend/")) return fallback;
  return path;
}

/** Dedicated sign-in page, with optional return path after auth. */
export function loginPath(next?: string | null, fallback = "/cv/details"): string {
  const path = safeNextPath(next, fallback);
  if (path === "/profile") return "/login";
  return `/login?next=${encodeURIComponent(path)}`;
}

export function viewToPath(view: AppView) {
  if (view.kind === "start") return "/";
  if (view.kind === "begin") return startPath(view.step, view.intent);
  if (view.kind === "about") return "/about";
  if (view.kind === "contact") return "/contact";
  if (view.kind === "profile") return "/profile";
  if (view.kind === "examples") return "/examples";
  if (view.kind === "public") return publicResumePath(view.id);
  if (view.kind === "not-found") return "/404";
  return `/cv/${PANEL_TO_SLUG[view.section] || "details"}`;
}

export function pathToView(pathname: string, search = ""): AppView {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if (parts.length === 0 || (parts.length === 1 && parts[0] === "home")) return { kind: "start" };
  if (parts[0] === "start") {
    if (parts.length === 1) {
      return { kind: "begin", step: "choose", intent: parseStartIntent(params.get("intent")) };
    }
    if (parts.length === 2 && (parts[1] === "upload" || parts[1] === "linkedin")) {
      return { kind: "begin", step: parts[1], intent: parseStartIntent(params.get("intent")) };
    }
    return { kind: "not-found" };
  }
  if (parts.length === 1 && parts[0] === "profile") return { kind: "profile" };
  if (parts.length === 1 && parts[0] === "about") return { kind: "about" };
  if (parts.length === 1 && parts[0] === "contact") return { kind: "contact" };
  if (parts.length === 1 && parts[0] === "examples") return { kind: "examples" };
  // Legacy `/r/name` still works; prefer bare `/name`.
  if (parts[0] === "r" && parts.length === 2 && parts[1]) {
    return { kind: "public", id: parts[1] };
  }
  if (parts[0] === "cv") {
    if (parts.length === 1) return { kind: "cv", section: "details" };
    if (parts.length === 2 && parts[1] in SLUG_TO_PANEL) {
      return { kind: "cv", section: SLUG_TO_PANEL[parts[1]] };
    }
    return { kind: "not-found" };
  }
  if (parts.length === 1 && !RESERVED_ROOT.has(parts[0].toLowerCase())) {
    return { kind: "public", id: parts[0] };
  }
  return { kind: "not-found" };
}

/** True for interactive SPA builder routes managed by AppShell. */
export function isBuilderPath(pathname: string) {
  if (
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/pricing" ||
    pathname.startsWith("/pricing/") ||
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/templates" ||
    pathname.startsWith("/templates/") ||
    pathname === "/help" ||
    pathname.startsWith("/help/") ||
    pathname === "/privacy" ||
    pathname.startsWith("/privacy/") ||
    pathname === "/terms" ||
    pathname.startsWith("/terms/") ||
    pathname === "/billing" ||
    pathname.startsWith("/billing/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/og/") ||
    pathname.startsWith("/embed/")
  ) {
    return false;
  }
  const view = pathToView(pathname);
  return (
    view.kind === "start" ||
    view.kind === "begin" ||
    view.kind === "cv" ||
    view.kind === "examples" ||
    view.kind === "profile"
  );
}

/** Shareable public resume URL — `domain.com/username`. */
export function publicResumePath(idOrSlug: string) {
  return `/${idOrSlug}`;
}

export function panelPath(panel: PanelId) {
  return viewToPath({ kind: "cv", section: panel });
}

export function crumbsFor(view: AppView) {
  if (view.kind === "start") return [{ href: "/", label: "Home" }];
  if (view.kind === "begin") {
    const crumbs = [{ href: "/", label: "Home" }, { href: "/start", label: "Start" }];
    if (view.step === "upload") crumbs.push({ href: startPath("upload", view.intent), label: "Upload" });
    else if (view.step === "linkedin") crumbs.push({ href: startPath("linkedin", view.intent), label: "LinkedIn" });
    return crumbs;
  }
  if (view.kind === "about") return [{ href: "/", label: "Home" }, { href: "/about", label: "About" }];
  if (view.kind === "contact") return [{ href: "/", label: "Home" }, { href: "/contact", label: "Contact" }];
  if (view.kind === "profile") return [{ href: "/", label: "Home" }, { href: "/profile", label: "Profile" }];
  if (view.kind === "examples") return [{ href: "/", label: "Home" }, { href: "/examples", label: SECTION_LABEL.examples }];
  if (view.kind === "public") return [{ href: "/", label: "Home" }, { href: publicResumePath(view.id), label: "Shared resume" }];
  if (view.kind === "not-found") return [{ href: "/", label: "Home" }];
  return [
    { href: "/", label: "Home" },
    { href: "/cv/details", label: "My CV" },
    { href: panelPath(view.section), label: SECTION_LABEL[view.section] || "Section" },
  ];
}
