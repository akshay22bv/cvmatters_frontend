import type { ResumeData } from "./types";

export type PublicResumeDataLike = {
  personal?: {
    fullName?: string;
    title?: string;
    location?: string;
    photoUrl?: string;
  };
  summary?: string;
  bio?: string;
  accent?: string;
  experience?: Array<{
    role?: string;
    company?: string;
    dates?: string;
    bullets?: string[];
  }>;
  education?: Array<{
    degree?: string;
    school?: string;
    dates?: string;
  }>;
  skills?: {
    industry?: string[];
    tools?: string[];
    other?: string[];
  };
  extras?: Array<{
    title?: string;
    items?: string[];
  }>;
};

/**
 * True when a public resume has real user-entered content rather than an empty
 * blank draft (which would otherwise render "Your name / Your skills will show here").
 */
export function hasPublicResumeContent(data?: PublicResumeDataLike | ResumeData | null): boolean {
  if (!data || typeof data !== "object") return false;
  const personal = data.personal || {};
  const hasName = Boolean(personal.fullName?.trim());
  const hasTitle = Boolean(personal.title?.trim());

  const summaryText = (data.summary || ("bio" in data ? data.bio : "") || "").trim();
  const hasSummary = summaryText.length >= 10;

  const hasExperience =
    Array.isArray(data.experience) &&
    data.experience.some(
      (entry) =>
        Boolean(entry?.role?.trim()) ||
        Boolean(entry?.company?.trim()) ||
        (Array.isArray(entry?.bullets) && entry.bullets.some((bullet) => Boolean(bullet?.trim()))),
    );

  const hasEducation =
    Array.isArray(data.education) &&
    data.education.some((entry) => Boolean(entry?.degree?.trim()) || Boolean(entry?.school?.trim()));

  const hasSkills = collectPublicSkills(data, 1).length > 0;

  const hasExtras =
    Array.isArray(data.extras) &&
    data.extras.some(
      (section) =>
        Boolean(section?.title?.trim()) &&
        Array.isArray(section?.items) &&
        section.items.some((item) => Boolean(item?.trim())),
    );

  const sectionCount = [hasSummary, hasExperience, hasEducation, hasSkills, hasExtras].filter(Boolean).length;
  if ((hasName || hasTitle) && sectionCount >= 1) return true;
  return sectionCount >= 2;
}

export function collectPublicSkills(data?: PublicResumeDataLike | ResumeData | null, limit = 6): string[] {
  if (!data?.skills) return [];
  const raw = [
    ...(Array.isArray(data.skills.industry) ? data.skills.industry : []),
    ...(Array.isArray(data.skills.tools) ? data.skills.tools : []),
    ...(Array.isArray(data.skills.other) ? data.skills.other : []),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const clean = typeof item === "string" ? item.trim() : "";
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
    if (out.length >= limit) break;
  }
  return out;
}

export function firstExperienceLine(data?: PublicResumeDataLike | ResumeData | null): string {
  if (!Array.isArray(data?.experience)) return "";
  for (const entry of data.experience) {
    const role = entry?.role?.trim() || "";
    const company = entry?.company?.trim() || "";
    if (role && company) return `${role} at ${company}`;
    if (role) return role;
    if (company) return company;
  }
  return "";
}

export function buildPublicResumeDescription(
  data: PublicResumeDataLike | ResumeData | null | undefined,
  fallbackName: string,
  siteName: string,
): string {
  const name = data?.personal?.fullName?.trim() || fallbackName;
  const role = data?.personal?.title?.trim() || "";
  const location = data?.personal?.location?.trim() || "";
  const summary = (data?.summary || ("bio" in (data || {}) ? (data as PublicResumeDataLike).bio : "") || "")
    .trim()
    .replace(/\s+/g, " ");

  if (summary.length >= 30) {
    return summary.length > 160 ? `${summary.slice(0, 157).trimEnd()}…` : summary;
  }

  const parts: string[] = [];
  if (role) parts.push(`${name} — ${role}${location ? ` (${location})` : ""}.`);
  else if (location) parts.push(`${name} (${location}).`);
  else parts.push(`${name}'s resume on ${siteName}.`);

  const exp = firstExperienceLine(data);
  if (exp && !role.toLowerCase().includes(exp.toLowerCase())) {
    parts.push(`Experience: ${exp}.`);
  }

  const skills = collectPublicSkills(data, 5);
  if (skills.length) {
    parts.push(`Skills: ${skills.join(", ")}.`);
  }

  const joined = parts.join(" ");
  return joined.length > 160 ? `${joined.slice(0, 157).trimEnd()}…` : joined;
}

export function safeOgHexColor(raw?: string): string {
  const value = (raw || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return "#10a37f";
}
