"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { IconCheck } from "./icons";
import {
  ACCENTS,
  FONTS,
  FONT_SIZE,
  LINE_HEIGHT,
  SPACING,
  clampMetric,
  formatMetric,
  readMetric,
  type FontId,
  type ResumeData,
} from "@/lib/types";

type MetricSpec = {
  min: number;
  max: number;
  step: number;
  base: number;
  legacy: Record<string, number>;
};

type MenuId = "font" | "color" | "space" | "lead" | null;

function parseMetric(raw: string) {
  const match = raw.trim().replace(",", ".").match(/-?\d*\.?\d+/);
  return match ? Number(match[0]) : NaN;
}

function CompactStepper({
  label,
  metric,
  value,
  unit,
  onChange,
}: {
  label: string;
  metric: MetricSpec;
  value: unknown;
  unit?: string;
  onChange: (next: number) => void;
}) {
  const id = useId();
  const current = readMetric(metric, value);
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? formatMetric(metric, current);

  const nudge = (direction: 1 | -1) => {
    const typed = draft === null ? NaN : parseMetric(draft);
    const base = Number.isFinite(typed) ? clampMetric(metric, typed) : current;
    const next = clampMetric(metric, base + direction * metric.step);
    setDraft(null);
    if (next !== current) onChange(next);
  };

  const commit = (raw: string) => {
    setDraft(null);
    const parsed = parseMetric(raw);
    if (!Number.isFinite(parsed)) return;
    const next = clampMetric(metric, parsed);
    if (next !== current) onChange(next);
  };

  return (
    <div className="look-stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={current <= metric.min} onClick={() => nudge(-1)}>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 6h7" />
        </svg>
      </button>
      <label className="look-stepper-value">
        <input
          id={id}
          role="spinbutton"
          inputMode="decimal"
          aria-label={label}
          aria-valuemin={metric.min}
          aria-valuemax={metric.max}
          aria-valuenow={current}
          autoComplete="off"
          spellCheck={false}
          value={shown}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={(event) => commit(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") {
              event.preventDefault();
              nudge(1);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "Enter") {
              event.preventDefault();
              commit(event.currentTarget.value);
            }
          }}
        />
        {unit ? <span className="look-unit">{unit}</span> : null}
      </label>
      <button type="button" aria-label={`Increase ${label}`} disabled={current >= metric.max} onClick={() => nudge(1)}>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M6 2.5v7M2.5 6h7" />
        </svg>
      </button>
    </div>
  );
}

function Menu({
  open,
  label,
  children,
}: {
  open: boolean;
  label: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="look-menu" role="dialog" aria-label={label}>
      {children}
    </div>
  );
}

/**
 * Compact look strip: font, size, colour, spacing, line height.
 * Menus open upward so they are not clipped by the picker scroll area.
 */
