"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import {
  ApexChrome,
  apexMainPieces,
  bannerPieces,
  CabinetChrome,
  cabinetMainPieces,
  CanvasChrome,
  canvasMainPieces,
  CobaltChrome,
  cobaltMainPieces,
  formalPieces,
  isAtsSplit,
  ManorChrome,
  manorMainPieces,
  mintPieces,
  plazaPieces,
  studioPieces,
  VaultChrome,
  vaultMainPieces,
} from "./atsTemplates";
import { FormattedText, RichLine } from "./Formatted";
import { Monogram } from "./Monogram";
import { plainRange } from "@/lib/content";
import { fontClass, paperStyle, readTemplateId, type PanelId, type ResumeData, type StepId, type TemplateId } from "@/lib/types";

/** Horizontal inset for split job bullets when the template body uses section padding, not paper padding. */
function experienceBulletPad(templateId: TemplateId) {
  if (templateId === "horizon") return "horizon-pad";
  if (templateId === "banner") return "banner-pad";
  if (templateId === "plaza") return "plaza-pad";
  return "";
}

function SkillBlocks({ skills }: { skills: ResumeData["skills"] }) {
  const groups = [
    ["Industry Knowledge", skills.industry],
    ["Tools & Technologies", skills.tools],
    ["Other Skills", skills.other],
  ] as const;
  return (
    <>
      {groups.map(([label, items]) =>
        items.length ? (
          <div className="skill-block" key={label}>
            <strong>{label}</strong>
            <p>
              {items.map((item, index) => (
                <span key={`${item}-${index}`}>
                  {item}
                  {index < items.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>
        ) : null,
      )}
    </>
  );
}

function linkLabel(value: string) {
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

function ContactIcon({ kind }: { kind: "pin" | "phone" | "mail" | "linkedin" | "github" | "web" | "portfolio" }) {
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
  if (kind === "portfolio") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2.2" y="5.2" width="11.6" height="8" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 5.2V4a1.2 1.2 0 0 1 1.2-1.2h1.6A1.2 1.2 0 0 1 10 4v1.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
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

function ContactLines({
  personal,
  hideContact,
  plain,
}: {
  personal: ResumeData["personal"];
  hideContact?: boolean;
  plain?: boolean;
}) {
  const place = [personal.location, personal.pincode].filter(Boolean).join(" ");
  const rows: { kind: "pin" | "phone" | "mail" | "linkedin" | "github" | "web" | "portfolio"; text: string }[] = [];
  if (place) rows.push({ kind: "pin", text: place });
  if (!hideContact && personal.phone) rows.push({ kind: "phone", text: personal.phone });
  if (!hideContact && personal.email) rows.push({ kind: "mail", text: personal.email });
  if (personal.linkedin) rows.push({ kind: "linkedin", text: linkLabel(personal.linkedin) });
  if (personal.github) rows.push({ kind: "github", text: linkLabel(personal.github) });
  if (personal.website) rows.push({ kind: "web", text: linkLabel(personal.website) });
  if (personal.portfolio) rows.push({ kind: "portfolio", text: linkLabel(personal.portfolio) });
  if (plain) {
    return <p className="contact-plain">{rows.map((row) => row.text).join("  ·  ")}</p>;
  }
  return (
    <>
      {rows.map((row) => (
        <div className="contact-line" key={row.kind}>
          <ContactIcon kind={row.kind} />
          <span>{row.text}</span>
        </div>
      ))}
    </>
  );
}

function EduList({ data }: { data: ResumeData }) {
  return (
    <>
      {data.education.map((item) => (
        <div className="edu-item" key={item.id} data-section="education" data-focus={item.id}>
          <strong><RichLine text={item.degree} /></strong>
          <div className="school">{[item.school, item.year].filter(Boolean).join(" · ")}</div>
          {item.detail && <div className="fine"><RichLine text={item.detail} /></div>}
        </div>
      ))}
    </>
  );
}

function Block({ section, focus, children }: { section?: StepId | "extras"; focus?: string; children: ReactNode }) {
  return (
    <div className="flow-block" data-section={section} data-focus={focus}>
      {children}
    </div>
  );
}

/** Split bullets into their own blocks so a long role can fill the previous page. */
function pushJobBullets(pieces: ReactNode[], job: ResumeData["experience"][number], padClass = "") {
  const filled = job.bullets.filter(Boolean);
  filled.forEach((bullet, index) => {
    pieces.push(
      <Block key={`${job.id}-b${index}`} section="experience" focus={job.id}>
        <div className={`flow-li${padClass ? ` ${padClass}` : ""}${index === filled.length - 1 ? " is-last" : ""}`}>
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

function editorialPieces(data: ResumeData, hideContact: boolean) {
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <h1 className="ed-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
      <p className="ed-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
      <div className="ed-contact"><ContactLines personal={data.personal} hideContact={hideContact} plain /></div>
      <div className="ed-rule" aria-hidden="true" />
    </Block>,
    <Block key="about" section="bio">
      <section className="ed-section">
        <h2 className="ed-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="ed-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="ed-section">
          {index === 0 && <h2 className="ed-label">Work Experience</h2>}
          <div className={`ed-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div>
              <strong>{job.role ? <RichLine text={job.role} /> : "Role"}</strong>
              <div className="company"><RichLine text={[job.company, job.location].filter(Boolean).join(" · ")} /></div>
            </div>
            <div className="ed-date">{plainRange(job)}</div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job);
  });
  pieces.push(
    <Block key="edu" section="education">
      <section className="ed-section">
        <h2 className="ed-label">Education</h2>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="ed-section">
        <h2 className="ed-label">Skills</h2>
        <SkillBlocks skills={data.skills} />
      </section>
    </Block>,
  );
  return pieces;
}

function signalPieces(data: ResumeData, hideContact: boolean, templateId: TemplateId) {
  const bulletPad = experienceBulletPad(templateId);
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="sig-top">
        <div>
          <h1 className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <div className="sig-contact"><ContactLines personal={data.personal} hideContact={hideContact} plain /></div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <h2 className="sig-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="sig-section">
          {index === 0 && <h2 className="sig-label">Work Experience</h2>}
          <div className={`sig-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
            <div className="sig-job-top">
              <div>
                <strong>{job.role ? <RichLine text={job.role} /> : "Role"}</strong>
                <div className="company"><RichLine text={[job.company, job.location].filter(Boolean).join(" · ")} /></div>
              </div>
              <div className="ed-date">{plainRange(job)}</div>
            </div>
          </div>
        </section>
      </Block>,
    );
    pushJobBullets(pieces, job, bulletPad);
  });
  pieces.push(
    <Block key="edu" section="education">
      <section className="sig-section">
        <h2 className="sig-label">Education</h2>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <h2 className="sig-label">Skills</h2>
        <SkillBlocks skills={data.skills} />
      </section>
    </Block>,
  );
  return pieces;
}

/** A current flag with no dates and no role paints a stray "present" beside the placeholder. */
function shownRange(job: ResumeData["experience"][number]) {
  const range = plainRange(job);
  if (!range) return "";
  if (!job.start && !job.role && !job.company) return "";
  return range;
}

function splitPieces(data: ResumeData) {
  const pieces: ReactNode[] = [
    <Block key="about" section="bio">
      <h2 className="sig-label">Summary</h2>
      {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    const range = shownRange(job);
    const where = [job.company, job.location].filter(Boolean).join(" · ");
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        {index === 0 && <h2 className="sig-label" style={{ marginTop: 22 }}>Experience</h2>}
        <div className={`sig-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
          <div className="sig-job-top">
            <div>
              <strong className={job.role ? undefined : "placeholder-line"}>{job.role ? <RichLine text={job.role} /> : "Role"}</strong>
              {where && <div className="company"><RichLine text={where} /></div>}
            </div>
            {range && <div className="ed-date">{range}</div>}
          </div>
        </div>
      </Block>,
    );
    pushJobBullets(pieces, job);
  });
  return pieces;
}

function jobBlocks(data: ResumeData, jobClass = "sig-job") {
  const pieces: ReactNode[] = [];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        {index === 0 && <h2 className="sig-label">Experience</h2>}
        <div className={`${jobClass}${job.bullets.some(Boolean) ? " is-split" : ""}`}>
          <div className="sig-job-top">
            <div>
              <strong>{job.role ? <RichLine text={job.role} /> : "Role"}</strong>
              <div className="company"><RichLine text={[job.company, job.location].filter(Boolean).join(" · ")} /></div>
            </div>
            <div className="ed-date">{plainRange(job)}</div>
          </div>
        </div>
      </Block>,
    );
    pushJobBullets(pieces, job);
  });
  return pieces;
}

function primePieces(data: ResumeData, hideContact: boolean) {
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="sig-top">
        <div>
          <h1 className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <div className="sig-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <h2 className="sig-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        {index === 0 && <h2 className="sig-label">Experience</h2>}
        <div className={`prime-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
          <div className="prime-date">{plainRange(job)}</div>
          <div>
            <strong>{job.role ? <RichLine text={job.role} /> : "Role"}</strong>
            <div className="company"><RichLine text={[job.company, job.location].filter(Boolean).join(" · ")} /></div>
          </div>
        </div>
      </Block>,
    );
    pushJobBullets(pieces, job);
  });
  pieces.push(
    <Block key="edu" section="education">
      <section className="sig-section">
        <h2 className="sig-label">Education</h2>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <h2 className="sig-label">Skills</h2>
        <SkillBlocks skills={data.skills} />
      </section>
    </Block>,
  );
  return pieces;
}

function folioPieces(data: ResumeData, hideContact: boolean) {
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="folio-head">
        <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={86} />
        <div>
          <h1 className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
          <div className="folio-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
        </div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <h2 className="sig-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
    ...jobBlocks(data),
    <Block key="edu" section="education">
      <section className="sig-section">
        <h2 className="sig-label">Education</h2>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <h2 className="sig-label">Skills</h2>
        <SkillBlocks skills={data.skills} />
      </section>
    </Block>,
  ];
  return pieces;
}

function timelinePieces(data: ResumeData, hideContact: boolean) {
  const pieces: ReactNode[] = [
    <Block key="head" section="details">
      <header className="sig-top">
        <div>
          <h1 className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <div className="sig-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <h2 className="sig-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        {index === 0 && <h2 className="sig-label">Experience</h2>}
        <div className={`tl-job${job.bullets.some(Boolean) ? " is-split" : ""}`}>
          <strong>{job.role ? <RichLine text={job.role} /> : "Role"}</strong>
          <div className="company"><RichLine text={[job.company, job.location, plainRange(job)].filter(Boolean).join(" · ")} /></div>
        </div>
      </Block>,
    );
    pushJobBullets(pieces, job);
  });
  pieces.push(
    <Block key="edu" section="education">
      <section className="sig-section">
        <h2 className="sig-label">Education</h2>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <h2 className="sig-label">Skills</h2>
        <SkillBlocks skills={data.skills} />
      </section>
    </Block>,
  );
  return pieces;
}

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CV";
}

function densPieces(data: ResumeData, hideContact: boolean) {
  return [
    <Block key="head" section="details">
      <header className="dens-bar">
        <span className="dens-initials">{initialsOf(data.personal.fullName)}</span>
        <div>
          <h1 className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <div className="sig-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <h2 className="sig-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <h2 className="sig-label">Skills</h2>
        <div className="skill-grid"><SkillBlocks skills={data.skills} /></div>
      </section>
    </Block>,
    ...jobBlocks(data),
    <Block key="edu" section="education">
      <section className="sig-section">
        <h2 className="sig-label">Education</h2>
        <EduList data={data} />
      </section>
    </Block>,
  ];
}

function helloPieces(data: ResumeData, hideContact: boolean) {
  const first = data.personal.fullName.trim().split(/\s+/).filter(Boolean)[0] || "there";
  return [
    <Block key="head" section="details">
      <header className="hello-bubble">
        <h1>Hi, I&apos;m {first}.</h1>
        <p>{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
      </header>
      <div className="hello-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <h2 className="sig-label">About</h2>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
    ...jobBlocks(data),
    <Block key="edu" section="education">
      <section className="sig-section">
        <h2 className="sig-label">Education</h2>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <h2 className="sig-label">Skills</h2>
        <SkillBlocks skills={data.skills} />
      </section>
    </Block>,
  ];
}

function gridPieces(data: ResumeData, hideContact: boolean) {
  return [
    <Block key="head" section="details">
      <header className="sig-top">
        <div>
          <h1 className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <div className="sig-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <h2 className="sig-label">Summary</h2>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <h2 className="sig-label">Skills</h2>
        <div className="skill-grid"><SkillBlocks skills={data.skills} /></div>
      </section>
    </Block>,
    ...jobBlocks(data),
    <Block key="edu" section="education">
      <section className="sig-section">
        <h2 className="sig-label">Education</h2>
        <EduList data={data} />
      </section>
    </Block>,
  ];
}

function isSidebar(templateId: TemplateId) {
  return templateId === "split" || templateId === "sage" || templateId === "navy" || templateId === "slate" || templateId === "tide" || templateId === "linen" || templateId === "quote";
}

function isRightbar(templateId: TemplateId) {
  return templateId === "quartz";
}

type ExtraKind = "sig" | "ed" | "mint" | "banner" | "formal" | "apex" | "cab" | "manor" | "canvas" | "cobalt" | "studio" | "vault" | "plaza";

const EXTRA_LOOK: Record<ExtraKind, { section: string; label: string }> = {
  sig: { section: "sig-section", label: "sig-label" },
  ed: { section: "ed-section", label: "ed-label" },
  mint: { section: "mint-section", label: "mint-label" },
  banner: { section: "banner-section", label: "banner-label" },
  formal: { section: "formal-section", label: "formal-label" },
  apex: { section: "apex-section", label: "apex-label" },
  cab: { section: "cab-section", label: "cab-label" },
  manor: { section: "manor-section", label: "manor-label" },
  canvas: { section: "canvas-section", label: "canvas-label" },
  cobalt: { section: "cobalt-section", label: "cobalt-label" },
  studio: { section: "studio-section", label: "studio-label" },
  vault: { section: "vault-section", label: "vault-label" },
  plaza: { section: "plaza-section", label: "plaza-label" },
};

/**
 * Sections the writer added themselves. Each template family heads its sections
 * differently, so the block is built in that family's own shape rather than
 * dropped in with one set of classes that would look foreign on most pages.
 */
function extraPieces(data: ResumeData, kind: ExtraKind, skip?: RegExp) {
  const look = EXTRA_LOOK[kind];
  return (data.extras || [])
    .filter((extra) => extra.title.trim() && extra.items.some((item) => item.trim()))
    .filter((extra) => !(skip && skip.test(extra.title)))
    .map((extra) => {
      const filled = extra.items.filter((item) => item.trim());
      const useBullets = extra.bullets === true;
      const lines = useBullets ? (
        <ul className="extra-list">
          {filled.map((item, index) => (
            <li key={index}><RichLine text={item} /></li>
          ))}
        </ul>
      ) : (
        <div className="extra-plain">
          {filled.map((item, index) => (
            <p key={index}><RichLine text={item} /></p>
          ))}
        </div>
      );
      return (
        <Block key={extra.id} section="extras" focus={extra.id}>
          <section className={look.section}>
            <h2 className={look.label}><RichLine text={extra.title} /></h2>
            {lines}
          </section>
        </Block>
      );
    });
}

function piecesFor(templateId: TemplateId, data: ResumeData, hideContact: boolean) {
  const base = basePieces(templateId, data, hideContact);
  // Profile already parks languages + awards in the side column.
  if (templateId === "apex") {
    return [...base, ...extraPieces(data, "apex", /language|strength|award|accomplishment/i)];
  }
  if (templateId === "cabinet") return [...base, ...extraPieces(data, "cab")];
  if (templateId === "manor") return [...base, ...extraPieces(data, "manor", /language/i)];
  if (templateId === "canvas") return [...base, ...extraPieces(data, "canvas", /hobb|interest/i)];
  if (templateId === "cobalt") return [...base, ...extraPieces(data, "cobalt")];
  if (templateId === "studio") return [...base, ...extraPieces(data, "studio")];
  if (templateId === "vault") return [...base, ...extraPieces(data, "vault", /language|certif/i)];
  if (templateId === "plaza") return [...base, ...extraPieces(data, "plaza")];
  if (templateId === "mint") return [...base, ...extraPieces(data, "mint")];
  if (templateId === "banner") return [...base, ...extraPieces(data, "banner")];
  if (templateId === "formal") return [...base, ...extraPieces(data, "formal")];
  const kind: ExtraKind = templateId === "editorial" || templateId === "classic" ? "ed" : "sig";
  return [...base, ...extraPieces(data, kind)];
}

function basePieces(templateId: TemplateId, data: ResumeData, hideContact: boolean) {
  if (templateId === "mint") return mintPieces(data, hideContact);
  if (templateId === "banner") return bannerPieces(data, hideContact);
  if (templateId === "formal") return formalPieces(data, hideContact);
  if (templateId === "apex") return apexMainPieces(data);
  if (templateId === "cabinet") return cabinetMainPieces(data);
  if (templateId === "manor") return manorMainPieces(data);
  if (templateId === "canvas") return canvasMainPieces(data);
  if (templateId === "cobalt") return cobaltMainPieces(data);
  if (templateId === "studio") return studioPieces(data, hideContact);
  if (templateId === "vault") return vaultMainPieces(data);
  if (templateId === "plaza") return plazaPieces(data, hideContact);
  if (templateId === "editorial" || templateId === "classic") return editorialPieces(data, hideContact);
  if (templateId === "prime") return primePieces(data, hideContact);
  if (templateId === "timeline") return timelinePieces(data, hideContact);
  if (templateId === "folio" || templateId === "iconic" || templateId === "hex" || templateId === "crest") return folioPieces(data, hideContact);
  if (templateId === "dens" || templateId === "ruby") return densPieces(data, hideContact);
  if (templateId === "hello") return helloPieces(data, hideContact);
  if (templateId === "grid") return gridPieces(data, hideContact);
  if (isSidebar(templateId) || isRightbar(templateId)) return splitPieces(data);
  return signalPieces(data, hideContact, templateId);
}

function QuartzBanner({ data, hideContact }: { data: ResumeData; hideContact?: boolean }) {
  return (
    <header className="quartz-banner" data-section="details">
      <div className="quartz-id">
        <h1 className="split-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
        <p className="split-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
      </div>
      <div className="quartz-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
    </header>
  );
}

function SplitSide({ data, hideContact, plain = false, identity = true }: { data: ResumeData; hideContact?: boolean; plain?: boolean; identity?: boolean }) {
  return (
    <aside className="split-side">
      {identity && (
        <div data-section="details">
          {!plain && <Monogram name={data.personal.fullName} photoUrl={data.personal.photoUrl} size={84} />}
          <h1 className="split-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</h1>
          <p className="split-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
          <div className="split-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
        </div>
      )}
      <div data-section="skills">
        <h2 className="sig-label">Skills</h2>
        <SkillBlocks skills={data.skills} />
      </div>
      <div data-section="education">
        <h2 className="sig-label">Education</h2>
        {data.education.map((item) => (
          <div className="side-edu" key={item.id} data-section="education" data-focus={item.id}>
            <strong><RichLine text={item.degree} /></strong>
            <div>{[item.school, item.year].filter(Boolean).join(" · ")}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Frame({
  templateId,
  data,
  hideContact,
  pageIndex,
  total,
  paperRef,
  children,
}: {
  templateId: TemplateId;
  data: ResumeData;
  hideContact?: boolean;
  pageIndex: number;
  total: number;
  paperRef?: Ref<HTMLElement>;
  children: ReactNode;
}) {
  const number = total > 1 ? <span className="page-no">{pageIndex + 1} / {total}</span> : null;
  const classes = `paper ${
    isAtsSplit(templateId)
      ? templateId
      : isSidebar(templateId) || isRightbar(templateId)
        ? `split ${templateId}`
        : templateId
  } ${fontClass(data.fontId)}${data.accent ? " has-accent" : ""}`;
  // accent, type size, spacing and line height, read by the template rules
  const tint = paperStyle(data) as CSSProperties;
  if (templateId === "apex") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {pageIndex === 0 && <ApexChrome data={data} hideContact={hideContact} />}
        <div className="apex-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "cabinet") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {pageIndex === 0 && <CabinetChrome data={data} hideContact={hideContact} />}
        <div className="cab-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "manor") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {pageIndex === 0 && <ManorChrome data={data} hideContact={hideContact} />}
        <div className="manor-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "canvas") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {pageIndex === 0 && <CanvasChrome data={data} hideContact={hideContact} />}
        <div className="canvas-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "cobalt") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {pageIndex === 0 && <CobaltChrome data={data} hideContact={hideContact} />}
        <div className="cobalt-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "vault") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {pageIndex === 0 && <VaultChrome data={data} hideContact={hideContact} />}
        <div className="vault-main">{children}{number}</div>
      </article>
    );
  }
  if (isSidebar(templateId) || isRightbar(templateId)) {
    const side = <SplitSide data={data} hideContact={hideContact} identity={!isRightbar(templateId)} plain={templateId === "slate" || templateId === "quartz" || templateId === "linen" || templateId === "quote"} />;
    const main = <div className="split-main">{children}{number}</div>;
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {templateId === "quote" && <span className="quote-mark" aria-hidden="true">“</span>}
        {isRightbar(templateId) && pageIndex === 0 && <QuartzBanner data={data} hideContact={hideContact} />}
        {isRightbar(templateId) ? <>{main}{side}</> : <>{side}{main}</>}
      </article>
    );
  }
  return (
    <article ref={paperRef} className={classes} style={tint}>
      {children}
      {number}
    </article>
  );
}

function pack(heights: number[], firstLimit: number) {
  const pages: number[][] = [];
  let current: number[] = [];
  let used = 0;
  let limit = firstLimit;
  heights.forEach((height, index) => {
    if (current.length && used + height > limit) {
      pages.push(current);
      current = [];
      used = 0;
      limit = Math.max(640, firstLimit - 56);
    }
    current.push(index);
    used += height;
  });
  if (current.length || !pages.length) pages.push(current);

  // A lone certification / short block on the last page looks broken. Pull a
  // few blocks from the previous page so the final sheet has real content.
  const pageHeight = (indexes: number[]) => indexes.reduce((sum, index) => sum + (heights[index] || 0), 0);
  while (pages.length > 1) {
    const last = pages[pages.length - 1];
    if (pageHeight(last) >= 180) break;
    const prev = pages[pages.length - 2];
    if (prev.length <= 3) break;
    last.unshift(prev.pop()!);
  }
  return pages;
}

function pagesFrom(root: HTMLElement, tight = false) {
  const nodes = [...root.querySelectorAll(":scope > .flow-block")] as HTMLElement[];
  const style = getComputedStyle(root);
  const padTop = parseFloat(style.paddingTop) || 0;
  const padBottom = parseFloat(style.paddingBottom) || 0;
  const borderTop = parseFloat(style.borderTopWidth) || 0;
  const borderBottom = parseFloat(style.borderBottomWidth) || 0;
  const slack = tight ? 56 : 32;
  const limit = 1123 - padTop - padBottom - borderTop - borderBottom - slack;
  const rects = nodes.map((node) => node.getBoundingClientRect());
  const heights = rects.map((rect, index) => {
    if (index < rects.length - 1) return rects[index + 1].top - rect.top;
    const node = nodes[index];
    const child = node.lastElementChild as HTMLElement | null;
    const extra = Math.max(
      parseFloat(getComputedStyle(node).marginBottom) || 0,
      child ? parseFloat(getComputedStyle(child).marginBottom) || 0 : 0,
    );
    return rect.height + extra;
  });
  if (rects.length) {
    const contentTop = root.getBoundingClientRect().top + borderTop + padTop;
    const lead = rects[0].top - contentTop;
    if (lead > 0) heights[0] += lead;
  }
  return pack(heights, Math.max(520, limit));
}

const SECTIONS = new Set<string>(["details", "bio", "experience", "education", "skills", "extras"]);

export function ResumeView({
  templateId: rawId,
  data,
  hideContact = false,
  onPick,
  cornerAction,
}: {
  templateId: TemplateId;
  data: ResumeData;
  hideContact?: boolean;
  onPick?: (section: PanelId, focusId?: string) => void;
  /** Floated over the top-right of the first page (e.g. look control in full view). */
  cornerAction?: ReactNode;
}) {
  const templateId = readTemplateId(rawId);
  const pieces = piecesFor(templateId, data, hideContact);
  const measurePieces = piecesFor(templateId, data, hideContact);
  const measureRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>([pieces.map((_, index) => index)]);
  const [scale, setScale] = useState(0.62);

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const next = pagesFrom(root);
    setPages((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
  }, [templateId, data, hideContact]);

  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const measure = () => {
      const width = node.clientWidth;
      if (!width) return;
      const pad = width < 520 ? 20 : 36;
      // Keep mobile preview readable without overflowing the sheet.
      const next = Math.min(1, (width - pad) / 794);
      setScale(width < 520 ? Math.max(0.42, next) : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const sheet = (indexes: number[], pageIndex: number) => (
    <Frame templateId={templateId} data={data} hideContact={hideContact} pageIndex={pageIndex} total={pages.length}>
      {indexes.map((index) => pieces[index]).filter(Boolean)}
    </Frame>
  );

  return (
    <>
      <div className={`measure-col paper ${isSidebar(templateId) || isRightbar(templateId) ? "measure-split" : templateId}${isRightbar(templateId) ? " measure-quartz" : ""} ${fontClass(data.fontId)}`} style={paperStyle(data) as CSSProperties} ref={measureRef} aria-hidden="true">
        {isRightbar(templateId) && <QuartzBanner data={data} hideContact={hideContact} />}
        {measurePieces}
      </div>
      <div
        className={onPick ? "page-stack is-linked" : "page-stack"}
        ref={stageRef}
        onClick={(event) => {
          if (!onPick) return;
          const hit = (event.target as HTMLElement).closest("[data-section]");
          if (!hit) return;
          const section = hit.getAttribute("data-section") || "";
          if (!SECTIONS.has(section)) return;
          onPick(section as PanelId, hit.getAttribute("data-focus") || undefined);
        }}
      >
        {pages.map((indexes, index) => (
          <div key={`${templateId}-${index}`} className="page-slot" style={{ width: 794 * scale, height: 1123 * scale }}>
            {index === 0 && cornerAction ? <div className="page-corner">{cornerAction}</div> : null}
            <div style={{ width: 794, height: 1123, transform: `scale(${scale})`, transformOrigin: "top left" }}>{sheet(indexes, index)}</div>
          </div>
        ))}
      </div>
      <div className="print-root">
        {pages.map((indexes, index) => <div key={`print-${index}`}>{sheet(indexes, index)}</div>)}
      </div>
    </>
  );
}

export function ResumeSheet({
  templateId: rawId,
  data,
  hideContact = false,
  preview = false,
  fill = false,
}: {
  templateId: TemplateId;
  data: ResumeData;
  hideContact?: boolean;
  preview?: boolean;
  /**
   * Thumbnails: keep every block and let the page clip what spills, so the
   * sheet reads as a full page. Trimming to whole blocks (the default) leaves
   * a band of white at the bottom, which at thumbnail size looks like the
   * template is broken rather than like the content simply ran on.
   */
  fill?: boolean;
}) {
  const templateId = readTemplateId(rawId);
  const pieces = piecesFor(templateId, data, hideContact);
  const measurePieces = piecesFor(templateId, data, hideContact);
  const measureRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLElement>(null);
  const [firstPage, setFirstPage] = useState<{ indexes: number[]; total: number } | null>(null);

  useLayoutEffect(() => {
    if (!preview || fill) return;
    const root = measureRef.current;
    if (!root) return;
    const pages = pagesFrom(root, true);
    const next = { indexes: pages[0] || [], total: Math.max(pages.length, 1) };
    setFirstPage((current) => (
      current && current.total === next.total && JSON.stringify(current.indexes) === JSON.stringify(next.indexes) ? current : next
    ));
  }, [preview, fill, templateId, data, hideContact]);

  useLayoutEffect(() => {
    if (!preview || fill || !firstPage) return;
    const paper = paperRef.current;
    if (!paper || firstPage.indexes.length <= 1) return;
    if (paper.scrollHeight <= paper.clientHeight + 2) return;
    setFirstPage({
      indexes: firstPage.indexes.slice(0, -1),
      total: Math.max(firstPage.total, 2),
    });
  }, [preview, fill, firstPage, templateId, data, hideContact]);

  const indexes = preview && !fill && firstPage ? firstPage.indexes : pieces.map((_, index) => index);
  const total = preview && !fill && firstPage ? firstPage.total : 1;
  const measure = preview && !fill && typeof document !== "undefined"
    ? createPortal(
        <div className={`measure-col paper ${isSidebar(templateId) || isRightbar(templateId) ? "measure-split" : templateId}${isRightbar(templateId) ? " measure-quartz" : ""} ${fontClass(data.fontId)}`} style={paperStyle(data) as CSSProperties} ref={measureRef} aria-hidden="true">
          {isRightbar(templateId) && <QuartzBanner data={data} hideContact={hideContact} />}
          {measurePieces}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {measure}
      <Frame templateId={templateId} data={data} hideContact={hideContact} pageIndex={0} total={total} paperRef={preview ? paperRef : undefined}>
        {indexes.map((index) => pieces[index]).filter(Boolean)}
      </Frame>
    </>
  );
}
