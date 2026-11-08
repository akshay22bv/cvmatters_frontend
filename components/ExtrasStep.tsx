"use client";

import { useState } from "react";
import { StepCard } from "./StepCard";
import { Chevron, IconCheck, Trash } from "./icons";
import { EXTRA_KINDS, type Extra, type ResumeData } from "@/lib/types";

function makeId() {
  return `extra-${Math.random().toString(36).slice(2, 9)}`;
}

function sameTitle(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

function preview(extra: Extra | undefined) {
  if (!extra) return "";
  const filled = extra.items.map((item) => item.trim()).filter(Boolean);
  if (!filled.length) return "";
  if (filled.length === 1) return filled[0];
  return `${filled[0]}  +${filled.length - 1}`;
}

/**
 * Optional sections live in one accordion. A row stays a single line until it
 * is opened, and only the open row shows its lines.
 */
export function ExtrasStep({ data, onData }: { data: ResumeData; onData: (data: ResumeData) => void }) {
  const [custom, setCustom] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const extras = data.extras || [];

  const setExtras = (next: Extra[]) => onData({ ...data, extras: next });

  const find = (title: string) => extras.find((extra) => sameTitle(extra.title, title));

  const add = (title: string) => {
    const existing = find(title);
    if (existing) {
      setOpenId(existing.id);
      return existing.id;
    }
    const id = makeId();
    setExtras([...extras, { id, title, items: [""], bullets: false }]);
    setOpenId(id);
    return id;
  };

  const remove = (id: string) => {
    if (openId === id) setOpenId(null);
    setExtras(extras.filter((extra) => extra.id !== id));
  };

  const toggle = (title: string) => {
    const existing = find(title);
    if (existing) {
      remove(existing.id);
      return;
    }
    add(title);
  };

  const update = (id: string, patch: Partial<Extra>) => {
    setExtras(extras.map((extra) => (extra.id === id ? { ...extra, ...patch } : extra)));
  };

  const addCustom = () => {
    const title = custom.trim();
    if (!title) return;
    add(title);
    setCustom("");
  };

  const customExtras = extras.filter((extra) => !EXTRA_KINDS.some((kind) => sameTitle(kind.title, extra.title)));

  return (
    <StepCard className="extras-step" title="Anything else to add?" grid={false} plain>
      <div className="acc-list">
        {EXTRA_KINDS.map((kind) => {
          const extra = find(kind.title);
          return (
            <SectionRow
              key={kind.id}
              title={kind.title}
              extra={extra}
              open={!!extra && openId === extra.id}
              onToggle={() => toggle(kind.title)}
              onOpen={() => (extra ? setOpenId(openId === extra.id ? null : extra.id) : add(kind.title))}
              onChange={(items) => extra && update(extra.id, { items })}
              onBullets={(bullets) => extra && update(extra.id, { bullets })}
            />
          );
        })}
        {customExtras.map((extra) => (
          <SectionRow
            key={extra.id}
            title={extra.title}
            extra={extra}
            custom
            open={openId === extra.id}
            onToggle={() => remove(extra.id)}
            onOpen={() => setOpenId(openId === extra.id ? null : extra.id)}
            onChange={(items) => update(extra.id, { items })}
            onBullets={(bullets) => update(extra.id, { bullets })}
          />
        ))}
      </div>

      <form
        className="acc-own"
        onSubmit={(event) => {
          event.preventDefault();
          addCustom();
        }}
      >
        <input
          aria-label="Add your own section"
          value={custom}
          placeholder="Add your own, e.g. Volunteering"
          onChange={(event) => setCustom(event.target.value)}
        />
        <button type="submit" className="btn-cta is-slim" disabled={!custom.trim()}>
          Add
        </button>
      </form>
    </StepCard>
  );
}

function SectionRow({
  title,
  extra,
  custom,
  open,
  onToggle,
  onOpen,
  onChange,
  onBullets,
}: {
  title: string;
  extra?: Extra;
  custom?: boolean;
  open: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onChange: (items: string[]) => void;
  onBullets: (bullets: boolean) => void;
}) {
  const on = !!extra;
  const items = extra?.items.length ? extra.items : [""];
  const useBullets = extra?.bullets === true;
  const placeholder = title === "Languages" ? "Hindi — native" : "One short line";

  return (
    <div className={on ? (open ? "acc is-on is-open" : "acc is-on") : "acc"}>
      <div className="acc-bar">
        <button
          type="button"
          className="acc-check"
          aria-pressed={on}
          aria-label={on ? `Remove ${title}` : `Add ${title}`}
          onClick={onToggle}
        >
          <span className="acc-box" aria-hidden="true">
            <IconCheck />
          </span>
        </button>
        <button type="button" className="acc-main" aria-expanded={open} onClick={onOpen}>
          <span className="acc-copy">
            <strong>{title}</strong>
            {!open && preview(extra) ? <small>{preview(extra)}</small> : null}
          </span>
          <Chevron />
        </button>
        {custom ? (
          <button type="button" className="icon-btn acc-trash" aria-label={`Remove ${title}`} onClick={onToggle}>
            <Trash />
          </button>
        ) : null}
      </div>
      {open && extra ? (
        <div className="acc-body">
          <label className="acc-bullets">
            <input
              type="checkbox"
              checked={useBullets}
              onChange={(event) => onBullets(event.target.checked)}
            />
            <span>Show as bullets on the CV</span>
          </label>
          {items.map((item, index) => (
            <div className="acc-line" key={`${extra.id}-${index}`}>
              {useBullets ? <span className="acc-dot" aria-hidden="true">•</span> : null}
              <input
                aria-label={`${title} line ${index + 1}`}
                value={item}
                placeholder={placeholder}
                onChange={(event) => onChange(items.map((old, i) => (i === index ? event.target.value : old)))}
              />
              {items.length > 1 ? (
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Remove line"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  <Trash />
                </button>
              ) : null}
            </div>
          ))}
          <button type="button" className="acc-add" onClick={() => onChange([...items, ""])}>
            <span className="add-plus">+</span> Add a line
          </button>
        </div>
      ) : null}
    </div>
  );
}
