"use client";

import type { ReactNode } from "react";
import { FormattedText, RichLine } from "./Formatted";
import { Monogram } from "./Monogram";
import { plainRange } from "@/lib/content";
import type { ResumeData } from "@/lib/types";

function linkLabel(value: string) {
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

export function MetaIcon({ kind }: { kind: "pin" | "phone" | "mail" | "linkedin" | "github" | "web" | "calendar" }) {
  if (kind === "phone") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.1 2.6h2l.9 2.2-1.2.9a7.2 7.2 0 0 0 3.5 3.5l.9-1.2 2.2.9v2a1.1 1.1 0 0 1-1.2 1.1A9.4 9.4 0 0 1 3 3.8a1.1 1.1 0 0 1 1.1-1.2Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "mail") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.6" y="3.4" width="12.8" height="9.2" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.2 4.4 8 8.6l5.8-4.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "linkedin") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path fill="currentColor" d="M3.4 6.1h2v6.6h-2V6.1Zm1-3.1a1.15 1.15 0 1 1-1.15 1.15A1.15 1.15 0 0 1 4.4 3Zm2.5 3.1h1.9v.9h.1a2.1 2.1 0 0 1 1.9-1c2 0 2.4 1.3 2.4 3v3.7h-2V9.3c0-.8 0-1.8-1.1-1.8s-1.3.9-1.3 1.7v3.5H6.9V6.1Z" />
      </svg>
    );
  }
  if (kind === "github") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path fill="currentColor" d="M8 1.4a6.6 6.6 0 0 0-2.1 12.86c.33.06.45-.14.45-.32v-1.12c-1.82.4-2.2-.87-2.2-.87-.3-.76-.73-.96-.73-.96-.6-.4.04-.4.04-.4.66.05 1 .68 1 .68.58 1 1.53.72 1.9.55.06-.42.23-.72.41-.88-1.45-.16-2.98-.73-2.98-3.23 0-.71.25-1.3.67-1.75-.07-.17-.29-.84.06-1.75 0 0 .55-.18 1.8.67a6.2 6.2 0 0 1 3.28 0c1.25-.85 1.8-.67 1.8-.67.35.91.13 1.58.06 1.75.42.45.67 1.04.67 1.75 0 2.51-1.53 3.07-3 3.23.24.2.45.6.45 1.21v1.8c0 .18.12.38.45.32A6.6 6.6 0 0 0 8 1.4Z" />
      </svg>
    );
  }
  if (kind === "web") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.5 8h11M8 2.4c1.6 1.7 2.4 3.5 2.4 5.6S9.6 11.9 8 13.6C6.4 11.9 5.6 10.1 5.6 8S6.4 4.1 8 2.4Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  }
  if (kind === "calendar") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2.2" y="3.4" width="11.6" height="10.2" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.2 6.4h11.6M5.2 2.2v2.4M10.8 2.2v2.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 14.2s4-3.4 4-6.1A4 4 0 0 0 8 4.1a4 4 0 0 0-4 4c0 2.7 4 6.1 4 6.1Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

type ContactKind = "pin" | "phone" | "mail" | "linkedin" | "github" | "web";

export function contactRows(personal: ResumeData["personal"], hideContact?: boolean) {
  const place = [personal.location, personal.pincode].filter(Boolean).join(" ");
  const rows: { kind: ContactKind; text: string }[] = [];
  if (!hideContact && personal.phone) rows.push({ kind: "phone", text: personal.phone });
  if (!hideContact && personal.email) rows.push({ kind: "mail", text: personal.email });
  if (place) rows.push({ kind: "pin", text: place });
  if (personal.linkedin) rows.push({ kind: "linkedin", text: linkLabel(personal.linkedin) });
  if (personal.github) rows.push({ kind: "github", text: linkLabel(personal.github) });
  if (personal.website) rows.push({ kind: "web", text: linkLabel(personal.website) });
  if (personal.portfolio) rows.push({ kind: "web", text: linkLabel(personal.portfolio) });
  return rows;
}

