"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const PAGE_WIDTH = 794;

export function ScaledPaper({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  const [height, setHeight] = useState(1123);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const page = pageRef.current;
    if (!viewport || !page) return;

    const measure = () => {
      const width = viewport.clientWidth;
      const viewHeight = viewport.clientHeight;
      const pageHeight = page.offsetHeight;
      if (!width || !viewHeight || !pageHeight) return;
      const nextScale = Math.min((width - 28) / PAGE_WIDTH, (viewHeight - 16) / pageHeight, 1);
      setScale(Math.max(nextScale, 0.35));
      setHeight(pageHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(page);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div className="scale-viewport" ref={viewportRef}>
      <div style={{ width: PAGE_WIDTH * scale, height: height * scale, position: "relative", flex: "none" }}>
        <div ref={pageRef} style={{ width: PAGE_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
