"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useFinePointer } from "./useMotionPrefs";

/**
 * Wraps a surface so a soft light follows the cursor across it. Writes the
 * pointer position straight to CSS custom properties, so React never re-renders.
 */
export function Spotlight({
  children,
  className = "",
  as: Tag = "div",
  radius = 320,
  strength = 0.16,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "span" | "section" | "aside" | "li";
  radius?: number;
  strength?: number;
} & Record<string, unknown>) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();

  const track = (event: React.PointerEvent<HTMLElement>) => {
    const node = ref.current;
    if (!node || !fine) return;
    const box = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - box.left}px`);
    node.style.setProperty("--my", `${event.clientY - box.top}px`);
    node.style.setProperty("--lit", "1");
  };

  const leave = () => {
    ref.current?.style.setProperty("--lit", "0");
  };

  return (
    <Tag
      ref={ref as never}
      className={`spotlight ${className}`.trim()}
      onPointerMove={track}
      onPointerLeave={leave}
      style={{ "--spot-r": `${radius}px`, "--spot-a": strength } as CSSProperties}
      {...rest}
    >
      <span className="spotlight-glow" aria-hidden="true" />
      {children}
    </Tag>
  );
}
