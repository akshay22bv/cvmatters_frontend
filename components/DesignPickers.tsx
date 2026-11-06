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

function SpacingIcon({ density }: { density: "own" | "tight" | "mid" | "loose" }) {
  const gap = density === "tight" ? 3 : density === "loose" ? 7 : 5;
  return (
    <svg className="design-pick-icon" viewBox="0 0 32 22" aria-hidden="true">
      <rect x="4" y="3" width="24" height="2" rx="1" fill="currentColor" />
      <rect x="4" y={3 + gap + 2} width="24" height="2" rx="1" fill="currentColor" />
      <rect x="4" y={3 + (gap + 2) * 2} width="24" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

export function TextSizePicker({
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
    <div className="design-pick-row" role="radiogroup" aria-label="Text size">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={active === option.id}
          className={active === option.id ? "design-pick is-on" : "design-pick"}
          onClick={() =>
            onChange(option.id === "md" ? undefined : option.id === "sm" ? FONT_SIZE.legacy.sm : FONT_SIZE.legacy.lg)
          }
        >
          <span className={`design-pick-a design-pick-a-${option.scale}`} aria-hidden="true">
            A
          </span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export function SpacingPicker({
  spacing,
  onChange,
}: {
  spacing: ResumeData["spacing"];
  onChange: (next: ResumeData["spacing"]) => void;
}) {
  const active = spaceId(spacing);
  const options: { id: SpaceId; label: string; icon: "own" | "tight" | "mid" | "loose" }[] = [
    { id: "own", label: "Template's own", icon: "own" },
    { id: "compact", label: "Compact", icon: "tight" },
    { id: "normal", label: "Normal", icon: "mid" },
    { id: "relaxed", label: "Relaxed", icon: "loose" },
  ];

  return (
    <div className="design-pick-grid" role="radiogroup" aria-label="Spacing">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={active === option.id}
          className={active === option.id ? "design-pick is-on" : "design-pick"}
          onClick={() => {
            if (option.id === "own") onChange(undefined);
            else if (option.id === "compact") onChange(SPACING.legacy.tight);
            else if (option.id === "relaxed") onChange(SPACING.legacy.relaxed);
            else onChange(SPACING.legacy.normal);
          }}
        >
          <SpacingIcon density={option.icon} />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
