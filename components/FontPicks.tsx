"use client";

import { FONTS, type FontId } from "@/lib/types";

export function FontPicks({
  value,
  compact = false,
  onChange,
}: {
  value?: FontId;
  compact?: boolean;
  onChange: (id: FontId) => void;
}) {
  const current = value || "sans";
  if (FONTS.length < 2) return null;
  return (
    <div className={compact ? "font-picks is-rail" : "font-picks"} role="radiogroup" aria-label="Resume font">
      {FONTS.map((font) => (
        <button
          key={font.id}
          type="button"
          role="radio"
          aria-checked={font.id === current}
          aria-label={font.name}
          className={font.id === current ? "font-pick is-active" : "font-pick"}
          onClick={() => onChange(font.id)}
        >
          <b className={`font-${font.id}`}>{font.sample}</b>
          {!compact && <span>{font.name}</span>}
        </button>
      ))}
    </div>
  );
}
