"use client";

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

/**
 * One horizontal strip (scroll on narrow screens) like colour swatches:
 * text-size circles, divider, spacing circles.
 */
export function TypographyStripPicker({
  typeSize,
  spacing,
  onTypeSize,
  onSpacing,
}: {
  typeSize: ResumeData["typeSize"];
  spacing: ResumeData["spacing"];
  onTypeSize: (next: ResumeData["typeSize"]) => void;
  onSpacing: (next: ResumeData["spacing"]) => void;
}) {
  return (
    <div className="picker-typography-row" role="presentation">
      <TextSizeCircles typeSize={typeSize} onChange={onTypeSize} />
      <span className="design-pick-divider" aria-hidden="true" />
      <SpacingCircles spacing={spacing} onChange={onSpacing} />
    </div>
  );
}
