"use client";

import type { CSSProperties, ReactNode } from "react";

/** A slow specular sweep across text. Used sparingly, on one label at a time. */
export function ShinyText({ children, speed = 4.2, className = "" }: { children: ReactNode; speed?: number; className?: string }) {
  return (
    <span className={`shiny ${className}`.trim()} style={{ "--shine-speed": `${speed}s` } as CSSProperties}>
      {children}
    </span>
  );
}

/** Text painted with the brand gradient; animates only when `animate` is set. */
export function GradientText({ children, animate = false, className = "" }: { children: ReactNode; animate?: boolean; className?: string }) {
  return <span className={`grad-text${animate ? " is-live" : ""} ${className}`.trim()}>{children}</span>;
}
