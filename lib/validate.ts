import type { ResumeData } from "./types";

/**
 * The wording the forms use when something necessary is missing. Kept in one
 * place so every step says it the same way.
 */
export function missing(what: string) {
  return `Enter ${what}.`;
}

export type Errors = Record<string, string>;

function started(values: Array<string | undefined>) {
  return values.some((value) => (value || "").trim());
}

/**
 * What is missing on the screen currently open, keyed by field.
 * Summary, skills, extras, the job post, and an empty work or school list
 * never block Continue. A role or a school only asks for its name once
 * someone has started writing in that row.
 */
export function stepErrors(panel: string | null, _page: number, data: ResumeData): Errors {
  const errors: Errors = {};

  if (panel === "details") {
    if (!data.personal.fullName.trim()) errors.fullName = missing("your full name");
    if (!data.personal.title.trim()) errors.title = missing("your job title");
    if (!data.personal.email.trim()) errors.email = missing("an email address");
    else if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(data.personal.email.trim())) {
      errors.email = "That email address doesn't look right.";
    }
  }

  if (panel === "experience") {
    for (const job of data.experience) {
      if (!started([job.role, job.company, job.location, job.start, job.end, ...job.bullets])) continue;
      if (!job.role.trim()) errors[`role:${job.id}`] = missing("a job title");
      if (!job.company.trim()) errors[`company:${job.id}`] = missing("the employer");
    }
  }

  if (panel === "education") {
    for (const item of data.education) {
      if (!started([item.degree, item.school, item.year, item.detail])) continue;
      if (!item.degree.trim()) errors[`degree:${item.id}`] = missing("a degree");
      if (!item.school.trim()) errors[`school:${item.id}`] = missing("a school");
    }
  }

  return errors;
}