export function IconContacts({
  personal,
  hideContact,
  className = "ats-contacts",
}: {
  personal: ResumeData["personal"];
  hideContact?: boolean;
  className?: string;
}) {
  const rows = contactRows(personal, hideContact);
  if (!rows.length) return null;
  return (
    <div className={className}>
      {rows.map((row, index) => (
        <div className="ats-contact" key={`${row.kind}-${index}`}>
          <MetaIcon kind={row.kind} />
          <span>{row.text}</span>
        </div>
      ))}
    </div>
  );
}

function Block({ section, focus, children }: { section?: string; focus?: string; children: ReactNode }) {
  return (
    <div className="flow-block" data-section={section} data-focus={focus}>
      {children}
    </div>
  );
}

function skillList(skills: ResumeData["skills"]) {
  return [...skills.industry, ...skills.tools, ...skills.other].filter(Boolean);
}

/**
 * One flow-block per bullet so a long role can break across pages instead of
 * dragging the whole job (and leaving the previous page half empty).
 */
function pushJobBullets(
  pieces: ReactNode[],
  job: ResumeData["experience"][number],
  padClass: string,
) {
  const filled = job.bullets.filter(Boolean);
  filled.forEach((bullet, index) => {
    pieces.push(
      <Block key={`${job.id}-b${index}`} section="experience" focus={job.id}>
        <div className={`flow-li ${padClass}${index === filled.length - 1 ? " is-last" : ""}`}>
          <ul>
            <li>
              <RichLine text={bullet} />
            </li>
          </ul>
        </div>
      </Block>,
    );
  });
}

function MetaPair({ date, place }: { date?: string; place?: string }) {
  if (!date && !place) return null;
  return (
    <div className="ats-meta">
      {date ? (
        <span>
          <MetaIcon kind="calendar" />
          {date}
        </span>
      ) : null}
      {place ? (
        <span>
          <MetaIcon kind="pin" />
          {place}
        </span>
      ) : null}
    </div>
  );
}

/** Emily Miller — teal name left, contact top-right, teal rules. */
export function mintPieces(data: ResumeData, hideContact: boolean) {
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="mint-head">
        <div>
          <h1 className="mint-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="mint-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <IconContacts personal={data.personal} hideContact={hideContact} className="mint-contacts" />
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="mint-section">
        <h2 className="mint-label">Professional Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="mint-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="mint-section">
          {index === 0 && <h2 className="mint-label">Work Experience</h2>}
          <div className={`mint-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div className="mint-job-top">
              <strong>
                {[job.role, job.company, job.location].filter(Boolean).join(" · ") || "Role"}
              </strong>
              <span className="mint-date">{plainRange(job)}</span>
            </div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "mint-pad");
  });
  pieces.push(
    <Block key="edu" section="education">
      <section className="mint-section">
        <h2 className="mint-label">Education</h2>
        {data.education.map((item) => (
          <div className="mint-job" key={item.id} data-focus={item.id}>
            <div className="mint-job-top">
              <strong>{item.school || item.degree || "School"}</strong>
              <span className="mint-date">{item.year}</span>
            </div>
            {item.degree ? <div className="mint-sub"><RichLine text={item.degree} /></div> : null}
            {item.detail ? <div className="mint-sub"><RichLine text={item.detail} /></div> : null}
          </div>
        ))}
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="mint-section">
        <h2 className="mint-label">Skills</h2>
        {data.skills.industry.length ? <p className="mint-skills"><strong>Industry:</strong> {data.skills.industry.join(", ")}</p> : null}
        {data.skills.tools.length ? <p className="mint-skills"><strong>Tools:</strong> {data.skills.tools.join(", ")}</p> : null}
        {data.skills.other.length ? <p className="mint-skills"><strong>Other:</strong> {data.skills.other.join(", ")}</p> : null}
        {!skillList(data.skills).length ? <p className="placeholder-line">Your skills will show here.</p> : null}
      </section>
    </Block>,
  );
  return pieces;
}

/** Arjun Patel — dark blue header with icons. */
export function bannerPieces(data: ResumeData, hideContact: boolean) {
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="banner-head">
        <h1 className="banner-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
        <p className="banner-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        <IconContacts personal={data.personal} hideContact={hideContact} className="banner-contacts" />
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="banner-section">
        <h2 className="banner-label">Summary</h2>
        {data.summary ? (
          <FormattedText text={data.summary} className="banner-summary" />
        ) : (
          <p className="placeholder-line">Your summary will show here.</p>
        )}
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="banner-section">
        <h2 className="banner-label">Skills</h2>
        <div className="banner-skills">
          {skillList(data.skills).map((item, index) => (
            <p key={`${item}-${index}`}><RichLine text={item} /></p>
          ))}
          {!skillList(data.skills).length ? <p className="placeholder-line">Your skills will show here.</p> : null}
        </div>
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="banner-section">
          {index === 0 && <h2 className="banner-label">Professional Experience</h2>}
          <div className={`banner-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <strong>
              {[job.role, job.company].filter(Boolean).join(" | ") || "Role"}
            </strong>
            <MetaPair date={plainRange(job)} place={job.location} />
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "banner-pad");
  });
  pieces.push(
    <Block key="edu" section="education">
      <section className="banner-section">
        <h2 className="banner-label">Education</h2>
        {data.education.map((item) => (
          <div className="banner-job" key={item.id} data-focus={item.id}>
            <strong>{[item.degree, item.school].filter(Boolean).join(" | ") || "Education"}</strong>
            <MetaPair date={item.year} place={item.detail} />
          </div>
        ))}
      </section>
    </Block>,
  );
  return pieces;
}

