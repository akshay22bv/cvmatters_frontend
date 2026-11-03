"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useReducedMotion } from "./useMotionPrefs";

type Direction = "up" | "down" | "left" | "right" | "none";

const SHIFT: Record<Direction, string> = {
  up: "0, 18px",
  down: "0, -18px",
  left: "22px, 0",
  right: "-22px, 0",
  none: "0, 0",
};

/**
 * Reveals its children once they scroll into view: fade, slide and a touch of blur.
 * `delay` staggers siblings; `once` keeps it from replaying on scroll back.
 */
export function Reveal({
  children,
  as: Tag = "div",
  direction = "up",
  delay = 0,
  distance,
  blur = true,
  scale,
  once = true,
  className = "",
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  direction?: Direction;
  delay?: number;
  distance?: number;
  blur?: boolean;
  scale?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, reduced]);

  const offset = distance === undefined ? SHIFT[direction] : SHIFT[direction].replace(/\d+(?=px)/, String(distance));

  return (
    <Tag
      ref={ref}
      className={`reveal${shown ? " is-in" : ""}${blur ? " has-blur" : ""} ${className}`.trim()}
      style={
        {
          "--reveal-shift": offset,
          "--reveal-delay": `${delay}ms`,
          "--reveal-scale": scale ?? 1,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
