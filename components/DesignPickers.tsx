"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AccentSwatches } from "./LookBar";
import { FONT_SIZE, SPACING, readMetric, type ResumeData } from "@/lib/types";

type SizeId = "sm" | "md" | "lg";
type SpaceId = "own" | "compact" | "normal" | "relaxed";

function sizeId(value: ResumeData["typeSize"]): SizeId {
  if (value === undefined || value === null) return "md";
  const n = readMetric(FONT_SIZE, value);
  if (n <= 9) return "sm";
  if (n >= 11) return "lg";
  return "md";
}

function spaceId(value: ResumeData["spacing"]): SpaceId {
  if (value === undefined || value === null) return "own";
  const n = readMetric(SPACING, value);
  if (n <= SPACING.legacy.tight) return "compact";
  if (n >= SPACING.legacy.relaxed) return "relaxed";
  return "normal";
}

function SpacingOwnIcon() {
  /** Template default — framed block with soft lines */
  return (
    <svg className="design-pick-icon" viewBox="0 0 32 22" aria-hidden="true">
      <rect x="5" y="3" width="22" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="7" width="14" height="1.6" rx="0.5" fill="currentColor" opacity="0.35" />
      <rect x="9" y="10.5" width="11" height="1.6" rx="0.5" fill="currentColor" />
      <rect x="9" y="14" width="12" height="1.6" rx="0.5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function SpacingIcon({ density }: { density: "own" | "tight" | "mid" | "loose" }) {
  if (density === "own") return <SpacingOwnIcon />;
  const gap = density === "tight" ? 3 : density === "loose" ? 7 : 5;
  return (
    <svg className="design-pick-icon" viewBox="0 0 32 22" aria-hidden="true">
      <rect x="4" y="3" width="24" height="2" rx="1" fill="currentColor" />
      <rect x="4" y={3 + gap + 2} width="24" height="2" rx="1" fill="currentColor" />
      <rect x="4" y={3 + (gap + 2) * 2} width="24" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function TextSizeCircles({
  typeSize,
  onChange,
}: {
  typeSize: ResumeData["typeSize"];
  onChange: (next: ResumeData["typeSize"]) => void;
}) {
  const active = sizeId(typeSize);
  const options: { id: SizeId; label: string; scale: "sm" | "md" | "lg" }[] = [
    { id: "sm", label: "Small", scale: "sm" },
    { id: "md", label: "Medium", scale: "md" },
    { id: "lg", label: "Large", scale: "lg" },
  ];

  return (
    <div className="design-pick-strip" role="radiogroup" aria-label="Text size">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={active === option.id}
          aria-label={option.label}
          title={option.label}
          className={active === option.id ? "design-pick-circ is-on" : "design-pick-circ"}
          onClick={() =>
            onChange(option.id === "md" ? undefined : option.id === "sm" ? FONT_SIZE.legacy.sm : FONT_SIZE.legacy.lg)
          }
        >
          <span className={`design-pick-a design-pick-a-${option.scale}`} aria-hidden="true">
            A
          </span>
        </button>
      ))}
    </div>
  );
}

function SpacingCircles({
  spacing,
  onChange,
}: {
  spacing: ResumeData["spacing"];
  onChange: (next: ResumeData["spacing"]) => void;
}) {
  const active = spaceId(spacing);
  const options: { id: SpaceId; label: string; icon: "own" | "tight" | "mid" | "loose" }[] = [
    { id: "own", label: "Template default", icon: "own" },
    { id: "compact", label: "Compact", icon: "tight" },
    { id: "normal", label: "Normal", icon: "mid" },
    { id: "relaxed", label: "Relaxed", icon: "loose" },
  ];

  return (
    <div className="design-pick-strip" role="radiogroup" aria-label="Line spacing">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={active === option.id}
          aria-label={option.label}
          title={option.label}
          className={active === option.id ? "design-pick-circ is-on" : "design-pick-circ"}
          onClick={() => {
            if (option.id === "own") onChange(undefined);
            else if (option.id === "compact") onChange(SPACING.legacy.tight);
            else if (option.id === "relaxed") onChange(SPACING.legacy.relaxed);
            else onChange(SPACING.legacy.normal);
          }}
        >
          <SpacingIcon density={option.icon} />
        </button>
      ))}
    </div>
  );
}

function AccentColorPick({
  accent,
  onAccent,
}: {
  accent?: string;
  onAccent: (hex: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);

  const popWidth = 272;

  const measure = useCallback(() => {
    const node = trigger.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const width = Math.min(popWidth, window.innerWidth - 16);
    let left = rect.right - width;
    left = Math.min(Math.max(8, left), window.innerWidth - width - 8);
    setBox({ top: rect.top - 10, left });
  }, [popWidth]);

  useLayoutEffect(() => {
    if (!open) {
      setBox(null);
      return;
    }
    measure();
    const view = window.visualViewport;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    view?.addEventListener("resize", measure);
    view?.addEventListener("scroll", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      view?.removeEventListener("resize", measure);
      view?.removeEventListener("scroll", measure);
    };
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (trigger.current?.contains(target)) return;
      if (panel.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={open ? "design-pick-circ design-pick-color is-on" : "design-pick-circ design-pick-color"}
        aria-label="Accent colour"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Colour"
        onClick={() => setOpen((was) => !was)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="design-pick-color-mark" aria-hidden="true">
          A
          <i style={{ background: accent || "var(--ink)" }} />
        </span>
      </button>
      {open && box && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panel}
              className="design-pick-pop"
              role="dialog"
              aria-label="Accent colour"
              style={{
                position: "fixed",
                top: box.top,
                left: box.left,
                transform: "translateY(-100%)",
                zIndex: 12000,
              }}
            >
              <p className="design-pick-pop-title">Colour</p>
              <AccentSwatches accent={accent} onAccent={onAccent} className="design-pick-pop-colors" />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

/**
 * One horizontal strip (scroll on narrow screens) like colour swatches:
 * text-size circles, divider, spacing circles, colour popover.
 */
export function TypographyStripPicker({
  typeSize,
  spacing,
  accent,
  onTypeSize,
  onSpacing,
  onAccent,
}: {
  typeSize: ResumeData["typeSize"];
  spacing: ResumeData["spacing"];
  accent?: string;
  onTypeSize: (next: ResumeData["typeSize"]) => void;
  onSpacing: (next: ResumeData["spacing"]) => void;
  onAccent: (hex: string | undefined) => void;
}) {
  return (
    <div className="picker-typography-row" role="presentation">
      <TextSizeCircles typeSize={typeSize} onChange={onTypeSize} />
      <span className="design-pick-divider" aria-hidden="true" />
      <SpacingCircles spacing={spacing} onChange={onSpacing} />
      <span className="design-pick-divider" aria-hidden="true" />
      <AccentColorPick accent={accent} onAccent={onAccent} />
    </div>
  );
}