/** Classic ATS — centred serif, pipes, date columns. */
export function formalPieces(data: ResumeData, hideContact: boolean) {
  const contacts = contactRows(data.personal, hideContact).map((row) => row.text);
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="formal-head">
        <h1 className="formal-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
        <p className="formal-contact">{contacts.length ? contacts.join(" | ") : "email | phone | city"}</p>
      </header>
    </Block>,
  ];
  if (data.summary) {
    pieces.push(
      <Block key="about" section="bio">
        <section className="formal-section">
          <h2 className="formal-label">Summary</h2>
          <FormattedText text={data.summary} className="formal-summary" />
        </section>
      </Block>,
    );
  }
  data.experience.forEach((job, index) => {
    const jobCard = (
      <div className={`formal-job${index > 0 ? " formal-job-continue" : ""}${job.bullets.some(Boolean) ? " is-split" : ""}`}>
        <div className="formal-row">
          <strong>{job.company || "Company"}</strong>
          <span>{plainRange(job)}</span>
        </div>
        <div className="formal-row is-sub">
          <em>{job.role || "Role"}</em>
          <span>{job.location}</span>
        </div>
      </div>
    );
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        {index === 0 ? (
          <section className="formal-section">
            <h2 className="formal-label">Experience</h2>
            {jobCard}
          </section>
        ) : (
          jobCard
        )}
      </Block>,
    );
    pushJobBullets(pieces, job, "formal-pad");
  });
  pieces.push(
    <Block key="edu" section="education">
      <section className="formal-section">
        <h2 className="formal-label">Education</h2>
        {data.education.map((item) => (
          <div className="formal-job" key={item.id} data-focus={item.id}>
            <div className="formal-row">
              <strong>{item.school || "School"}</strong>
              <span>{item.year}</span>
            </div>
            <div className="formal-row is-sub">
              <em>{item.degree || "Degree"}</em>
              <span>{item.detail}</span>
            </div>
          </div>
        ))}
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="formal-section">
        <h2 className="formal-label">Other</h2>
        <div className="formal-other">
          {data.skills.industry.length ? <p><strong>Industry:</strong> {data.skills.industry.join(", ")}</p> : null}
          {data.skills.tools.length ? <p><strong>Technical Skills:</strong> {data.skills.tools.join(", ")}</p> : null}
          {data.skills.other.length ? <p><strong>Other:</strong> {data.skills.other.join(", ")}</p> : null}
        </div>
      </section>
    </Block>,
  );
  return pieces;
}

