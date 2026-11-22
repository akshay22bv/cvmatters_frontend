"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const PAGE_W = 794;
const PAGE_H = 1123;

/**
 * Loads /embed/resume at native 794px, then scales the iframe element to the
 * shell width so the full page is visible without clipping half the sheet.
 */
export function ResumeEmbedFrame({
  src,
  title,
  className,
  priority = false,
  onReady,
}: {
  src: string;
  title: string;
  className?: string;
  /** Hero preview — load immediately, not lazy. */
  priority?: boolean;
  onReady?: () => void;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);

  const measure = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const w = shell.getBoundingClientRect().width;
    if (w > 0) setScale(w / PAGE_W);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    const shell = shellRef.current;
    if (shell) ro.observe(shell);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const onViewport = () => requestAnimationFrame(measure);
    window.visualViewport?.addEventListener("resize", onViewport);
    window.addEventListener("orientationchange", onViewport);
    return () => {
      window.visualViewport?.removeEventListener("resize", onViewport);
      window.removeEventListener("orientationchange", onViewport);
    };
  }, [measure]);

  return (
    <div
      ref={shellRef}
      className="board-resume-embed-shell"
      style={{ height: PAGE_H * scale }}
    >
      <iframe
        title={title}
        src={src}
        className={className ?? "board-resume-embed"}
        loading={priority ? "eager" : "lazy"}
        tabIndex={-1}
        scrolling="no"
        onLoad={onReady}
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: PAGE_W,
          height: PAGE_H,
          border: 0,
          colorScheme: "light",
          transform: `translate3d(-50%, 0, 0) scale(${scale})`,
          transformOrigin: "top center",
        }}
      />
    </div>
  );
}