"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Edge-faded ticker. The row is rendered twice and translated by exactly half,
 * which is what makes the loop seamless; it pauses on hover.
 */
export function Marquee({
  items,
  speed = 34,
  reverse = false,
  className = "",
}: {
  items: ReactNode[];
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const row = (
    <div className="marquee-row">
      {items.map((item, index) => (
        <span className="marquee-cell" key={index}>
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`marquee${reverse ? " is-rev" : ""} ${className}`.trim()}
      style={{ "--marquee-time": `${speed}s` } as CSSProperties}
    >
      <div className="marquee-track">
        {row}
        <span aria-hidden="true" className="marquee-clone">
          {row}
        </span>
      </div>
    </div>
  );
}