/** Andrew Clark — photo top-right, main + side columns. Main flow only. */
export function apexMainPieces(data: ResumeData) {
  const pieces: ReactNode[] = [
    <Block key="about" section="bio">
      <section className="apex-section">
        <h2 className="apex-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="apex-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="apex-section">
          {index === 0 && <h2 className="apex-label">Experience</h2>}
          <div className={`apex-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <strong>{job.role || "Role"}</strong>
            <div className="apex-company"><RichLine text={job.company || "Company"} /></div>
            <MetaPair date={plainRange(job)} place={job.location} />
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "apex-pad");
  });
  return pieces;
}

export function ApexChrome({ data, hideContact }: { data: ResumeData; hideContact?: boolean }) {
  const skills = skillList(data.skills);
  const languages = (data.extras || []).find((extra) => /language/i.test(extra.title));
  const strengths = (data.extras || []).find((extra) => /strength|award|accomplishment/i.test(extra.title));
  return (
    <>
      <header className="apex-head" data-section="details">
        <div className="apex-id">
          <h1 className="apex-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="apex-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
          <IconContacts personal={data.personal} hideContact={hideContact} className="apex-contacts" />
        </div>
        <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={92} />
      </header>
      <aside className="apex-side">
        <div data-section="skills">
          <h2 className="apex-label">Skills</h2>
          <div className="apex-pills">
            {skills.map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
            {!skills.length ? <span className="placeholder-line">Skills</span> : null}
          </div>
        </div>
        {strengths ? (
          <div data-section="extras" data-focus={strengths.id}>
            <h2 className="apex-label"><RichLine text={strengths.title} /></h2>
            <div className={strengths.bullets === true ? "apex-side-list" : "apex-side-plain"}>
              {strengths.items.filter(Boolean).map((item, index) =>
                strengths.bullets === true ? (
                  <p key={index} className="apex-side-bullet"><RichLine text={item} /></p>
                ) : (
                  <p key={index}><RichLine text={item} /></p>
                ),
              )}
            </div>
          </div>
        ) : null}
        {languages ? (
          <div data-section="extras" data-focus={languages.id}>
            <h2 className="apex-label"><RichLine text={languages.title} /></h2>
            <div className={languages.bullets === true ? "apex-side-list" : "apex-side-plain"}>
              {languages.items.filter(Boolean).map((item, index) =>
                languages.bullets === true ? (
                  <p key={index} className="apex-side-bullet"><RichLine text={item} /></p>
                ) : (
                  <p key={index}><RichLine text={item} /></p>
                ),
              )}
            </div>
          </div>
        ) : null}
        <div data-section="education">
          <h2 className="apex-label">Education</h2>
          {data.education.map((item) => (
            <div className="apex-edu" key={item.id} data-focus={item.id}>
              <strong><RichLine text={item.degree || "Degree"} /></strong>
              <div>{[item.school, item.year].filter(Boolean).join(" · ")}</div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

/** Jennie Thompson — photo + grey skill sidebar. */
export function cabinetMainPieces(data: ResumeData) {
  const pieces: ReactNode[] = [
    <Block key="about" section="bio">
      <section className="cab-section">
        <h2 className="cab-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="cab-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
    <Block key="edu" section="education">
      <section className="cab-section">
        <h2 className="cab-label">Education</h2>
        {data.education.map((item) => (
          <div className="cab-job" key={item.id} data-focus={item.id}>
            <div className="cab-job-top">
              <strong>{item.degree || "Degree"}</strong>
              <span>{item.year}</span>
            </div>
            <div className="cab-sub">{[item.school, item.detail].filter(Boolean).join(" · ")}</div>
          </div>
        ))}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="cab-section">
          {index === 0 && <h2 className="cab-label">Experience</h2>}
          <div className={`cab-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div className="cab-job-top">
              <strong>{job.role || "Role"}</strong>
              <span>{plainRange(job)}</span>
            </div>
            <div className="cab-sub">{[job.company, job.location].filter(Boolean).join(" · ")}</div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "cab-pad");
  });
  return pieces;
}

