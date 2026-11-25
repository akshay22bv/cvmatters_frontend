"use client";

import { isValidElement, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import {
  ApexChrome,
  ApexSide,
  apexMainPieces,
  bannerPieces,
  CabinetChrome,
  CabinetSide,
  cabinetMainPieces,
  CanvasChrome,
  CanvasSide,
  canvasMainPieces,
  CobaltChrome,
  cobaltMainPieces,
  formalPieces,
  isAtsSplit,
  ManorHead,
  ManorSide,
  manorMainPieces,
  mintPieces,
  plazaPieces,
  studioPieces,
  VaultChrome,
  VaultSide,
  vaultMainPieces,
  COBALT_SIDEBAR_EXTRA_SKIP,
  THUMB_SIDEBAR_EXTRA_SKIP,
  VAULT_SIDEBAR_EXTRA_SKIP,
} from "./atsTemplates";
import {
  AtlasChrome,
  AtlasSide,
  atlasMainPieces,
  beaconPieces,
  harborPieces,
  skylinePieces,
} from "./referenceTemplates";
import { FormattedText, RichLine } from "./Formatted";
import { Monogram } from "./Monogram";
import { ResumeDecorProvider, ResumeSectionLabel } from "./ResumeSectionLabel";
import { plainRange } from "@/lib/content";
import { orderPieces, resolveSectionOrder, sectionOnCv, sectionsOmittedFromPage, skillTags } from "@/lib/sectionOrder";
import { fontClass, paperStyle, readTemplateId, type PanelId, type ResumeData, type StepId, type TemplateId } from "@/lib/types";

/** Horizontal inset for split job bullets when the template body uses section padding, not paper padding. */
function experienceBulletPad(templateId: TemplateId) {
  if (templateId === "horizon") return "horizon-pad";
  if (templateId === "banner") return "banner-pad";
  if (templateId === "plaza") return "plaza-pad";
  return "";
}

function SkillBlocks({ skills }: { skills: ResumeData["skills"] }) {
  const tags = skillTags(skills);
  if (!tags.length) return null;
  return (
    <div className="skill-block">
      <p>
        {tags.map((item, index) => (
          <span key={`${item}-${index}`}>
            {item}
            {index < tags.length - 1 ? ", " : ""}
          </span>
        ))}
      </p>
    </div>
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
          <span className="contact-val">{row.text}</span>
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
      <div className="ed-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
      <p className="ed-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
      <div className="ed-contact"><ContactLines personal={data.personal} hideContact={hideContact} plain /></div>
      <div className="ed-rule" aria-hidden="true" />
    </Block>,
    <Block key="about" section="bio">
      <section className="ed-section">
        <ResumeSectionLabel className="ed-label">Summary</ResumeSectionLabel>
        {data.summary ? <FormattedText text={data.summary} className="ed-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="ed-section">
          {index === 0 && <ResumeSectionLabel className="ed-label">Work Experience</ResumeSectionLabel>}
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
        <ResumeSectionLabel className="ed-label">Education</ResumeSectionLabel>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="ed-section">
        <ResumeSectionLabel className="ed-label">Skills</ResumeSectionLabel>
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
          <div className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <div className="sig-contact"><ContactLines personal={data.personal} hideContact={hideContact} plain /></div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Summary</ResumeSectionLabel>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        <section className="sig-section">
          {index === 0 && <ResumeSectionLabel className="sig-label">Work Experience</ResumeSectionLabel>}
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
        <ResumeSectionLabel className="sig-label">Education</ResumeSectionLabel>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Skills</ResumeSectionLabel>
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
      <ResumeSectionLabel className="sig-label">Summary</ResumeSectionLabel>
      {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    const range = shownRange(job);
    const where = [job.company, job.location].filter(Boolean).join(" · ");
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        {index === 0 && <ResumeSectionLabel className="sig-label" style={{ marginTop: 22 }}>Experience</ResumeSectionLabel>}
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
        {index === 0 && <ResumeSectionLabel className="sig-label">Experience</ResumeSectionLabel>}
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
          <div className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <div className="sig-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Summary</ResumeSectionLabel>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        {index === 0 && <ResumeSectionLabel className="sig-label">Experience</ResumeSectionLabel>}
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
        <ResumeSectionLabel className="sig-label">Education</ResumeSectionLabel>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Skills</ResumeSectionLabel>
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
          <div className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
          <div className="folio-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
        </div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Summary</ResumeSectionLabel>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
    ...jobBlocks(data),
    <Block key="edu" section="education">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Education</ResumeSectionLabel>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Skills</ResumeSectionLabel>
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
          <div className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <div className="sig-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Summary</ResumeSectionLabel>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
  ];
  data.experience.forEach((job, index) => {
    pieces.push(
      <Block key={`${job.id}-head`} section="experience" focus={job.id}>
        {index === 0 && <ResumeSectionLabel className="sig-label">Experience</ResumeSectionLabel>}
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
        <ResumeSectionLabel className="sig-label">Education</ResumeSectionLabel>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Skills</ResumeSectionLabel>
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
          <div className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <div className="sig-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Summary</ResumeSectionLabel>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Skills</ResumeSectionLabel>
        <div className="skill-grid"><SkillBlocks skills={data.skills} /></div>
      </section>
    </Block>,
    ...jobBlocks(data),
    <Block key="edu" section="education">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Education</ResumeSectionLabel>
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
        <div className="hello-name">Hi, I&apos;m {first}.</div>
        <p>{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
      </header>
      <div className="hello-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">About</ResumeSectionLabel>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
    ...jobBlocks(data),
    <Block key="edu" section="education">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Education</ResumeSectionLabel>
        <EduList data={data} />
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Skills</ResumeSectionLabel>
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
          <div className="sig-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
          <p className="sig-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
        </div>
        <div className="sig-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
      </header>
    </Block>,
    <Block key="about" section="bio">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Summary</ResumeSectionLabel>
        {data.summary ? <FormattedText text={data.summary} className="sig-summary" /> : <p className="placeholder-line">Your summary will show here.</p>}
      </section>
    </Block>,
    <Block key="skills" section="skills">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Skills</ResumeSectionLabel>
        <div className="skill-grid"><SkillBlocks skills={data.skills} /></div>
      </section>
    </Block>,
    ...jobBlocks(data),
    <Block key="edu" section="education">
      <section className="sig-section">
        <ResumeSectionLabel className="sig-label">Education</ResumeSectionLabel>
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

type ExtraKind =
  | "sig"
  | "ed"
  | "mint"
  | "banner"
  | "formal"
  | "apex"
  | "cab"
  | "manor"
  | "canvas"
  | "cobalt"
  | "studio"
  | "vault"
  | "plaza"
  | "skyline"
  | "harbor"
  | "atlas"
  | "beacon";

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
  skyline: { section: "skyline-section", label: "skyline-label" },
  harbor: { section: "harbor-section", label: "harbor-label" },
  atlas: { section: "atlas-section", label: "atlas-label" },
  beacon: { section: "beacon-row", label: "beacon-label" },
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
            <ResumeSectionLabel className={look.label}><RichLine text={extra.title} /></ResumeSectionLabel>
            {lines}
          </section>
        </Block>
      );
    });
}

function piecesFor(templateId: TemplateId, data: ResumeData, hideContact: boolean) {
  const base = basePieces(templateId, data, hideContact);
  // Profile already parks languages + awards in the side column.
  let pieces: ReactNode[];
  if (templateId === "apex") {
    pieces = [...base, ...extraPieces(data, "apex", THUMB_SIDEBAR_EXTRA_SKIP)];
  } else if (templateId === "cabinet") pieces = [...base, ...extraPieces(data, "cab", THUMB_SIDEBAR_EXTRA_SKIP)];
  else if (templateId === "manor") pieces = [...base, ...extraPieces(data, "manor", /language/i)];
  else if (templateId === "canvas") pieces = [...base, ...extraPieces(data, "canvas", /passion|hobb|interest/i)];
  else if (templateId === "cobalt") pieces = [...base, ...extraPieces(data, "cobalt", COBALT_SIDEBAR_EXTRA_SKIP)];
  else if (templateId === "studio") pieces = [...base, ...extraPieces(data, "studio")];
  else if (templateId === "vault") pieces = [...base, ...extraPieces(data, "vault", VAULT_SIDEBAR_EXTRA_SKIP)];
  else if (templateId === "plaza") pieces = [...base, ...extraPieces(data, "plaza")];
  else if (templateId === "skyline") pieces = [...base, ...extraPieces(data, "skyline")];
  else if (templateId === "harbor") pieces = [...base, ...extraPieces(data, "harbor", /language/i)];
  else if (templateId === "atlas") pieces = [...base, ...extraPieces(data, "atlas", VAULT_SIDEBAR_EXTRA_SKIP)];
  else if (templateId === "beacon") pieces = [...base, ...extraPieces(data, "beacon")];
  else if (templateId === "mint") pieces = [...base, ...extraPieces(data, "mint")];
  else if (templateId === "banner") pieces = [...base, ...extraPieces(data, "banner")];
  else if (templateId === "formal") pieces = [...base, ...extraPieces(data, "formal")];
  else {
    const kind: ExtraKind = templateId === "editorial" || templateId === "classic" ? "ed" : "sig";
    pieces = [...base, ...extraPieces(data, kind)];
  }
  return orderPieces(pieces, resolveSectionOrder(data), sectionsOmittedFromPage(data));
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
  if (templateId === "atlas") return atlasMainPieces(data);
  if (templateId === "skyline") return skylinePieces(data, hideContact);
  if (templateId === "harbor") return harborPieces(data, hideContact);
  if (templateId === "beacon") return beaconPieces(data, hideContact);
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
        <div className="split-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
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
          <div className="split-name">{data.personal.fullName ? <RichLine text={data.personal.fullName} /> : "Your name"}</div>
          <p className="split-role">{data.personal.title ? <RichLine text={data.personal.title} /> : "Your title"}</p>
          <div className="split-contact"><ContactLines personal={data.personal} hideContact={hideContact} /></div>
        </div>
      )}
      {sectionOnCv(data, "skills") ? (
        <div data-section="skills">
          <ResumeSectionLabel className="sig-label">Skills</ResumeSectionLabel>
          <SkillBlocks skills={data.skills} />
        </div>
      ) : null}
      {sectionOnCv(data, "education") ? (
        <div data-section="education">
          <ResumeSectionLabel className="sig-label">Education</ResumeSectionLabel>
          {data.education.map((item) => (
            <div className="side-edu" key={item.id} data-section="education" data-focus={item.id}>
              <strong><RichLine text={item.degree} /></strong>
              <div>{[item.school, item.year].filter(Boolean).join(" · ")}</div>
            </div>
          ))}
        </div>
      ) : null}
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
  const continued = pageIndex > 0;
  const classes = `paper ${
    isAtsSplit(templateId)
      ? templateId
      : isSidebar(templateId) || isRightbar(templateId)
        ? `split ${templateId}`
        : templateId
  } ${fontClass(data.fontId)}${data.accent ? " has-accent" : ""}${
    data.align ? ` is-align-${data.align}` : ""
  }${data.bodyAlign ? ` is-body-${data.bodyAlign}` : ""}${continued && isAtsSplit(templateId) ? " is-continued" : ""}`;
  // accent, type size, spacing and line height, read by the template rules
  const tint = paperStyle(data) as CSSProperties;
  if (templateId === "apex") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {continued ? <ApexSide data={data} /> : <ApexChrome data={data} hideContact={hideContact} />}
        <div className="apex-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "cabinet") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {continued ? <CabinetSide data={data} /> : <CabinetChrome data={data} hideContact={hideContact} />}
        <div className="cab-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "manor") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        <ManorSide data={data} hideContact={hideContact} />
        {continued ? null : <ManorHead data={data} />}
        <div className="manor-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "canvas") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {continued ? <CanvasSide data={data} /> : <CanvasChrome data={data} hideContact={hideContact} />}
        <div className="canvas-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "cobalt") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        <CobaltChrome data={data} hideContact={hideContact} />
        <div className="cobalt-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "vault") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {continued ? <VaultSide data={data} hideContact={hideContact} /> : <VaultChrome data={data} hideContact={hideContact} />}
        <div className="vault-main">{children}{number}</div>
      </article>
    );
  }
  if (templateId === "atlas") {
    return (
      <article ref={paperRef} className={classes} style={tint}>
        {continued ? <AtlasSide data={data} hideContact={hideContact} /> : <AtlasChrome data={data} hideContact={hideContact} />}
        <div className="atlas-main">{children}{number}</div>
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

const PAGE_H = 1123;

/** Main column on page 1 is shorter when a fixed header sits above the measured main flow. */
const ATS_CHROME_RESERVE: Partial<Record<TemplateId, number>> = {
  apex: 152,
  cabinet: 168,
  manor: 148,
  canvas: 138,
  vault: 140,
  atlas: 132,
};

/** Split layouts where the sidebar owns identity — main column uses the full page height. */
const ATS_MAIN_FULL_HEIGHT = new Set<TemplateId>(["cobalt"]);

function sumHeights(heights: number[], indexes: number[]) {
  return indexes.reduce((total, index) => total + (heights[index] || 0), 0);
}

function fillPages(heights: number[], pages: number[][], softLimit: number) {
  for (let page = 0; page < pages.length - 1; ) {
    const current = pages[page];
    const next = pages[page + 1];
    if (!next?.length) {
      page += 1;
      continue;
    }
    const trial = [...current, next[0]];
    if (sumHeights(heights, trial) <= softLimit) {
      current.push(next.shift()!);
      if (!next.length) pages.splice(page + 1, 1);
      continue;
    }
    page += 1;
  }
  return pages;
}

function pack(heights: number[], hardLimit: number, softLimit: number) {
  const pages: number[][] = [];
  let current: number[] = [];
  let used = 0;
  let limit = hardLimit;
  heights.forEach((height, index) => {
    if (current.length && used + height > limit) {
      pages.push(current);
      current = [];
      used = 0;
      limit = Math.max(600, hardLimit - 24);
    }
    current.push(index);
    used += height;
  });
  if (current.length || !pages.length) pages.push(current);

  fillPages(heights, pages, softLimit);

  // A lone certification / short block on the last page looks broken. Pull a
  // few blocks from the previous page so the final sheet has real content.
  while (pages.length > 1) {
    const last = pages[pages.length - 1];
    if (sumHeights(heights, last) >= 160) break;
    const prev = pages[pages.length - 2];
    if (prev.length <= 3) break;
    last.unshift(prev.pop()!);
  }
  return pages;
}

function flowBlockHeights(nodes: HTMLElement[]) {
  if (!nodes.length) return [];
  return nodes.map((node, index) => {
    const rect = node.getBoundingClientRect();
    const boxH = Math.max(node.offsetHeight, Math.ceil(rect.height));
    if (index < nodes.length - 1) {
      const gap = nodes[index + 1].getBoundingClientRect().top - rect.top;
      const stepped = Math.round(gap * 10) / 10;
      // Collapsed measure grids can stack blocks at y≈0 — gap lies, so use box height.
      if (stepped >= boxH * 0.45) return Math.max(1, stepped);
      return Math.max(1, boxH);
    }
    const style = getComputedStyle(node);
    const child = node.lastElementChild as HTMLElement | null;
    const extra = Math.max(
      parseFloat(style.marginBottom) || 0,
      child ? parseFloat(getComputedStyle(child).marginBottom) || 0 : 0,
    );
    return Math.max(1, Math.round((boxH + extra) * 10) / 10);
  });
}

function paginationFlowRoot(root: HTMLElement, templateId?: TemplateId) {
  if (!templateId) return root;
  const mainClass = ATS_MAIN[templateId];
  if (mainClass) {
    const main = root.querySelector(`:scope .${mainClass}`);
    if (main instanceof HTMLElement) return main;
  }
  if (isSidebar(templateId) || isRightbar(templateId)) {
    const splitMain = root.querySelector(":scope .split-main");
    if (splitMain instanceof HTMLElement) return splitMain;
  }
  return root;
}

function pagesFrom(root: HTMLElement, tight = false, templateId?: TemplateId) {
  const flowRoot = paginationFlowRoot(root, templateId);
  let nodes = [...flowRoot.querySelectorAll(":scope > .flow-block")] as HTMLElement[];
  if (!nodes.length) {
    nodes = [...flowRoot.querySelectorAll(".flow-block")] as HTMLElement[];
  }
  if (!nodes.length) return [[]];

  const style = getComputedStyle(flowRoot);
  const padTop = parseFloat(style.paddingTop) || 0;
  const padBottom = parseFloat(style.paddingBottom) || 0;
  const borderTop = parseFloat(style.borderTopWidth) || 0;
  const borderBottom = parseFloat(style.borderBottomWidth) || 0;
  const inner = PAGE_H - padTop - padBottom - borderTop - borderBottom;
  const hardSlack = tight ? 10 : 6;
  const fillSlack = tight ? 52 : 92;
  let hardLimit = inner - hardSlack;
  const softLimit = hardLimit + fillSlack;

  let chrome = 0;
  if (templateId && isAtsSplit(templateId) && !ATS_MAIN_FULL_HEIGHT.has(templateId)) {
    chrome = ATS_CHROME_RESERVE[templateId] || 0;
  }
  if (chrome) hardLimit = Math.max(480, hardLimit - chrome);

  const heights = flowBlockHeights(nodes);
  const contentTop = flowRoot.getBoundingClientRect().top + borderTop + padTop;
  const lead = nodes[0].getBoundingClientRect().top - contentTop;
  if (lead > 6) heights[0] += Math.min(lead, 28);

  return pack(heights, Math.max(500, hardLimit), Math.max(500, softLimit));
}

function pieceKey(node: ReactNode): string {
  if (!isValidElement(node)) return "";
  return String(node.key ?? "");
}

/** Keep each role title with its bullets when pagination splits mid-job. */
function stitchExperiencePages(pages: number[][], keys: string[]): number[][] {
  const out = pages.map((page) => [...page]);
  for (let pi = 1; pi < out.length; pi++) {
    const page = out[pi];
    if (!page.length) continue;
    const firstKey = keys[page[0]] || "";
    const bulletMatch = firstKey.match(/^(.+)-b\d+$/);
    if (!bulletMatch) continue;
    const jobId = bulletMatch[1];
    const headIdx = keys.indexOf(`${jobId}-head`);
    if (headIdx < 0 || page.includes(headIdx)) continue;
    const prev = out[pi - 1];
    const headPos = prev.indexOf(headIdx);
    if (headPos < 0) continue;
    prev.splice(headPos, 1);
    page.unshift(headIdx);
  }
  for (let pi = 0; pi < out.length - 1; pi++) {
    const page = out[pi];
    if (!page.length) continue;
    const lastIdx = page[page.length - 1];
    const headMatch = (keys[lastIdx] || "").match(/^(.+)-head$/);
    if (!headMatch) continue;
    const jobId = headMatch[1];
    const next = out[pi + 1];
    const hasBullet = next.some((idx) => (keys[idx] || "").startsWith(`${jobId}-b`));
    if (!hasBullet) continue;
    page.pop();
    next.unshift(lastIdx);
  }
  return out;
}

const SECTIONS = new Set<string>(["details", "bio", "experience", "education", "skills", "extras"]);

const ATS_MAIN: Partial<Record<TemplateId, string>> = {
  apex: "apex-main",
  cabinet: "cab-main",
  manor: "manor-main",
  canvas: "canvas-main",
  cobalt: "cobalt-main",
  vault: "vault-main",
  atlas: "atlas-main",
};

function measurePaperClass(templateId: TemplateId) {
  if (isSidebar(templateId) || isRightbar(templateId)) return "measure-split";
  return templateId;
}

function wrapForMeasure(templateId: TemplateId, children: ReactNode) {
  const mainClass = ATS_MAIN[templateId];
  if (mainClass) return <div className={mainClass}>{children}</div>;
  if (isSidebar(templateId) || isRightbar(templateId)) {
    return <div className="split-main">{children}</div>;
  }
  return children;
}

export function ResumeView({
  templateId: rawId,
  data,
  hideContact = false,
  onPick,
  cornerAction,
  fitPagesInView = false,
  singlePagePreview = false,
}: {
  templateId: TemplateId;
  data: ResumeData;
  hideContact?: boolean;
  onPick?: (section: PanelId, focusId?: string) => void;
  /** Floated over the top-right of the first page (e.g. look control in full view). */
  cornerAction?: ReactNode;
  /** Shrink scale so multiple pages fit without excessive scroll (e.g. Change design). */
  fitPagesInView?: boolean;
  /** Change-design modal: one sheet, all blocks — split layouts avoid bad pagination measure. */
  singlePagePreview?: boolean;
}) {
  const templateId = readTemplateId(rawId);
  const pieces = piecesFor(templateId, data, hideContact);
  const measurePieces = piecesFor(templateId, data, hideContact);
  const measureRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>([pieces.map((_, index) => index)]);
  const [scale, setScale] = useState(0.62);

  useLayoutEffect(() => {
    if (singlePagePreview) return;
    const all = pieces.map((_, index) => index);
    const root = measureRef.current;
    if (!root) return;
    let cancelled = false;
    const keys = measurePieces.map((node) => pieceKey(node));
    const measure = () => {
      if (cancelled) return;
      const raw = pagesFrom(root, false, templateId);
      let next = stitchExperiencePages(raw, keys);
      if (!next[0]?.length) next = [all];
      setPages((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
    };
    measure();
    const fonts = document.fonts;
    if (fonts?.ready) {
      fonts.ready.then(() => {
        if (!cancelled) requestAnimationFrame(measure);
      });
    }
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(root);
    const flowRoot = paginationFlowRoot(root, templateId);
    if (flowRoot !== root) ro.observe(flowRoot);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [templateId, data, hideContact, measurePieces, singlePagePreview, pieces.length]);

  const allIndexes = pieces.map((_, index) => index);
  const resolvedPages = singlePagePreview ? [allIndexes] : pages;

  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const pageCount = resolvedPages.length;
    const measure = () => {
      const width = node.clientWidth;
      const height = node.clientHeight;
      if (!width) return;
      const padX = width < 520 ? 20 : 36;
      let next = Math.min(1, (width - padX) / 794);
      if (fitPagesInView && pageCount > 1 && height > 80) {
        const gap = 10;
        const padY = 32;
        const byHeight = (height - padY - gap * (pageCount - 1)) / (pageCount * 1123);
        if (byHeight > 0.22) next = Math.min(next, byHeight);
      }
      const floor = width < 520 ? 0.38 : 0.42;
      setScale(Math.max(floor, next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [fitPagesInView, resolvedPages.length, singlePagePreview]);

  const pageIndexes = (indexes: number[]) => (indexes.length ? indexes : allIndexes);

  const sheet = (indexes: number[], pageIndex: number) => (
    <Frame templateId={templateId} data={data} hideContact={hideContact} pageIndex={pageIndex} total={resolvedPages.length}>
      {pageIndexes(indexes).map((index) => pieces[index]).filter(Boolean)}
    </Frame>
  );

  return (
    <>
      {singlePagePreview ? null : (
        <div
          className={`measure-col paper ${measurePaperClass(templateId)}${isRightbar(templateId) ? " measure-quartz" : ""} ${fontClass(data.fontId)}${data.align ? ` is-align-${data.align}` : ""}${data.bodyAlign ? ` is-body-${data.bodyAlign}` : ""}`}
          style={paperStyle(data) as CSSProperties}
          ref={measureRef}
          aria-hidden="true"
        >
          {isRightbar(templateId) && <QuartzBanner data={data} hideContact={hideContact} />}
          {wrapForMeasure(templateId, measurePieces)}
        </div>
      )}
      <div
        className={`${onPick ? "page-stack is-linked" : "page-stack"}${resolvedPages.length > 1 ? " is-multi" : ""}`}
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
        {resolvedPages.map((indexes, index) => (
          <div key={`${templateId}-${index}`} className="page-slot" style={{ width: 794 * scale, height: 1123 * scale }}>
            {index === 0 && cornerAction ? <div className="page-corner">{cornerAction}</div> : null}
            <div style={{ width: 794, height: 1123, transform: `scale(${scale})`, transformOrigin: "top left" }}>{sheet(indexes, index)}</div>
          </div>
        ))}
      </div>
      <div className="print-root" aria-hidden="true">
        {resolvedPages.map((indexes, index) => <div key={`print-${index}`}>{sheet(indexes, index)}</div>)}
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
  const measurePieces = preview && !fill ? piecesFor(templateId, data, hideContact) : null;
  const measureRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLElement>(null);
  const [firstPage, setFirstPage] = useState<{ indexes: number[]; total: number } | null>(null);

  useLayoutEffect(() => {
    if (!preview || fill) return;
    const root = measureRef.current;
    if (!root) return;
    const keys = pieces.map((node) => pieceKey(node));
    const pages = stitchExperiencePages(pagesFrom(root, true, templateId), keys);
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

  const allPreviewIndexes = pieces.map((_, index) => index);
  const indexes =
    preview && !fill && firstPage
      ? firstPage.indexes.length
        ? firstPage.indexes
        : allPreviewIndexes
      : allPreviewIndexes;
  const total = preview && !fill && firstPage ? firstPage.total : 1;
  const measure =
    preview && !fill && measurePieces ? (
      <div
        className={`measure-col paper ${measurePaperClass(templateId)}${isRightbar(templateId) ? " measure-quartz" : ""} ${fontClass(data.fontId)}${data.align ? ` is-align-${data.align}` : ""}${data.bodyAlign ? ` is-body-${data.bodyAlign}` : ""}`}
        style={paperStyle(data) as CSSProperties}
        ref={measureRef}
        aria-hidden="true"
      >
        {isRightbar(templateId) && <QuartzBanner data={data} hideContact={hideContact} />}
        {wrapForMeasure(templateId, measurePieces)}
      </div>
    ) : null;

  const sheet = (
    <>
      {measure}
      <Frame templateId={templateId} data={data} hideContact={hideContact} pageIndex={0} total={total} paperRef={preview ? paperRef : undefined}>
        {indexes.map((index) => pieces[index]).filter(Boolean)}
      </Frame>
    </>
  );

  if (!preview) return sheet;

  return <ResumeDecorProvider decorative>{sheet}</ResumeDecorProvider>;
}
