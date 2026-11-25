"use client";

import type { ReactNode } from "react";
import { FormattedText, RichLine } from "./Formatted";
import { Monogram } from "./Monogram";
import { ResumeSectionLabel } from "./ResumeSectionLabel";
import { plainRange } from "@/lib/content";
import { sectionOnCv, sectionRenders } from "@/lib/sectionOrder";
import type { ResumeData } from "@/lib/types";
import { IconContacts, contactRows, pushJobBullets, renderSideExtras } from "./atsTemplates";
import { skillTags } from "@/lib/sectionOrder";

function skillList(skills: ResumeData["skills"]) {
  return skillTags(skills);
}

function Block({ section, focus, children }: { section?: string; focus?: string; children: ReactNode }) {
  return (
    <div className="flow-block" data-section={section} data-focus={focus}>
      {children}
    </div>
  );
}

/** SME — centred blue name, pale blue section bars, pipe contact (reference: QwikResume SME). */
export function skylinePieces(data: ResumeData, hideContact: boolean) {
  const contacts = contactRows(data.personal, hideContact).map((row) => row.text);
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="skyline-head">
        <div className="skyline-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
        <p className="skyline-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        <p className="skyline-contact">{contacts.length ? contacts.join("  |  ") : "Phone | Email | Website"}</p>
        <hr className="skyline-rule" aria-hidden="true" />
      </header>
    </Block>,
  ];
  if (sectionRenders(data, "bio")) {
    pieces.push(
      <Block key="about" section="bio">
        <section className="skyline-section">
          <ResumeSectionLabel className="skyline-label">Summary</ResumeSectionLabel>
          {data.summary ? (
            <FormattedText text={data.summary} className="skyline-summary" />
          ) : (
            <p className="placeholder-line">Your summary will show here.</p>
          )}
        </section>
      </Block>,
    );
  }
  if (sectionOnCv(data, "skills")) {
    pieces.push(
      <Block key="skills" section="skills">
        <section className="skyline-section">
          <ResumeSectionLabel className="skyline-label">Core Competencies</ResumeSectionLabel>
          <p className="skyline-skills">{skillList(data.skills).join(", ") || "Your skills"}</p>
        </section>
      </Block>,
    );
  }
  data.experience.forEach((job, index) => {
    const card = (
      <div className={`skyline-job${index > 0 ? " skyline-job-continue" : ""}${job.bullets.some(Boolean) ? " is-split" : ""}`}>
        <div className="skyline-job-top">
          <strong>{job.role || "Role"}</strong>
          <span>{plainRange(job)}</span>
        </div>
        <div className="skyline-company">
          {[job.company, job.location].filter(Boolean).join(" — ") || "Company"}
        </div>
      </div>
    );
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        {index === 0 ? (
          <section className="skyline-section">
            <ResumeSectionLabel className="skyline-label">Professional Experience</ResumeSectionLabel>
            {card}
          </section>
        ) : (
          card
        )}
      </Block>,
    );
    pushJobBullets(pieces, job, "skyline-pad");
  });
  if (sectionOnCv(data, "education")) {
    pieces.push(
      <Block key="edu" section="education">
        <section className="skyline-section">
          <ResumeSectionLabel className="skyline-label">Education</ResumeSectionLabel>
          {data.education.map((item) => (
            <div className="skyline-edu" key={item.id} data-focus={item.id}>
              <RichLine text={[item.degree, item.school, item.year].filter(Boolean).join(" — ")} />
            </div>
          ))}
        </section>
      </Block>,
    );
  }
  return pieces;
}