export function CabinetChrome({ data, hideContact }: { data: ResumeData; hideContact?: boolean }) {
  const skills = skillList(data.skills);
  return (
    <>
      <div className="cab-bar" aria-hidden="true" />
      <header className="cab-head" data-section="details">
        <div className="cab-id">
          <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={78} />
          <div>
            <h1 className="cab-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
            <p className="cab-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
          </div>
        </div>
        <IconContacts personal={data.personal} hideContact={hideContact} className="cab-contacts" />
      </header>
      <aside className="cab-side" data-section="skills">
        <h2 className="cab-label">Skills</h2>
        <div className="cab-bars">
          {skills.map((item, index) => {
            const level = Math.max(45, 100 - index * 8);
            return (
              <div className="cab-bar-item" key={`${item}-${index}`}>
                <strong>{item}</strong>
                <span className="cab-track"><i style={{ width: `${level}%` }} /></span>
              </div>
            );
          })}
          {!skills.length ? <p className="placeholder-line">Your skills will show here.</p> : null}
        </div>
      </aside>
    </>
  );
}

function findExtra(data: ResumeData, pattern: RegExp) {
  return (data.extras || []).find((extra) => pattern.test(extra.title) && extra.items.some((item) => item.trim()));
}

function SideExtra({
  extra,
  labelClass,
  listClass,
  plainClass,
}: {
  extra: NonNullable<ReturnType<typeof findExtra>>;
  labelClass: string;
  listClass: string;
  plainClass: string;
}) {
  return (
    <div data-section="extras" data-focus={extra.id}>
      <h2 className={labelClass}><RichLine text={extra.title} /></h2>
      <div className={extra.bullets === true ? listClass : plainClass}>
        {extra.items.filter(Boolean).map((item, index) =>
          extra.bullets === true ? (
            <p key={index} className="side-bullet"><RichLine text={item} /></p>
          ) : (
            <p key={index}><RichLine text={item} /></p>
          ),
        )}
      </div>
    </div>
  );
}

/** Lorna — slate left rail, photo, dark title ribbon. */
export function manorMainPieces(data: ResumeData) {
  const pieces: ReactNode[] = [
    <Block key="about" section="bio">
      <section className="manor-section">
        <h2 className="manor-label">Profile</h2>
        {data.summary ? <FormattedText text={data.summary} className="manor-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="manor-section">
          {index === 0 && <h2 className="manor-label">Work Experience</h2>}
          <div className={`manor-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div className="manor-job-mark" aria-hidden="true" />
            <div className="manor-job-body">
              <div className="manor-job-top">
                <strong>{job.company || "Company"}</strong>
                <span>{plainRange(job)}</span>
              </div>
              <div className="manor-sub">{job.role || "Role"}</div>
            </div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "manor-pad");
  });
  return pieces;
}

export function ManorChrome({ data, hideContact }: { data: ResumeData; hideContact?: boolean }) {
  const skills = skillList(data.skills);
  const languages = findExtra(data, /language/i);
  return (
    <>
      <aside className="manor-side">
        <div className="manor-photo" data-section="details">
          <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={118} />
        </div>
        <div data-section="details">
          <h2 className="manor-label">Contact</h2>
          <IconContacts personal={data.personal} hideContact={hideContact} className="manor-contacts" />
        </div>
        <div data-section="education">
          <h2 className="manor-label">Education</h2>
          {data.education.map((item) => (
            <div className="manor-edu" key={item.id} data-focus={item.id}>
              <span className="manor-edu-year">{item.year}</span>
              <strong><RichLine text={item.school || "School"} /></strong>
              <div>{item.degree}</div>
              {item.detail ? <div className="manor-edu-detail"><RichLine text={item.detail} /></div> : null}
            </div>
          ))}
        </div>
        <div data-section="skills">
          <h2 className="manor-label">Skills</h2>
          <ul className="manor-skill-list">
            {skills.map((item, index) => (
              <li key={`${item}-${index}`}><RichLine text={item} /></li>
            ))}
            {!skills.length ? <li className="placeholder-line">Skills</li> : null}
          </ul>
        </div>
        {languages ? <SideExtra extra={languages} labelClass="manor-label" listClass="manor-side-list" plainClass="manor-side-plain" /> : null}
      </aside>
      <header className="manor-head" data-section="details">
        <h1 className="manor-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
        <div className="manor-band">
          <p className="manor-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
      </header>
    </>
  );
}

/** Rachel — warm header, dual columns on a vertical spine. */
export function canvasMainPieces(data: ResumeData) {
  const pieces: ReactNode[] = [
    <Block key="about" section="bio">
      <section className="canvas-section is-marked">
        <h2 className="canvas-label">Profile</h2>
        {data.summary ? <FormattedText text={data.summary} className="canvas-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className={`canvas-section${index === 0 ? " is-marked" : ""}`}>
          {index === 0 && <h2 className="canvas-label">Experience</h2>}
          <div className={`canvas-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div className="canvas-job-top">
              <strong>{job.role || "Role"}</strong>
              <span>{plainRange(job)}</span>
            </div>
            <div className="canvas-sub">{[job.company, job.location].filter(Boolean).join(" · ")}</div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "canvas-pad");
  });
  return pieces;
}

