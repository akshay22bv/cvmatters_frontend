import { CATALOG } from "./catalog";
import { keywords } from "./keywords";
import { FONT_SIZE, FONTS, readMetric, templateHasPhoto, templateName, type PanelId, type ResumeData, type TemplateId } from "./types";

export type AtsGroupId = "design" | "structure" | "content";
export type AtsFix = PanelId | "template";

export type AtsCheck = {
  id: string;
  group: AtsGroupId;
  title: string;
  detail: string;
  status: "pass" | "warn";
  weight: number;
  fix?: AtsFix;
};

export type AtsGroup = {
  id: AtsGroupId;
  label: string;
  score: number;
  checks: AtsCheck[];
};

export type AtsReport = {
  score: number;
  label: string;
  groups: AtsGroup[];
  repeats: { word: string; count: number }[];
  keywords: { matched: string[]; missing: string[] } | null;
};

export type AtsResult = {
  score: number;
  label: string;
  tips: string[];
};

const GROUPS: { id: AtsGroupId; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "structure", label: "Structure" },
  { id: "content", label: "Content" },
];

function wordsOf(text: string) {
  return text
    .replace(/[*~+]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function hasYear(value: string) {
  return /\b(19|20)\d{2}\b/.test(value);
}

function scoreOf(checks: AtsCheck[]) {
  const possible = checks.reduce((total, check) => total + check.weight, 0);
  const earned = checks.reduce((total, check) => total + (check.status === "pass" ? check.weight : 0), 0);
  return possible ? Math.round((earned / possible) * 100) : 0;
}

function labelFor(score: number) {
  if (score >= 85) return "Strong";
  if (score >= 75) return "Good";
  return score >= 50 ? "Almost" : "Needs work";
}

/**
 * The checks a typical applicant tracking system fails people on: a page it
 * can read, the usual sections with dates, and words a posting would match.
 * Not one vendor's software.
 */
export function atsReport(
  data: ResumeData,
  extra: { templateId?: TemplateId; jobDescription?: string } = {},
): AtsReport {
  const templateId = extra.templateId || "mint";
  const layout = CATALOG.find((item) => item.id === templateId);
  const name = templateName(templateId);
  const personal = data.personal;
  const typeSize = readMetric(FONT_SIZE, data.typeSize);
  const font = FONTS.find((item) => item.id === data.fontId)?.name || "Google Sans";
  const summaryWords = wordsOf(data.summary);
  const roles = data.experience;
  const bullets = roles.flatMap((job) => job.bullets.map((line) => line.trim()).filter(Boolean));
  const skills = [...data.skills.industry, ...data.skills.tools, ...data.skills.other].map((item) => item.trim()).filter(Boolean);
  const email = personal.email.trim();
  const opens = new Map<string, number>();
  for (const line of bullets) {
    const first = (line.replace(/[*~+]/g, "").match(/[A-Za-z]{3,}/) || [""])[0].toLowerCase();
    if (!first) continue;
    opens.set(first, (opens.get(first) || 0) + 1);
  }
  const repeats = [...opens.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));
  const loud = repeats.find((item) => item.count >= 3);

  const checks: AtsCheck[] = [
    layout?.kind === "two"
      ? {
          id: "columns",
          group: "design",
          title: "Single column",
          detail: `${name} puts text in two columns. A parser often reads the side column as a jumble. A one-column template is safer.`,
          status: "warn",
          weight: 8,
          fix: "template",
        }
      : {
          id: "columns",
          group: "design",
          title: "Single column",
          detail: `${name} keeps the page in one column, so a parser reads it top to bottom.`,
          status: "pass",
          weight: 8,
        },
    templateHasPhoto(templateId)
      ? {
          id: "photo",
          group: "design",
          title: "No photo",
          detail: `${name} includes a photo. Many systems drop the image, and some reject the file for it.`,
          status: "warn",
          weight: 6,
          fix: "template",
        }
      : {
          id: "photo",
          group: "design",
          title: "No photo",
          detail: "This template has no photo, so nothing important is locked inside an image.",
          status: "pass",
          weight: 6,
        },
    {
      id: "font",
      group: "design",
      title: "Standard typeface",
      detail: `${font} is a normal text face. A parser does not have to guess a display font.`,
      status: "pass",
      weight: 4,
    },
    typeSize < 10 || typeSize > 12
      ? {
          id: "size",
          group: "design",
          title: "Readable type size",
          detail: `Body type is ${typeSize}pt. 10–12pt is the range both a parser and a person read without strain.`,
          status: "warn",
          weight: 5,
          fix: "template",
        }
      : {
          id: "size",
          group: "design",
          title: "Readable type size",
          detail: `Body type is ${typeSize}pt, inside the 10–12pt range.`,
          status: "pass",
          weight: 5,
        },
    {
      id: "bars",
      group: "design",
      title: "Skills as words",
      detail: "Skills are written out. There are no bars, dots, or icons for a parser to skip.",
      status: "pass",
      weight: 4,
    },
    {
      id: "text",
      group: "design",
      title: "Text, not a picture",
      detail: "The page is real text. A system can copy the words instead of guessing at a screenshot.",
      status: "pass",
      weight: 4,
    },
    {
      id: "headings",
      group: "design",
      title: "Plain section labels",
      detail: "Section labels are ordinary words, not pictures of headings.",
      status: "pass",
      weight: 3,
    },
  ];

  const push = (check: AtsCheck) => checks.push(check);

  push(
    personal.fullName.trim()
      ? { id: "name", group: "structure", title: "Name", detail: "Your name is on the page.", status: "pass", weight: 6 }
      : { id: "name", group: "structure", title: "Name", detail: "Add your name. A parser uses it as the record title.", status: "warn", weight: 6, fix: "details" },
  );
  push(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? { id: "email", group: "structure", title: "Email", detail: "The email looks like an address a system can store.", status: "pass", weight: 6 }
      : { id: "email", group: "structure", title: "Email", detail: "Add a normal email address. This is how a system files the application.", status: "warn", weight: 6, fix: "details" },
  );
  push(
    personal.phone.trim() || personal.location.trim()
      ? { id: "reach", group: "structure", title: "Phone or city", detail: "A phone number or a city is on the page.", status: "pass", weight: 4 }
      : { id: "reach", group: "structure", title: "Phone or city", detail: "Add a phone number or a city so the record is not only a name.", status: "warn", weight: 4, fix: "details" },
  );
  push(
    personal.title.trim()
      ? { id: "title", group: "structure", title: "Job title", detail: "A job title sits under the name.", status: "pass", weight: 4 }
      : { id: "title", group: "structure", title: "Job title", detail: "Add the title you are going for. Systems match that line to the role.", status: "warn", weight: 4, fix: "details" },
  );
  push(
    personal.linkedin.trim() || personal.github.trim() || personal.website.trim() || personal.portfolio.trim()
      ? { id: "links", group: "structure", title: "A profile link", detail: "A profile or portfolio link is written as text.", status: "pass", weight: 2 }
      : { id: "links", group: "structure", title: "A profile link", detail: "Add a LinkedIn, GitHub, or portfolio link as plain text.", status: "warn", weight: 2, fix: "details" },
  );
  push(
    summaryWords.length > 0
      ? { id: "summary-there", group: "structure", title: "Summary section", detail: "There is a summary at the top.", status: "pass", weight: 4 }
      : { id: "summary-there", group: "structure", title: "Summary section", detail: "Add a summary. Parsers expect a block of text before the roles.", status: "warn", weight: 4, fix: "bio" },
  );
  push(
    roles.length
      ? { id: "roles", group: "structure", title: "Experience section", detail: `${roles.length === 1 ? "One role is" : `${roles.length} roles are`} on the page.`, status: "pass", weight: 6 }
      : { id: "roles", group: "structure", title: "Experience section", detail: "Add at least one role. Without it, the file looks empty.", status: "warn", weight: 6, fix: "experience" },
  );

  if (roles.length) {
    const named = roles.filter((job) => job.role.trim() && job.company.trim());
    push(
      named.length === roles.length
        ? { id: "role-name", group: "structure", title: "Role and company", detail: "Every role has a title and a company.", status: "pass", weight: 5 }
        : { id: "role-name", group: "structure", title: "Role and company", detail: "Give every role a title and a company name.", status: "warn", weight: 5, fix: "experience" },
    );

    const dated = roles.filter((job) => job.start.trim() && (job.current || job.end.trim()));
    push(
      dated.length === roles.length
        ? { id: "dates", group: "structure", title: "Start and end dates", detail: "Every role has a start date and an end, or is marked current.", status: "pass", weight: 6 }
        : { id: "dates", group: "structure", title: "Start and end dates", detail: "Give every role a start date and an end date, or mark it current.", status: "warn", weight: 6, fix: "experience" },
    );

    const years = roles.filter((job) => hasYear(job.start) || hasYear(job.end));
    push(
      years.length === roles.length
        ? { id: "years", group: "structure", title: "Dates include a year", detail: "Each role's dates include a four-digit year.", status: "pass", weight: 4 }
        : { id: "years", group: "structure", title: "Dates include a year", detail: "Write a four-digit year on every role, like 03/2022.", status: "warn", weight: 4, fix: "experience" },
    );
  }

  const schools = data.education.filter((item) => item.degree.trim() && item.school.trim());
  push(
    data.education.length > 0 && schools.length === data.education.length
      ? { id: "school", group: "structure", title: "Education", detail: "Each school line has a qualification and a school.", status: "pass", weight: 5 }
      : { id: "school", group: "structure", title: "Education", detail: "Add a qualification and the school or course it came from.", status: "warn", weight: 5, fix: "education" },
  );
  push(
    skills.length >= 4
      ? { id: "skill-list", group: "structure", title: "Skills section", detail: `${skills.length} skills are listed as separate words.`, status: "pass", weight: 5 }
      : { id: "skill-list", group: "structure", title: "Skills section", detail: "List at least four skills. Parsers match those words to the posting.", status: "warn", weight: 5, fix: "skills" },
  );

  push(
    summaryWords.length >= 40 && summaryWords.length <= 120
      ? { id: "summary-length", group: "content", title: "Summary length", detail: `The summary is ${summaryWords.length} words, enough to scan and short enough to read.`, status: "pass", weight: 6 }
      : {
          id: "summary-length",
          group: "content",
          title: "Summary length",
          detail:
            summaryWords.length > 120
              ? `The summary is ${summaryWords.length} words. Cut it toward 40–80 so the first screen stays about the role.`
              : "Stretch the summary to about 40 words. Say the work you do and the kind of role.",
          status: "warn",
          weight: 6,
          fix: "bio",
        },
  );

  if (roles.length) {
    const thin = roles.filter((job) => job.bullets.filter((line) => line.trim()).length < 2);
    push(
      thin.length === 0
        ? { id: "bullets", group: "content", title: "Two bullets a role", detail: "Every role has at least two bullets.", status: "pass", weight: 6 }
        : { id: "bullets", group: "content", title: "Two bullets a role", detail: "Give every role at least two bullets. One line is too thin to match.", status: "warn", weight: 6, fix: "experience" },
    );

    const short = bullets.filter((line) => wordsOf(line).length < 6);
    push(
      bullets.length > 0 && short.length <= Math.floor(bullets.length / 3)
        ? { id: "bullet-length", group: "content", title: "Bullets say what happened", detail: "Most bullets are a full line, not a fragment.", status: "pass", weight: 4 }
        : { id: "bullet-length", group: "content", title: "Bullets say what happened", detail: "Some bullets are only a few words. Say what you did and what changed.", status: "warn", weight: 4, fix: "experience" },
    );

    const measured = bullets.filter((line) => /\d/.test(line));
    push(
      measured.length > 0
        ? { id: "numbers", group: "content", title: "A number in the work", detail: "At least one bullet includes a number, which is easy to scan.", status: "pass", weight: 4 }
        : { id: "numbers", group: "content", title: "A number in the work", detail: "Add a number to a bullet: people, time, or a result. Parsers and people both stop on it.", status: "warn", weight: 4, fix: "experience" },
    );
  }

  push(
    skills.length >= 8
      ? { id: "skill-count", group: "content", title: "Enough skills to match", detail: `${skills.length} skills give a posting something to match.`, status: "pass", weight: 5 }
      : { id: "skill-count", group: "content", title: "Enough skills to match", detail: "Name a few more skills, aiming for eight. Use the words the posting uses.", status: "warn", weight: 5, fix: "skills" },
  );

  push(
    loud
      ? {
          id: "repeats",
          group: "content",
          title: "Varied opening words",
          detail: `“${loud.word}” opens ${loud.count} bullets. Start the next ones with a different verb.`,
          status: "warn",
          weight: 4,
          fix: "experience",
        }
      : { id: "repeats", group: "content", title: "Varied opening words", detail: "Bullets do not all start with the same word.", status: "pass", weight: 4 },
  );

  const job = (extra.jobDescription || "").trim();
  const isLink = /^https?:\/\/\S+$/i.test(job);
  let keywordResult: AtsReport["keywords"] = null;
  if (!job || isLink) {
    push({
      id: "job-words",
      group: "content",
      title: "Words from the job",
      detail: isLink ? "That field is only a link. Paste the posting text so its words can be compared." : "Paste a job post to see which of its words are missing from this CV.",
      status: "warn",
      weight: 6,
      fix: "job",
    });
  } else {
    const found = keywords(job);
    const resume = [
      personal.fullName,
      personal.title,
      data.summary,
      ...roles.flatMap((item) => [item.role, item.company, ...item.bullets]),
      ...data.education.flatMap((item) => [item.degree, item.school, item.detail]),
      ...skills,
    ]
      .join(" ")
      .toLowerCase()
      .replace(/[*~+]/g, "");
    const matched = found.filter((word) => resume.includes(word));
    const missing = found.filter((word) => !resume.includes(word));
    keywordResult = found.length ? { matched, missing } : null;
    const ratio = found.length ? matched.length / found.length : 1;
    push(
      ratio >= 0.5
        ? {
            id: "job-words",
            group: "content",
            title: "Words from the job",
            detail: found.length ? `${matched.length} of ${found.length} repeated words from the posting already appear.` : "The posting did not yield words to match.",
            status: "pass",
            weight: 6,
          }
        : {
            id: "job-words",
            group: "content",
            title: "Words from the job",
            detail: `${matched.length} of ${found.length} repeated words from the posting appear. Work in ${missing.slice(0, 3).join(", ") || "the missing ones"} where they are true.`,
            status: "warn",
            weight: 6,
            fix: "job",
          },
    );
  }

  const groups = GROUPS.map((group) => {
    const mine = checks.filter((check) => check.group === group.id);
    return { ...group, checks: mine, score: scoreOf(mine) };
  });

  return {
    score: scoreOf(checks),
    label: labelFor(scoreOf(checks)),
    groups,
    repeats,
    keywords: keywordResult,
  };
}

export function atsScore(data: ResumeData, extra?: { templateId?: TemplateId; jobDescription?: string }): AtsResult {
  const report = atsReport(data, extra);
  const tips = report.groups
    .flatMap((group) => group.checks)
    .filter((check) => check.status === "warn")
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((check) => check.detail);
  return { score: report.score, label: report.label, tips };
}
