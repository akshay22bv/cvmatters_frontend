"use client";

import { useState } from "react";
import { IconStar } from "./icons";

/**
 * Five stars. Read-only it shows an average (halves included); interactive it
 * takes hover, click and the arrow keys.
 */
export function Stars({
  value,
  count,
  onRate,
  size = 18,
  label = "Rating",
}: {
  value: number;
  count?: number;
  onRate?: (stars: number) => void;
  size?: number;
  label?: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  if (!onRate) {
    return (
      <span className="stars is-read" style={{ fontSize: size }} aria-label={`${label}: ${value || "none yet"}`}>
        {[1, 2, 3, 4, 5].map((step) => (
          <i key={step} className={shown >= step ? "is-on" : shown >= step - 0.5 ? "is-half" : ""}>
            <IconStar filled={shown >= step} half={shown < step && shown >= step - 0.5} />
          </i>
        ))}
        {count !== undefined ? <b>{count ? `${value.toFixed(1)} (${count})` : "Not rated"}</b> : null}
      </span>
    );
  }

  return (
    <span
      className="stars is-live"
      style={{ fontSize: size }}
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((step) => (
        <button
          key={step}
          type="button"
          role="radio"
          aria-checked={value === step}
          aria-label={`${step} ${step === 1 ? "star" : "stars"}`}
          className={shown >= step ? "is-on" : ""}
          onMouseEnter={() => setHover(step)}
          onFocus={() => setHover(step)}
          onBlur={() => setHover(0)}
          onClick={() => onRate(step)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              onRate(Math.min(5, (value || 0) + 1));
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              event.preventDefault();
              onRate(Math.max(1, (value || 1) - 1));
            }
          }}
        >
          <IconStar filled={shown >= step} />
        </button>
      ))}
    </span>
  );
}
