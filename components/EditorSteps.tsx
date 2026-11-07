"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CountrySelect, DateFields, Field, SearchSelect, SearchTags, YEARS } from "./Field";
import { joinPlace, splitPlace, useCountries } from "@/lib/countries";
import { Monogram } from "./Monogram";
import { RichEditor } from "./RichEditor";
import { StepCard } from "./StepCard";
import { Pencil, Spark, Trash } from "./icons";
import { INDUSTRY_SKILLS, OTHER_SKILLS, TOOL_SKILLS } from "@/lib/skills";
import { newId } from "@/lib/id";
import { templateHasPhoto, type ResumeData, type TemplateId } from "@/lib/types";
import type { Errors } from "@/lib/validate";

type Improve = (key: string, kind: "summary" | "bullets" | "tailor", text: string) => Promise<string | null>;

/** City stays free text. The country is always picked from the public list. */
function PlaceFields({
  location,
  onChange,
}: {
  location: string;
  onChange: (location: string) => void;
}) {
  const { countries } = useCountries();
  const place = splitPlace(location, countries);
  return (
    <>
      <Field
        label="City"
        optional
        value={place.city}
        placeholder="Bengaluru"
        onChange={(city) => onChange(joinPlace(city, place.country))}
      />
      <CountrySelect value={place.country} onChange={(country) => onChange(joinPlace(place.city, country))} />
    </>
  );
}

type BulletLine = { id: string; text: string };

function linesFrom(bullets: string[]): BulletLine[] {
  const source = bullets.length ? bullets : [""];
  return source.map((text) => ({ id: newId(), text }));
}

function cleanBullet(text: string) {
  return text.replace(/^\s*(?:[•\-*–]|\d+[.)])\s+/, "");
}

/**
 * One list instead of a field per bullet. Enter opens the next line,
 * Backspace on an empty line removes it, and a pasted block splits into lines.
 */
