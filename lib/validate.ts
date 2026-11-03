import type { ResumeData } from "./types";

/**
 * The wording the forms use when something necessary is missing. Kept in one
 * place so every step says it the same way.
 */
export function missing(what: string) {
  return `Enter ${what}.`;
}

export type Errors = Record<string, string>;

/** What is missing on the screen currently open, keyed by field. */
export function stepErrors(panel: string | null, page: number, data: ResumeData): Errors {
  const errors: Errors = {};

  if (panel === "details") {
    if (!data.personal.fullName.trim()) errors.fullName = missing("your full name");
    if (!data.personal.title.trim()) errors.title = missing("your job title");
    if (!data.personal.email.trim()) errors.email = missing("an email address");
    else if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(data.personal.email.trim())) {
      errors.email = "That email address doesn't look right.";
    }
  }

  if (panel === "bio" && !data.summary.trim()) {
    errors.summary = missing("a summary");
  }

  if (panel === "experience") {
    for (const job of data.experience) {
      if (!job.role.trim()) errors[`role:${job.id}`] = missing("a job title");
      if (!job.company.trim()) errors[`company:${job.id}`] = missing("the employer");
    }
  }

  if (panel === "education") {
    for (const item of data.education) {
      if (!item.degree.trim()) errors[`degree:${item.id}`] = missing("a degree");
      if (!item.school.trim()) errors[`school:${item.id}`] = missing("a school");
    }
  }

  return errors;
}