/** Banner header, photo overlap, experience with margin dates, skill bars (reference: Jordan Brown). */
export function harborPieces(data: ResumeData, hideContact: boolean) {
  const skills = skillList(data.skills);
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="harbor-top" data-section="details">
        <div className="harbor-banner">
          <div className="harbor-id">
            <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={92} />
            <div className="harbor-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
          </div>
        </div>
        <div className="harbor-contact-row">
          <IconContacts personal={data.personal} hideContact={hideContact} className="harbor-contacts" />
        </div>
      </header>
    </Block>,
  ];
  if (sectionRenders(data, "bio")) {
    pieces.push(
      <Block key="about" section="bio">
        <section className="harbor-section">
          <ResumeSectionLabel className="harbor-label">Summary</ResumeSectionLabel>
          {data.summary ? (
            <FormattedText text={data.summary} className="harbor-summary" />
          ) : (
            <p className="placeholder-line">Your summary will show here.</p>
          )}
        </section>
      </Block>,
    );
  }
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="harbor-section">
          {index === 0 ? <ResumeSectionLabel className="harbor-label">Professional Experience</ResumeSectionLabel> : null}
          <div className={`harbor-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <span className="harbor-date">{plainRange(job)}</span>
            <div className="harbor-job-body">
              <strong>{job.role || "Role"}</strong>
              <em>{[job.company, job.location].filter(Boolean).join(" · ")}</em>
            </div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "harbor-pad");
  });
  if (sectionOnCv(data, "education")) {
    pieces.push(
      <Block key="edu" section="education">
        <section className="harbor-section">
          <ResumeSectionLabel className="harbor-label">Education</ResumeSectionLabel>
          {data.education.map((item) => (
            <div className="harbor-edu" key={item.id} data-focus={item.id}>
              <strong>{item.degree || "Degree"}</strong>
              <span>{[item.school, item.year].filter(Boolean).join(" · ")}</span>
            </div>
          ))}
        </section>
      </Block>,
    );
  }
  if (sectionOnCv(data, "skills")) {
    pieces.push(
      <Block key="skills" section="skills">
        <section className="harbor-section">
          <ResumeSectionLabel className="harbor-label">Key Skills</ResumeSectionLabel>
          <div className="harbor-bars">
            {skills.map((item, index) => (
              <div className="harbor-bar-item" key={`${item}-${index}`}>
                <strong><RichLine text={item} /></strong>
                <span className="harbor-track">
                  <i style={{ width: `${58 + (index % 4) * 11}%` }} />
                </span>
              </div>
            ))}
          </div>
        </section>
      </Block>,
    );
  }
  return pieces;
}

export function atlasMainPieces(data: ResumeData) {
  const pieces: ReactNode[] = [];
  if (sectionRenders(data, "bio")) {
    pieces.push(
      <Block key="about" section="bio">
        <section className="atlas-section">
          <ResumeSectionLabel className="atlas-label">Professional Summary</ResumeSectionLabel>
          {data.summary ? (
            <FormattedText text={data.summary} className="atlas-summary" />
          ) : (
            <p className="placeholder-line">Your summary will show here.</p>
          )}
        </section>
      </Block>,
    );
  }
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="atlas-section">
          {index === 0 ? <ResumeSectionLabel className="atlas-label">Work Experience</ResumeSectionLabel> : null}
          <div className={`atlas-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div className="atlas-job-top">
              <strong>{job.role || "Role"}</strong>
              <span>{plainRange(job)}</span>
            </div>
            <div className="atlas-sub">{[job.company, job.location].filter(Boolean).join(" · ")}</div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, "atlas-pad");
  });
  if (sectionOnCv(data, "education")) {
    pieces.push(
      <Block key="edu" section="education">
        <section className="atlas-section">
          <ResumeSectionLabel className="atlas-label">Education</ResumeSectionLabel>
          {data.education.map((item) => (
            <div className="atlas-edu" key={item.id} data-focus={item.id}>
              <div className="atlas-edu-top">
                <strong>{item.degree || "Degree"}</strong>
                <span>{item.year}</span>
              </div>
              <div>{item.school}</div>
            </div>
          ))}
        </section>
      </Block>,
    );
  }
  return pieces;
}

export function AtlasHead({ data }: { data: ResumeData }) {
  return (
    <header className="atlas-head" data-section="details">
      <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={82} />
      <div className="atlas-id">
        <div className="atlas-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
        <p className="atlas-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
      </div>
    </header>
  );
}

