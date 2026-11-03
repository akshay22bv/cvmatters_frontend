import type { PanelId } from "./types";

export type AppView =
  | { kind: "start" }
  | { kind: "profile" }
  | { kind: "examples" }
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
  reference: "examples",
  ats: "ats",
};

export const SECTION_LABEL: Record<string, string> = {
  start: "Home",
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
  reference: "Your field",
};

export function viewToPath(view: AppView) {
  if (view.kind === "start") return "/";
  if (view.kind === "profile") return "/profile";
  if (view.kind === "examples") return "/examples";
  return `/cv/${PANEL_TO_SLUG[view.section] || "details"}`;
}

export function pathToView(pathname: string): AppView {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length === 0 || parts[0] === "home") return { kind: "start" };
  if (parts[0] === "profile") return { kind: "profile" };
  if (parts[0] === "examples") return { kind: "examples" };
  if (parts[0] === "cv") {
    const section = SLUG_TO_PANEL[parts[1] || "details"] || "details";
    return { kind: "cv", section };
  }
  return { kind: "start" };
}

export function panelPath(panel: PanelId) {
  if (panel === "reference") return "/examples";
  return viewToPath({ kind: "cv", section: panel });
}

export function crumbsFor(view: AppView) {
  if (view.kind === "start") return [{ href: "/", label: "Home" }];
  if (view.kind === "profile") return [{ href: "/", label: "Home" }, { href: "/profile", label: "Profile" }];
  if (view.kind === "examples") return [{ href: "/", label: "Home" }, { href: "/examples", label: "Your field" }];
  const section = viewToPath(view);
  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/cv/details", label: "My CV" },
  ];
  if (section !== "/cv/details") crumbs.push({ href: section, label: SECTION_LABEL[view.section] || "Details" });
  return crumbs;
}