export function LookBar({
  data,
  onFont,
  onAccent,
  onStyle,
}: {
  data: ResumeData;
  onFont: (id: FontId) => void;
  onAccent: (hex: string | undefined) => void;
  onStyle: (look: Pick<ResumeData, "typeSize" | "spacing" | "leading">) => void;
}) {
  const [menu, setMenu] = useState<MenuId>(null);
  const root = useRef<HTMLDivElement>(null);
  const currentFont = FONTS.find((font) => font.id === (data.fontId || "sans")) || FONTS[0];
  const accent = data.accent;

  useEffect(() => {
    if (!menu) return;
    const onPointer = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const toggle = (id: MenuId) => setMenu((current) => (current === id ? null : id));

  const patchStyle = (look: Pick<ResumeData, "typeSize" | "spacing" | "leading">) => {
    onStyle({
      typeSize: look.typeSize ?? data.typeSize,
      spacing: look.spacing ?? data.spacing,
      leading: look.leading ?? data.leading,
      ...look,
    });
  };

  return (
    <div className="look-bar" role="toolbar" aria-label="Text look" ref={root}>
      <div className="look-slot">
        <button
          type="button"
          className={menu === "font" ? "look-font-btn is-on" : "look-font-btn"}
          aria-label="Font"
          aria-expanded={menu === "font"}
          aria-haspopup="listbox"
          onClick={() => toggle("font")}
        >
          <span className={`font-${currentFont.id}`}>{currentFont.name}</span>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 4.5 6 7.5 9 4.5" />
          </svg>
        </button>
        <Menu open={menu === "font"} label="Font">
          <div className="look-font-list" role="listbox" aria-label="Font">
            {FONTS.map((font) => (
              <button
                key={font.id}
                type="button"
                role="option"
                aria-selected={font.id === currentFont.id}
                className={font.id === currentFont.id ? `look-font-option font-${font.id} is-on` : `look-font-option font-${font.id}`}
                onClick={() => {
                  onFont(font.id);
                  setMenu(null);
                }}
              >
                <b>{font.sample}</b>
                <span>{font.name}</span>
              </button>
            ))}
          </div>
        </Menu>
      </div>

      <CompactStepper
        label="Font size"
        metric={FONT_SIZE}
        value={data.typeSize}
        unit="pt"
        onChange={(typeSize) => patchStyle({ typeSize })}
      />

      <div className="look-sep" aria-hidden="true" />

      <div className="look-slot">
        <button
          type="button"
          className={menu === "color" ? "look-tool is-on" : "look-tool"}
          aria-label="Colour"
          aria-expanded={menu === "color"}
          aria-haspopup="dialog"
          title="Colour"
          onClick={() => toggle("color")}
        >
          <span className="look-color-mark" aria-hidden="true">
            A
            <i style={{ background: accent || "linear-gradient(90deg,#f43f5e,#eab308,#22c55e,#3b82f6,#a855f7)" }} />
          </span>
        </button>
        <Menu open={menu === "color"} label="Colour">
          <p className="look-menu-title">Colour</p>
          <div className="look-swatches" role="radiogroup" aria-label="Accent colour">
            <button
              type="button"
              role="radio"
              aria-checked={!accent}
              aria-label="Template colour"
              title="Template colour"
              className={accent ? "swatch is-none" : "swatch is-none is-on"}
              onClick={() => {
                onAccent(undefined);
                setMenu(null);
              }}
            >
              {!accent ? <IconCheck /> : null}
            </button>
            {ACCENTS.map((hex) => (
              <button
                key={hex}
                type="button"
                role="radio"
                aria-checked={accent === hex}
                aria-label={hex}
                title={hex}
                className={accent === hex ? "swatch is-on" : "swatch"}
                style={{ background: hex }}
                onClick={() => {
                  onAccent(hex);
                  setMenu(null);
                }}
              >
                {accent === hex ? <IconCheck /> : null}
              </button>
            ))}
          </div>
        </Menu>
      </div>

      <div className="look-slot">
        <button
          type="button"
          className={menu === "space" ? "look-tool is-on" : "look-tool"}
          aria-label="Spacing"
          aria-expanded={menu === "space"}
          aria-haspopup="dialog"
          title="Spacing"
          onClick={() => toggle("space")}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 4h10M3 8h10M3 12h10" />
            <path d="M1.5 6v4M14.5 6v4" />
          </svg>
        </button>
        <Menu open={menu === "space"} label="Spacing">
          <p className="look-menu-title">Spacing</p>
          <CompactStepper
            label="Spacing"
            metric={SPACING}
            value={data.spacing}
            unit="pt"
            onChange={(spacing) => patchStyle({ spacing })}
          />
        </Menu>
      </div>

      <div className="look-slot">
        <button
          type="button"
          className={menu === "lead" ? "look-tool is-on" : "look-tool"}
          aria-label="Line height"
          aria-expanded={menu === "lead"}
          aria-haspopup="dialog"
          title="Line height"
          onClick={() => toggle("lead")}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 3.5h8M5 8h8M5 12.5h8" />
            <path d="M2.25 5.75 3.5 4.5 4.75 5.75M2.25 10.25 3.5 11.5 4.75 10.25" />
          </svg>
        </button>
        <Menu open={menu === "lead"} label="Line height">
          <p className="look-menu-title">Line height</p>
          <CompactStepper
            label="Line height"
            metric={LINE_HEIGHT}
            value={data.leading}
            onChange={(leading) => patchStyle({ leading })}
          />
        </Menu>
      </div>
    </div>
  );
}