export function CanvasChrome({ data, hideContact }: { data: ResumeData; hideContact?: boolean }) {
  const skills = skillList(data.skills);
  const hobbies = findExtra(data, /hobb|interest/i);
  return (
    <>
      <header className="canvas-head" data-section="details">
        <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={88} />
        <div className="canvas-id">
          <h1 className="canvas-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="canvas-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <IconContacts personal={data.personal} hideContact={hideContact} className="canvas-contacts" />
      </header>
      <aside className="canvas-side">
        <div data-section="education">
          <h2 className="canvas-label">Education</h2>
          {data.education.map((item) => (
            <div className="canvas-edu" key={item.id} data-focus={item.id}>
              <strong><RichLine text={item.degree || "Degree"} /></strong>
              <div>{item.school}</div>
              <span>{item.year}</span>
            </div>
          ))}
        </div>
        <div data-section="skills">
          <h2 className="canvas-label">Skills</h2>
          <ul className="canvas-list">
            {skills.map((item, index) => (
              <li key={`${item}-${index}`}><RichLine text={item} /></li>
            ))}
            {!skills.length ? <li className="placeholder-line">Skills</li> : null}
          </ul>
        </div>
        {hobbies ? <SideExtra extra={hobbies} labelClass="canvas-label" listClass="canvas-side-list" plainClass="canvas-side-plain" /> : null}
      </aside>
    </>
  );
}

