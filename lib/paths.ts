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
  | { kind: "cv"; section: PanelId };

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
  "api",
  "backend",
  "cv",
  "examples",
  "home",
  "login",
  "logout",
  "me",
  "profile",
  "r",
  "settings",
  "signup",
  "admin",
  "auth",
  "about",
  "contact",
  "help",
  "support",
  "billing",
  "plans",
  "blog",
  "start",
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
  examples: "Your field",
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

export function viewToPath(view: AppView) {
  if (view.kind === "start") return "/";
  if (view.kind === "begin") return startPath(view.step, view.intent);
  if (view.kind === "about") return "/about";
  if (view.kind === "contact") return "/contact";
  if (view.kind === "profile") return "/profile";
  if (view.kind === "examples") return "/examples";
  if (view.kind === "public") return publicResumePath(view.id);
  return `/cv/${PANEL_TO_SLUG[view.section] || "details"}`;
}

export function pathToView(pathname: string, search = ""): AppView {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if (parts.length === 0 || parts[0] === "home") return { kind: "start" };
  if (parts[0] === "start") {
    return {
      kind: "begin",
      step: parseStartStep(parts[1]),
      intent: parseStartIntent(params.get("intent")),
    };
  }
  if (parts[0] === "profile") return { kind: "profile" };
  if (parts[0] === "about") return { kind: "about" };
  if (parts[0] === "contact") return { kind: "contact" };
  if (parts[0] === "examples") return { kind: "examples" };
  // Legacy `/r/name` still works; prefer bare `/name`.
  if (parts[0] === "r" && parts[1]) {
    return { kind: "public", id: parts[1] };
  }
  if (parts[0] === "cv") {
    const section = SLUG_TO_PANEL[parts[1] || "details"] || "details";
    return { kind: "cv", section };
  }
  if (parts.length === 1 && !RESERVED_ROOT.has(parts[0].toLowerCase())) {
    return { kind: "public", id: parts[0] };
  }
  return { kind: "start" };
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
    const crumbs = [
      { href: "/", label: "Home" },
      { href: startPath("choose", view.intent), label: "Start" },
    ];
    if (view.step === "upload") crumbs.push({ href: startPath("upload", view.intent), label: "Upload" });
    if (view.step === "linkedin") crumbs.push({ href: startPath("linkedin", view.intent), label: "LinkedIn" });
    return crumbs;
  }
  if (view.kind === "about") return [{ href: "/", label: "Home" }, { href: "/about", label: "About" }];
  if (view.kind === "contact") return [{ href: "/", label: "Home" }, { href: "/contact", label: "Contact" }];
  if (view.kind === "profile") return [{ href: "/", label: "Home" }, { href: "/profile", label: "Profile" }];
  if (view.kind === "examples") return [{ href: "/", label: "Home" }, { href: "/examples", label: "Your field" }];
  if (view.kind === "public") return [{ href: "/", label: "Home" }, { href: publicResumePath(view.id), label: "Resume" }];
  const section = viewToPath(view);
  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/cv/details", label: "My CV" },
  ];
  if (section !== "/cv/details") crumbs.push({ href: section, label: SECTION_LABEL[view.section] || "Details" });
  return crumbs;
}