export function AtlasSide({ data, hideContact }: { data: ResumeData; hideContact?: boolean }) {
  const skills = skillList(data.skills);
  const rows = contactRows(data.personal, hideContact);
  return (
    <aside className="atlas-side">
      <div data-section="details">
        <ResumeSectionLabel className="atlas-side-label">Personal Details</ResumeSectionLabel>
        <div className="atlas-detail-grid">
          {rows.map((row, index) => (
            <div key={`${row.kind}-${index}`}>
              <span className="atlas-detail-k"><RichLine text={row.kind === "pin" ? "Address" : row.kind === "phone" ? "Phone" : row.kind === "mail" ? "Email" : row.kind} /></span>
              <span className="atlas-detail-v"><RichLine text={row.text} /></span>
            </div>
          ))}
        </div>
      </div>
      {sectionOnCv(data, "skills") ? (
        <div data-section="skills">
          <ResumeSectionLabel className="atlas-side-label">Skills</ResumeSectionLabel>
          <ul className="atlas-skill-list">
            {skills.map((item, index) => (
              <li key={`${item}-${index}`}><RichLine text={item} /></li>
            ))}
          </ul>
        </div>
      ) : null}
      {renderSideExtras(data, "atlas-side-label", "atlas-side-plain", "atlas-side-plain", [/language/i])}
    </aside>
  );
}

export function AtlasChrome({ data, hideContact }: { data: ResumeData; hideContact?: boolean }) {
  return (
    <>
      <AtlasHead data={data} />
      <AtlasSide data={data} hideContact={hideContact} />
    </>
  );
}

/** Label rail + content (reference: Aya Lee). */
export function beaconPieces(data: ResumeData, hideContact: boolean) {
  const contacts = contactRows(data.personal, hideContact);
  const contactLine = contacts.map((r) => r.text).join("  ·  ");
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="beacon-head">
        <div className="beacon-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
        <p className="beacon-contact">{contactLine || "Location · Phone · Email"}</p>
        <span className="beacon-rule" aria-hidden="true" />
      </header>
    </Block>,
  ];
  if (sectionRenders(data, "bio")) {
    pieces.push(
      <Block key="about" section="bio">
        <div className="beacon-row">
          <ResumeSectionLabel className="beacon-label">Resume Objective</ResumeSectionLabel>
          <div className="beacon-body">
            {data.summary ? (
              <FormattedText text={data.summary} className="beacon-summary" />
            ) : (
              <p className="placeholder-line">Your objective will show here.</p>
            )}
          </div>
        </div>
      </Block>,
    );
  }
  if (sectionOnCv(data, "education")) {
    pieces.push(
      <Block key="edu" section="education">
        <div className="beacon-row">
          <ResumeSectionLabel className="beacon-label">Education</ResumeSectionLabel>
          <div className="beacon-body">
            {data.education.map((item) => (
              <div className="beacon-edu" key={item.id} data-focus={item.id}>
                <span className="beacon-edu-date">{item.year}</span>
                <strong><RichLine text={item.degree || "Degree"} /></strong>
                <p>{[item.school, item.detail].filter(Boolean).join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      </Block>,
    );
  }
  if (sectionOnCv(data, "skills")) {
    pieces.push(
      <Block key="skills" section="skills">
        <div className="beacon-row">
          <ResumeSectionLabel className="beacon-label">Skills</ResumeSectionLabel>
          <div className="beacon-body beacon-skills">
            <ul>
              {skillList(data.skills).map((item, index) => (
                <li key={`${item}-${index}`}><RichLine text={item} /></li>
              ))}
            </ul>
          </div>
        </div>
      </Block>,
    );
  }
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <div className="beacon-row">
          {index === 0 ? <ResumeSectionLabel className="beacon-label">Work Experience</ResumeSectionLabel> : <span className="beacon-label-spacer" aria-hidden="true" />}
          <div className="beacon-body">
            <div className={`beacon-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
              <span className="beacon-job-date">{plainRange(job)}</span>
              <strong>{job.role || "Role"}</strong>
              <p className="beacon-job-meta">{[job.company, job.location].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
        </div>
      </Block>,
    );
    pushJobBullets(pieces, job, "beacon-pad");
  });
  return pieces;
}