function BulletList({
  bullets,
  onChange,
  onDone,
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
  onDone: () => void;
}) {
  const [lines, setLines] = useState<BulletLine[]>(() => linesFrom(bullets));
  const [focusTick, setFocusTick] = useState(0);
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const nodes = useRef(new Map<string, HTMLTextAreaElement>());
  const pending = useRef<{ index: number; caret: number } | null>(null);

  useEffect(() => {
    const local = linesRef.current.map((line) => line.text).join("\u0001");
    if (bullets.join("\u0001") !== local) setLines(linesFrom(bullets));
  }, [bullets]);

  useLayoutEffect(() => {
    for (const line of lines) {
      const node = nodes.current.get(line.id);
      if (!node) continue;
      node.style.height = "0px";
      node.style.height = `${node.scrollHeight}px`;
    }
    const intent = pending.current;
    if (!intent) return;
    pending.current = null;
    const line = lines[intent.index];
    const node = line ? nodes.current.get(line.id) : undefined;
    if (!node) return;
    node.focus();
    const caret = Math.max(0, Math.min(intent.caret, node.value.length));
    node.setSelectionRange(caret, caret);
  }, [lines, focusTick]);

  const commit = (next: BulletLine[], focus?: { index: number; caret: number }) => {
    const safe = next.length ? next : [{ id: newId(), text: "" }];
    if (focus) pending.current = { index: Math.min(focus.index, safe.length - 1), caret: focus.caret };
    setLines(safe);
    onChange(safe.map((line) => line.text));
  };

  const focusLine = (index: number, caret: number) => {
    pending.current = { index, caret };
    setFocusTick((tick) => tick + 1);
  };

  const addAfter = (index: number) => {
    const current = lines[index];
    if (!current) return;
    const node = nodes.current.get(current.id);
    const start = node?.selectionStart ?? current.text.length;
    const end = node?.selectionEnd ?? start;
    const created = { id: newId(), text: current.text.slice(end) };
    const next = lines.map((line) => (line.id === current.id ? { ...line, text: current.text.slice(0, start) } : line));
    next.splice(index + 1, 0, created);
    commit(next, { index: index + 1, caret: 0 });
  };

  const addAtEnd = () => {
    const lastIndex = lines.length - 1;
    const last = lines[lastIndex];
    if (last && !last.text) {
      focusLine(lastIndex, 0);
      return;
    }
    commit([...lines, { id: newId(), text: "" }], { index: lines.length, caret: 0 });
  };

  const removeAt = (index: number) => {
    const next = lines.filter((_, lineIndex) => lineIndex !== index);
    if (!next.length) {
      commit([{ id: newId(), text: "" }], { index: 0, caret: 0 });
      return;
    }
    const target = index > 0 ? index - 1 : 0;
    commit(next, { index: target, caret: index > 0 ? next[target].text.length : 0 });
  };

  return (
    <div className="bullet-list" role="group" aria-label="What you did">
      {lines.map((line, index) => (
        <div className="bullet-line" key={line.id}>
          <span className="bullet-mark" aria-hidden="true">•</span>
          <textarea
            ref={(node) => {
              if (node) nodes.current.set(line.id, node);
              else nodes.current.delete(line.id);
            }}
            rows={1}
            value={line.text}
            aria-label={`What you did, line ${index + 1}`}
            onChange={(event) => {
              const value = event.target.value;
              if (!/[\n\r]/.test(value)) {
                commit(lines.map((item) => (item.id === line.id ? { ...item, text: value } : item)));
                return;
              }
              const parts = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map(cleanBullet);
              const created = parts.map((text, partIndex) => (partIndex === 0 ? { ...line, text } : { id: newId(), text }));
              const next = [...lines.slice(0, index), ...created, ...lines.slice(index + 1)];
              commit(next, { index: index + created.length - 1, caret: created[created.length - 1]?.text.length ?? 0 });
            }}
            onPaste={(event) => {
              const raw = event.clipboardData.getData("text");
              if (!raw) return;
              const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
              const marked = /^\s*(?:[•\-*–]|\d+[.)])\s+/.test(normalized);
              if (!normalized.includes("\n") && !marked) return;
              event.preventDefault();
              const node = event.currentTarget;
              const start = node.selectionStart ?? line.text.length;
              const end = node.selectionEnd ?? start;
              const chunks = normalized.split("\n").map(cleanBullet);
              const parts =
                chunks.length === 1
                  ? [line.text.slice(0, start) + chunks[0] + line.text.slice(end)]
                  : [line.text.slice(0, start) + chunks[0], ...chunks.slice(1, -1), chunks[chunks.length - 1] + line.text.slice(end)];
              const created = parts.map((text, partIndex) => (partIndex === 0 ? { ...line, text } : { id: newId(), text }));
              const next = [...lines.slice(0, index), ...created, ...lines.slice(index + 1)];
              const caret = chunks.length === 1 ? start + chunks[0].length : chunks[chunks.length - 1].length;
              commit(next, { index: index + created.length - 1, caret });
            }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Enter") {
                event.preventDefault();
                addAfter(index);
                return;
              }
              const node = event.currentTarget;
              const atStart = node.selectionStart === 0 && node.selectionEnd === 0;
              const atEnd = node.selectionStart === line.text.length && node.selectionEnd === line.text.length;
              if (event.key === "Backspace" && atStart) {
                event.preventDefault();
                if (!line.text) {
                  if (lines.length > 1) removeAt(index);
                  return;
                }
                if (index === 0) return;
                const prev = lines[index - 1];
                const next = lines
                  .filter((item) => item.id !== line.id)
                  .map((item) => (item.id === prev.id ? { ...item, text: prev.text + line.text } : item));
                commit(next, { index: index - 1, caret: prev.text.length });
                return;
              }
              if (event.key === "ArrowUp" && atStart && index > 0) {
                event.preventDefault();
                focusLine(index - 1, lines[index - 1].text.length);
              }
              if (event.key === "ArrowDown" && atEnd && index < lines.length - 1) {
                event.preventDefault();
                focusLine(index + 1, 0);
              }
            }}
          />
          <button type="button" className="bullet-x" aria-label={`Remove bullet ${index + 1}`} onClick={() => removeAt(index)}>
            <Trash />
          </button>
        </div>
      ))}
      <div className="bullet-foot">
        <button type="button" className="bullet-add" onClick={addAtEnd}>
          + Add another
        </button>
        <button type="button" className="ghost bullet-done" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}

function squarePhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that photo."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That file is not a photo this browser can use."));
      image.onload = () => {
        const size = 360;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Could not prepare that photo."));
          return;
        }
        const scale = Math.max(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        const encoded = canvas.toDataURL("image/jpeg", 0.82);
        if (encoded.length > 180000) {
          reject(new Error("That photo is too large. Try a smaller one."));
          return;
        }
        resolve(encoded);
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

export function DetailsStep({
  data,
  templateId,
  errors = {},
  onData,
}: {
  data: ResumeData;
  templateId: TemplateId;
  errors?: Errors;
  onData: (data: ResumeData) => void;
}) {
  const personal = data.personal;
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");
  const showPhoto = templateHasPhoto(templateId);
  const set = (key: keyof ResumeData["personal"], value: string) => {
    onData({ ...data, personal: { ...personal, [key]: value } });
  };

  const choosePhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose a photo file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError("Choose a photo under 8 MB.");
      return;
    }
    try {
      set("photoUrl", await squarePhoto(file));
      setPhotoError("");
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Could not use that photo.");
    }
  };

  const photoField = showPhoto ? (
    <div className="fld span-all photo-row">
      <div className="fld-top">
        <span className="fld-label">Profile photo</span>
      </div>
      <div className="photo-upload">
        <Monogram name={personal.fullName} photoUrl={personal.photoUrl} size={44} />
        <div className="photo-actions">
          <button type="button" className="ghost" onClick={() => fileRef.current?.click()}>
            {personal.photoUrl ? "Change photo" : "Upload photo"}
          </button>
          {personal.photoUrl && (
            <button
              type="button"
              className="ghost"
              onClick={() => {
                set("photoUrl", "");
                setPhotoError("");
              }}
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void choosePhoto(file);
          }}
        />
      </div>
      {photoError && <p className="fld-note is-bad">{photoError}</p>}
    </div>
  ) : null;

  return (
    <StepCard plain>
      <div className="step-group span-all">
        <header className="step-group-head">
          <h2>Details</h2>
        </header>
        {photoField}
        <div className="pair span-all">
          <Field
            label="Full name"
            error={errors.fullName}
            value={personal.fullName}
            autoComplete="name"
            placeholder="Alex Rivera"
            onChange={(value) => set("fullName", value)}
          />
          <Field
            label="Job title"
            error={errors.title}
            value={personal.title}
            placeholder="Senior Product Designer"
            onChange={(value) => set("title", value)}
          />
        </div>
        <div className="pair span-all">
          <Field label="Email" type="email" error={errors.email} value={personal.email} autoComplete="email" placeholder="you@work.com" onChange={(value) => set("email", value)} />
          <Field label="Phone" optional type="tel" value={personal.phone} autoComplete="tel" placeholder="+91 98400 22190" onChange={(value) => set("phone", value)} />
        </div>
      </div>

      <div className="step-group span-all">
        <header className="step-group-head">
          <h2>Location</h2>
        </header>
        <PlaceFields location={personal.location} onChange={(value) => set("location", value)} />
        <Field
          label="Pin code"
          optional
          value={personal.pincode || ""}
          placeholder="560001"
          inputMode="numeric"
          onChange={(value) => set("pincode", value)}
        />
        <Field
          label="LinkedIn"
          optional
          value={personal.linkedin || ""}
          placeholder="linkedin.com/in/you"
          onChange={(value) => set("linkedin", value)}
        />
        <Field
          label="GitHub"
          optional
          value={personal.github || ""}
          placeholder="github.com/you"
          onChange={(value) => set("github", value)}
        />
        <Field
          label="Website"
          optional
          value={personal.website || ""}
          placeholder="yoursite.com"
          onChange={(value) => set("website", value)}
        />
        <Field
          label="Portfolio"
          optional
          value={personal.portfolio || ""}
          placeholder="dribbble.com/you"
          onChange={(value) => set("portfolio", value)}
        />
      </div>
    </StepCard>
  );
}

/**
 * How many screens each step is split across. A step with a long form shows a
 * few fields at a time, and the footer's Next walks through them before moving
 * on to the next step.
 */
export const STEP_PAGES: Record<string, number> = {
  details: 1,
  bio: 1,
  experience: 1,
  education: 1,
  skills: 1,
};

export function BioStep({
  data,
  onData,
  onImprove,
  improving,
}: {
  data: ResumeData;
  onData: (data: ResumeData) => void;
  onImprove: Improve;
  improving: string | null;
}) {
  return (
    <StepCard title="How would you sum yourself up?" grid={false} plain>
      <RichEditor
        label="Summary"
        value={data.summary}
        placeholder="A short professional summary"
        asideBelow
        onChange={(summary) => onData({ ...data, summary })}
        aside={
          <button
            type="button"
            className="ai-side"
            disabled={!data.summary.trim() || improving === "summary"}
            onClick={async () => {
              const next = await onImprove("summary", "summary", data.summary);
              if (next) onData({ ...data, summary: next });
            }}
          >
            <Spark />
            <span>{improving === "summary" ? "Improving…" : "Improve"}</span>
          </button>
        }
      />
    </StepCard>
  );
}

