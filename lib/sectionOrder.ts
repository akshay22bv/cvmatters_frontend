import { isValidElement, type ReactNode } from "react";

/** Body blocks that can move on the page. Header / details stay first. */
export type BodySectionId = "bio" | "experience" | "education" | "skills" | "extras";

export const DEFAULT_SECTION_ORDER: BodySectionId[] = [
  "bio",
  "experience",
  "education",
  "skills",
  "extras",
];

const BODY = new Set<string>(DEFAULT_SECTION_ORDER);

export function isBodySectionId(value: string): value is BodySectionId {
  return BODY.has(value);
}

/** Saved order plus any missing defaults, so older resumes still render fully. */
export function resolveSectionOrder(data: { sectionOrder?: string[] | null }): BodySectionId[] {
  const saved = (data.sectionOrder || []).filter(isBodySectionId);
  if (!saved.length) return [...DEFAULT_SECTION_ORDER];
  const seen = new Set(saved);
  return [...saved, ...DEFAULT_SECTION_ORDER.filter((id) => !seen.has(id))];
}

/** Sections the writer turned off on the compare page. Details always stay on. */
export function resolveHiddenSections(data: { hiddenSections?: string[] | null }): BodySectionId[] {
  return (data.hiddenSections || []).filter(isBodySectionId);
}

export function sectionOnCv(data: { hiddenSections?: string[] | null }, id: BodySectionId) {
  return !resolveHiddenSections(data).includes(id);
}

/** What actually paints on the page — respects hide toggles and skips an empty summary. */
export function sectionRenders(
  data: { hiddenSections?: string[] | null; summary?: string | null },
  id: BodySectionId,
) {
  if (!sectionOnCv(data, id)) return false;
  if (id === "bio") return !!(data.summary || "").trim();
  return true;
}

/** Hidden toggles plus sections with nothing to show (empty summary). */
export function sectionsOmittedFromPage(data: {
  hiddenSections?: string[] | null;
  summary?: string | null;
}): BodySectionId[] {
  const hidden = resolveHiddenSections(data);
  if (!(data.summary || "").trim() && !hidden.includes("bio")) return [...hidden, "bio"];
  return hidden;
}

export function toggleHiddenSection(
  data: { hiddenSections?: string[] | null },
  id: BodySectionId,
): BodySectionId[] {
  const hidden = resolveHiddenSections(data);
  return hidden.includes(id) ? hidden.filter((item) => item !== id) : [...hidden, id];
}

export function moveSectionOrder(
  order: BodySectionId[],
  fromId: BodySectionId,
  toId: BodySectionId,
): BodySectionId[] {
  if (fromId === toId) return order;
  const next = [...order];
  const from = next.indexOf(fromId);
  const to = next.indexOf(toId);
  if (from < 0 || to < 0) return order;
  next.splice(from, 1);
  next.splice(to, 0, fromId);
  return next;
}

/** Max skills in one list (editor + API). */
export const SKILL_MAX = 40;

/** Flat skill tags — no industry / tools / other buckets on the page. */
export function skillTags(skills: { industry?: string[]; tools?: string[]; other?: string[] } | null | undefined) {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const list of [skills?.industry || [], skills?.tools || [], skills?.other || []]) {
    for (const item of list) {
      const key = item.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      tags.push(item.trim());
    }
  }
  return tags;
}

export function flatSkills(tags: string[]) {
  const industry = skillTags({ industry: tags, tools: [], other: [] }).slice(0, SKILL_MAX);
  return { industry, tools: [] as string[], other: [] as string[] };
}

function pieceSection(node: ReactNode): string | undefined {
  if (!isValidElement(node)) return undefined;
  return (node.props as { section?: string }).section;
}

/**
 * Keep header / non-body blocks in place, then emit body groups in the
 * writer's chosen order. Relative order inside a section (e.g. jobs) is kept.
 * Hidden sections are dropped entirely.
 */
export function orderPieces(
  pieces: ReactNode[],
  order: BodySectionId[],
  hidden: BodySectionId[] = [],
): ReactNode[] {
  const skip = new Set(hidden);
  const prefix: ReactNode[] = [];
  const buckets: Partial<Record<BodySectionId, ReactNode[]>> = {};
  const suffix: ReactNode[] = [];
  let inBody = false;

  for (const piece of pieces) {
    const section = pieceSection(piece);
    if (section && isBodySectionId(section)) {
      inBody = true;
      if (skip.has(section)) continue;
      (buckets[section] ||= []).push(piece);
      continue;
    }
    if (inBody) suffix.push(piece);
    else prefix.push(piece);
  }

  const used = new Set<BodySectionId>();
  const body: ReactNode[] = [];
  for (const id of order) {
    if (skip.has(id)) continue;
    const group = buckets[id];
    if (!group?.length) continue;
    body.push(...group);
    used.add(id);
  }
  for (const id of DEFAULT_SECTION_ORDER) {
    if (skip.has(id) || used.has(id)) continue;
    const group = buckets[id];
    if (group?.length) body.push(...group);
  }

  return [...prefix, ...body, ...suffix];
}
