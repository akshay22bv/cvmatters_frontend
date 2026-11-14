import { resolveSectionOrder, skillTags, type BodySectionId } from "./sectionOrder";
import type { ResumeData, StepId } from "./types";

export type Checkpoint = {
  id: StepId;
  label: string;
  done: boolean;
  tally: string;
};

/**
 * What the nav shows for each section: whether it is filled in and a short
 * tally so the menu reads like a status board rather than a list of links.
 * Body rows follow the writer's sectionOrder; details stays first.
 */
export function checkpoints(data: ResumeData): Checkpoint[] {
  const { personal, summary, experience, education, skills } = data;
  const skillCount = skillTags(skills).length;
  const bulletCount = experience.reduce((total, role) => total + role.bullets.filter((line) => line.trim()).length, 0);

  const details: Checkpoint = {
    id: "details",
    label: "Your details",
    done: !!(personal.fullName.trim() && personal.title.trim() && personal.email.trim()),
    tally: personal.fullName.trim() ? personal.fullName.trim().split(/\s+/)[0] : "Empty",
  };

  const body: Record<Exclude<BodySectionId, "extras">, Checkpoint> = {
    bio: {
      id: "bio",
      label: "Summary",
      done: summary.trim().length > 0,
      tally: summary.trim()
        ? `${summary.trim().split(/\s+/).length} ${summary.trim().split(/\s+/).length === 1 ? "word" : "words"}`
        : "Empty",
    },
    experience: {
      id: "experience",
      label: "Experience",
      done: experience.length > 0 && bulletCount > 0,
      tally: experience.length ? `${experience.length} ${experience.length === 1 ? "role" : "roles"}` : "Empty",
    },
    education: {
      id: "education",
      label: "Education",
      done: education.length > 0,
      tally: education.length ? `${education.length} ${education.length === 1 ? "entry" : "entries"}` : "Empty",
    },
    skills: {
      id: "skills",
      label: "Skills",
      done: skillCount >= 4,
      tally: skillCount ? `${skillCount} tags` : "Empty",
    },
  };

  const order = resolveSectionOrder(data).filter((id): id is Exclude<BodySectionId, "extras"> => id !== "extras");
  return [details, ...order.map((id) => body[id])];
}

/** 0–100 across the five sections, used by the progress ring. */
export function completeness(data: ResumeData) {
  const marks = checkpoints(data);
  return Math.round((marks.filter((mark) => mark.done).length / marks.length) * 100);
}

/** The first unfinished section, so "Continue" always lands somewhere useful. */
export function nextGap(data: ResumeData): StepId {
  return checkpoints(data).find((mark) => !mark.done)?.id || "details";
}