export function ExperienceStep({
  data,
  onData,
  onImprove,
  improving,
  focusId,
  focusTick,
  errors = {},
}: {
  data: ResumeData;
  onData: (data: ResumeData) => void;
  onImprove: Improve;
  improving: string | null;
  focusId?: string;
  focusTick?: number;
  errors?: Errors;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!focusId) return;
    setEditing(focusId);
    const node = document.querySelector(`[data-entry="${focusId}"]`) as HTMLElement | null;
    const pane = node?.closest(".work-scroll") as HTMLElement | null;
    if (!node || !pane) return;
    const pad = 24;
    const paneBox = pane.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    if (box.top < paneBox.top + pad) pane.scrollTop -= paneBox.top + pad - box.top;
    else if (box.bottom > paneBox.bottom - pad) pane.scrollTop += box.bottom - (paneBox.bottom - pad);
  }, [focusId, focusTick]);

  const update = (id: string, patch: Partial<ResumeData["experience"][number]>) => {
    onData({
      ...data,
      experience: data.experience.map((job) => (job.id === id ? { ...job, ...patch } : job)),
    });
  };

  const add = () => {
    const job = {
      id: newId(),
      role: "",
      company: "",
      location: "",
      start: "",
      end: "",
      current: false,
      bullets: [""],
    };
    onData({ ...data, experience: [job, ...data.experience] });
    setEditing(job.id);
  };

  return (
    <StepCard title="Where have you worked?" grid={false} plain>
      {data.experience.map((job) => {
        const shown = open[job.id] ? job.bullets : job.bullets.slice(0, 2);
        const range = [job.start, job.current ? "present" : job.end].filter(Boolean).join(" – ");
        return (
          <article className="item" key={job.id} data-entry={job.id}>
            {editing === job.id ? (
              <div className="stack">
                <div className="form-grid">
                  <Field className="span-all" label="Role" error={errors[`role:${job.id}`]} value={job.role} placeholder="Product designer" onChange={(value) => update(job.id, { role: value })} />
                  <Field className="span-all" label="Company" error={errors[`company:${job.id}`]} value={job.company} placeholder="Studio name" onChange={(value) => update(job.id, { company: value })} />
                  <PlaceFields location={job.location} onChange={(value) => update(job.id, { location: value })} />
                  <DateFields
                    start={job.start}
                    end={job.end}
                    current={job.current}
                    onStart={(start) => update(job.id, { start })}
                    onEnd={(end) => update(job.id, { end, current: false })}
                    onCurrent={(current) => update(job.id, { current, end: current ? "" : job.end })}
                  />
                </div>
                <div className="desc-head">
                  <div className="desc-copy">
                    <span className="block-label">What you did</span>
                  </div>
                  <button
                    type="button"
                    className="ai-side"
                    disabled={improving === `bullets:${job.id}` || !job.bullets.some((bullet) => bullet.trim())}
                    onClick={async () => {
                      const next = await onImprove(`bullets:${job.id}`, "bullets", job.bullets.filter(Boolean).join("\n"));
                      if (!next) return;
                      update(job.id, { bullets: next.split("\n").map((line) => line.replace(/^[-•*]\s*/, "").trim()).filter(Boolean) });
                    }}
                  >
                    <Spark />
                    <span>{improving === `bullets:${job.id}` ? "Improving…" : "Improve"}</span>
                  </button>
                </div>
                <BulletList
                  bullets={job.bullets}
                  onChange={(bullets) => update(job.id, { bullets })}
                  onDone={() => setEditing(null)}
                />
              </div>
            ) : (
              <>
                <div className="item-top">
                  <div>
                    <h3>{[job.role || "Untitled role", job.company].filter(Boolean).join(", ")}</h3>
                    <div className="meta">{[job.location, range && `(${range})`].filter(Boolean).join(" · ")}</div>
                  </div>
                  <div className="icon-row">
                    <button type="button" className="icon-btn" aria-label="Edit experience" onClick={() => setEditing(job.id)}><Pencil /></button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Delete experience"
                      onClick={() => onData({ ...data, experience: data.experience.filter((item) => item.id !== job.id) })}
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
                <ul>
                  {shown.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}
                </ul>
                {job.bullets.filter(Boolean).length > 2 && (
                  <button type="button" className="see-more" onClick={() => setOpen((current) => ({ ...current, [job.id]: !current[job.id] }))}>
                    {open[job.id] ? "See less" : "See more"}
                  </button>
                )}
              </>
            )}
          </article>
        );
      })}
      {!data.experience.length && <p className="empty-note">No roles yet.</p>}
      <button type="button" className="add-row" onClick={add}><span className="add-plus">+</span> Add experience</button>
    </StepCard>
  );
}