/** Samira — grey sidebar, blue accents, timeline main. */
export function cobaltMainPieces(data: ResumeData) {
  const pieces: ReactNode[] = [
    <Block key="edu" section="education">
      <section className="cobalt-section">
        <h2 className="cobalt-label">
          <span className="cobalt-ico" aria-hidden="true">
            <svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 2.2 1.5 5.4 8 8.6l6.5-3.2L8 2.2Zm-5.2 5v3.3L8 13.8l5.2-3.3V7.2L8 10.4 2.8 7.2Z" /></svg>
          </span>
          Education
        </h2>
        {data.education.map((item) => (
          <div className="cobalt-job" key={item.id} data-focus={item.id}>
            <div className="cobalt-dot" aria-hidden="true" />
            <div className="cobalt-job-body">
              <div className="cobalt-job-top">
                <strong>{item.degree || "Degree"}</strong>
                <span>{item.year}</span>
              </div>
              <div className="cobalt-sub">{item.school}</div>
              {item.detail ? <div className="cobalt-sub"><RichLine text={item.detail} /></div> : null}
            </div>
          </div>
        ))}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="cobalt-section">
          {index === 0 && (
            <h2 className="cobalt-label">
              <span className="cobalt-ico" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path fill="currentColor" d="M5.2 4.2V3.4A1.4 1.4 0 0 1 6.6 2h2.8a1.4 1.4 0 0 1 1.4 1.4v.8h2.4A1.4 1.4 0 0 1 14.6 5.6v6.8a1.4 1.4 0 0 1-1.4 1.4H2.8a1.4 1.4 0 0 1-1.4-1.4V5.6A1.4 1.4 0 0 1 2.8 4.2h2.4Zm1.2 0h3.2V3.4H6.4v.8Z" /></svg>
              </span>
              Experience
            </h2>
          )}
          <div className={`cobalt-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div className="cobalt-dot" aria-hidden="true" />
            <div className="cobalt-job-body">
              <div className="cobalt-job-top">
                <strong>{job.role || "Role"}</strong>
                <span>{plainRange(job)}</span>
              </div>
              <div className="cobalt-sub">{[job.company, job.location].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "cobalt-pad");
  });
  return pieces;
}

export function CobaltChrome({ data, hideContact }: { data: ResumeData; hideContact?: boolean }) {
  const skills = skillList(data.skills);
  return (
    <aside className="cobalt-side">
      <span className="cobalt-dots is-top" aria-hidden="true" />
      <div className="cobalt-id" data-section="details">
        <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={108} />
        <h1 className="cobalt-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
        <p className="cobalt-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        <IconContacts personal={data.personal} hideContact={hideContact} className="cobalt-contacts" />
      </div>
      <div data-section="bio">
        <h2 className="cobalt-side-label">About Me</h2>
        {data.summary ? <FormattedText text={data.summary} className="cobalt-about" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </div>
      <div data-section="skills">
        <h2 className="cobalt-side-label">Skills</h2>
        <ul className="cobalt-skill-list">
          {skills.map((item, index) => (
            <li key={`${item}-${index}`}><RichLine text={item} /></li>
          ))}
          {!skills.length ? <li className="placeholder-line">Skills</li> : null}
        </ul>
      </div>
      <span className="cobalt-dots is-bottom" aria-hidden="true" />
    </aside>
  );
}

/** Natalie — grey section bars, single column. */
export function studioPieces(data: ResumeData, hideContact: boolean) {
  const contacts = contactRows(data.personal, hideContact).map((row) => row.text);
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="studio-head">
        <h1 className="studio-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
        <p className="studio-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        <p className="studio-contact">{contacts.length ? contacts.join("  |  ") : "email | phone | web"}</p>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="studio-section">
        <h2 className="studio-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="studio-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="studio-section">
        <h2 className="studio-label">Skills</h2>
        {skillList(data.skills).length ? (
          <p className="studio-skills">{skillList(data.skills).join(" · ")}</p>
        ) : (
          <p className="placeholder-line">Your skills will show here.</p>
        )}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="studio-section">
          {index === 0 && <h2 className="studio-label">Work Experience</h2>}
          <div className={`studio-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div className="studio-job-top">
              <strong>{[job.role, job.company].filter(Boolean).join(" | ") || "Role"}</strong>
              <span>{plainRange(job)}</span>
            </div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "studio-pad");
  });
  pieces.push(
    <Block key="edu" section="education">
      <section className="studio-section">
        <h2 className="studio-label">Education</h2>
        {data.education.map((item) => (
          <div className="studio-job" key={item.id} data-focus={item.id}>
            <div className="studio-job-top">
              <strong>{item.school || "School"}</strong>
              <span>{item.year}</span>
            </div>
            <div className="studio-sub">{item.degree}</div>
            {item.detail ? <div className="studio-sub"><RichLine text={item.detail} /></div> : null}
          </div>
        ))}
      </section>
    </Block>,
  );
  return pieces;
}

