import type { ResumeData, StepId } from "./types";

export type Checkpoint = {
  id: StepId;
  label: string;
  hint: string;
  done: boolean;
  tally: string;
};

/**
 * What the nav shows for each section: whether it is filled in and a short
 * tally so the menu reads like a status board rather than a list of links.
 */
export function checkpoints(data: ResumeData): Checkpoint[] {
  const { personal, summary, experience, education, skills } = data;
  const skillCount = skills.industry.length + skills.tools.length + skills.other.length;
  const bulletCount = experience.reduce((total, role) => total + role.bullets.filter((line) => line.trim()).length, 0);

  return [
    {
      id: "details",
      label: "Your details",
      hint: "Name, contact, and where you are based",
      done: !!(personal.fullName.trim() && personal.title.trim() && personal.email.trim()),
      tally: personal.fullName.trim() ? personal.fullName.trim().split(/\s+/)[0] : "Empty",
    },
    {
      id: "bio",
      label: "Short bio",
      hint: "Two or three lines up top",
      done: summary.trim().length > 60,
      tally: summary.trim() ? `${summary.trim().split(/\s+/).length} words` : "Empty",
    },
    {
      id: "experience",
      label: "Experience",
      hint: "Roles, dates and highlights",
      done: experience.length > 0 && bulletCount > 0,
      tally: experience.length ? `${experience.length} ${experience.length === 1 ? "role" : "roles"}` : "Empty",
    },
    {
      id: "education",
      label: "Education",
      hint: "Schools, degrees and years",
      done: education.length > 0,
      tally: education.length ? `${education.length} ${education.length === 1 ? "entry" : "entries"}` : "Empty",
    },
    {
      id: "skills",
      label: "Skills",
      hint: "Tools, knowledge and extras",
      done: skillCount >= 4,
      tally: skillCount ? `${skillCount} tags` : "Empty",
    },
  ];
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