export function EducationStep({
  data,
  onData,
  focusId,
  focusTick,
  errors = {},
}: {
  data: ResumeData;
  onData: (data: ResumeData) => void;
  focusId?: string;
  focusTick?: number;
  errors?: Errors;
}) {
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!focusId) return;
    setEditing(focusId);
    const node = document.querySelector(`[data-entry="${focusId}"]`) as HTMLElement | null;
    const pane = node?.closest(".work-scroll") as HTMLElement | null;
    if (!node || !pane) return;
    const pad = 24;
    const paneBox = pane.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    if (box.top < paneBox.top + pad) pane.scrollTop -= paneBox.top + pad - box.top;
    else if (box.bottom > paneBox.bottom - pad) pane.scrollTop += box.bottom - (paneBox.bottom - pad);
  }, [focusId, focusTick]);
  const update = (id: string, patch: Partial<ResumeData["education"][number]>) => {
    onData({ ...data, education: data.education.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  };

  return (
    <StepCard title="What did you study?" grid={false} plain>
      {data.education.map((item) => (
        <article className="item" key={item.id} data-entry={item.id}>
          {editing === item.id ? (
            <div className="stack">
              <div className="form-grid">
                <Field className="span-all" label="Degree" error={errors[`degree:${item.id}`]} value={item.degree} placeholder="B.Des, Product Design" onChange={(value) => update(item.id, { degree: value })} />
                <Field className="span-all" label="School" error={errors[`school:${item.id}`]} value={item.school} placeholder="University" onChange={(value) => update(item.id, { school: value })} />
                <SearchSelect label="Year" optional value={item.year} options={YEARS} placeholder="Year" allowCustom onChange={(year) => update(item.id, { year })} />
                <Field label="Detail" optional value={item.detail} placeholder="A short note" onChange={(value) => update(item.id, { detail: value })} />
              </div>
              <button type="button" className="ghost" onClick={() => setEditing(null)}>Done</button>
            </div>
          ) : (
            <div className="item-top">
              <div>
                <h3>{item.degree || "Untitled program"}</h3>
                <div className="meta">{[item.school, item.year].filter(Boolean).join(" · ")}</div>
                {item.detail && <div className="meta">{item.detail}</div>}
              </div>
              <div className="icon-row">
                <button type="button" className="icon-btn" aria-label="Edit education" onClick={() => setEditing(item.id)}><Pencil /></button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Delete education"
                  onClick={() => onData({ ...data, education: data.education.filter((entry) => entry.id !== item.id) })}
                >
                  <Trash />
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
      <button
        type="button"
        className="add-row"
        onClick={() => {
          const item = { id: newId(), degree: "", school: "", year: "", detail: "" };
          onData({ ...data, education: [...data.education, item] });
          setEditing(item.id);
        }}
      >
        <span className="add-plus">+</span> Add education
      </button>
    </StepCard>
  );
}

const SKILL_SUGGESTIONS = [
  ...new Map(
    [...INDUSTRY_SKILLS, ...TOOL_SKILLS, ...OTHER_SKILLS].map((item) => [item.toLowerCase(), item] as const),
  ).values(),
];

const TOOL_SKILL_SET = new Set(TOOL_SKILLS.map((item) => item.toLowerCase()));
const INDUSTRY_SKILL_SET = new Set(INDUSTRY_SKILLS.map((item) => item.toLowerCase()));

function skillBucket(skill: string): keyof ResumeData["skills"] {
  const key = skill.toLowerCase();
  if (TOOL_SKILL_SET.has(key)) return "tools";
  if (INDUSTRY_SKILL_SET.has(key)) return "industry";
  return "other";
}

function mergedSkillTags(skills: ResumeData["skills"]) {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const list of [skills.industry, skills.tools, skills.other]) {
    for (const item of list) {
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push(item);
    }
  }
  return tags;
}

function splitSkillTags(tags: string[]): ResumeData["skills"] {
  const skills: ResumeData["skills"] = { industry: [], tools: [], other: [] };
  const seen = new Set<string>();
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    skills[skillBucket(tag)].push(tag);
  }
  return skills;
}

export function SkillsStep({ data, onData }: { data: ResumeData; onData: (data: ResumeData) => void }) {
  return (
    <StepCard title="What are you good at?" grid={false} plain>
      <SearchTags
        label="Skills"
        lookup="skill"
        values={mergedSkillTags(data.skills)}
        suggestions={SKILL_SUGGESTIONS}
        onChange={(tags) => onData({ ...data, skills: splitSkillTags(tags) })}
      />
    </StepCard>
  );
}
