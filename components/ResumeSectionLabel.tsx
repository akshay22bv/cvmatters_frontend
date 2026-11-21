"use client";

import { createContext, useContext, type ReactNode } from "react";

const DecorativeCtx = createContext(false);

/** Decorative resume previews (home gallery) use paragraphs so the page keeps a single H1. */
export function ResumeDecorProvider({ decorative, children }: { decorative: boolean; children: ReactNode }) {
  return <DecorativeCtx.Provider value={decorative}>{children}</DecorativeCtx.Provider>;
}

export function ResumeSectionLabel({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  const decorative = useContext(DecorativeCtx);
  if (decorative) {
    return (
      <p className={className} style={style} role="presentation">
        {children}
      </p>
    );
  }
  return (
    <h2 className={className} style={style}>
      {children}
    </h2>
  );
}