/** Connor — main left, photo/skills right rail. */
export function vaultMainPieces(data: ResumeData) {
  const pieces: ReactNode[] = [
    <Block key="about" section="bio">
      <section className="vault-section">
        <h2 className="vault-label">Professional Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="vault-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="vault-section">
          {index === 0 && <h2 className="vault-label">Work Experience</h2>}
          <div className={`vault-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div className="vault-job-top">
              <strong>{job.role || "Role"}</strong>
              <span>{plainRange(job)}</span>
            </div>
            <div className="vault-sub">{[job.company, job.location].filter(Boolean).join(" · ")}</div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "vault-pad");
  });
  return pieces;
}

export function VaultChrome({ data, hideContact }: { data: ResumeData; hideContact?: boolean }) {
  const languages = findExtra(data, /language/i);
  const certs = findExtra(data, /certif/i);
  return (
    <>
      <header className="vault-head" data-section="details">
        <h1 className="vault-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
        <p className="vault-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
      </header>
      <aside className="vault-side">
        <div className="vault-photo" data-section="details">
          <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={120} />
        </div>
        <div data-section="details">
          <h2 className="vault-side-label">Contact</h2>
          <IconContacts personal={data.personal} hideContact={hideContact} className="vault-contacts" />
        </div>
        <div data-section="education">
          <h2 className="vault-side-label">Education</h2>
          {data.education.map((item) => (
            <div className="vault-edu" key={item.id} data-focus={item.id}>
              <strong><RichLine text={item.school || "School"} /></strong>
              <div>{item.degree}</div>
              <span>{item.year}</span>
            </div>
          ))}
        </div>
        <div data-section="skills">
          <h2 className="vault-side-label">Skills</h2>
          {data.skills.industry.length ? (
            <div className="vault-skill-block">
              <strong>Technical</strong>
              <p>{data.skills.industry.join(", ")}</p>
            </div>
          ) : null}
          {data.skills.tools.length ? (
            <div className="vault-skill-block">
              <strong>Tools</strong>
              <p>{data.skills.tools.join(", ")}</p>
            </div>
          ) : null}
          {data.skills.other.length ? (
            <div className="vault-skill-block">
              <strong>Other</strong>
              <p>{data.skills.other.join(", ")}</p>
            </div>
          ) : null}
          {!skillList(data.skills).length ? <p className="placeholder-line">Skills</p> : null}
        </div>
        {languages ? <SideExtra extra={languages} labelClass="vault-side-label" listClass="vault-side-list" plainClass="vault-side-plain" /> : null}
        {certs ? <SideExtra extra={certs} labelClass="vault-side-label" listClass="vault-side-list" plainClass="vault-side-plain" /> : null}
      </aside>
    </>
  );
}

/** Olivia — header band with centered photo. */
export function plazaPieces(data: ResumeData, hideContact: boolean) {
  const skills = skillList(data.skills);
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="plaza-head">
        <div className="plaza-id">
          <h1 className="plaza-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="plaza-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={86} />
        <IconContacts personal={data.personal} hideContact={hideContact} className="plaza-contacts" />
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="plaza-section">
        <h2 className="plaza-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="plaza-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="plaza-section">
          {index === 0 && <h2 className="plaza-label">Work Experience</h2>}
          <div className={`plaza-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div className="plaza-job-top">
              <strong>{[job.role, job.company].filter(Boolean).join(", ") || "Role"}</strong>
              <span>{plainRange(job)}</span>
            </div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "plaza-pad");
  });
  pieces.push(
    <Block key="edu" section="education">
      <section className="plaza-section">
        <h2 className="plaza-label">Education</h2>
        {data.education.map((item) => (
          <div className="plaza-job" key={item.id} data-focus={item.id}>
            <div className="plaza-job-top">
              <strong>{item.degree || "Degree"}</strong>
              <span>{item.year}</span>
            </div>
            <div className="plaza-sub">{[item.school, item.detail].filter(Boolean).join(" · ")}</div>
          </div>
        ))}
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="plaza-section">
        <h2 className="plaza-label">Key Skills</h2>
        <ul className="plaza-skills">
          {skills.map((item, index) => (
            <li key={`${item}-${index}`}><RichLine text={item} /></li>
          ))}
          {!skills.length ? <li className="placeholder-line">Skills</li> : null}
        </ul>
      </section>
    </Block>,
  );
  return pieces;
}

export function isAtsSplit(templateId: string) {
  return templateId === "apex" || templateId === "cabinet" || templateId === "manor" || templateId === "canvas" || templateId === "cobalt" || templateId === "vault";
}
