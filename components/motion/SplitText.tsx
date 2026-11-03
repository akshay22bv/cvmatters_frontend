"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "./useMotionPrefs";

/**
 * Headline that assembles itself one glyph at a time. Words stay unbroken so the
 * line wraps like normal text, and the whole string stays readable to a screen reader.
 */
export function SplitText({
  text,
  as: Tag = "span",
  delay = 0,
  step = 26,
  className = "",
}: {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "strong" | "em";
  delay?: number;
  step?: number;
  className?: string;
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
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  let index = 0;
  const words = text.split(" ");

  return (
    <Tag ref={ref as never} className={`letters${shown ? " is-in" : ""} ${className}`.trim()} aria-label={text}>
      {words.map((word, wordIndex) => (
        <span className="letters-word" key={`${word}-${wordIndex}`} aria-hidden="true">
          {[...word].map((letter, letterIndex) => {
            const slot = index++;
            return (
              <span
                className="letters-char"
                key={`${letter}-${letterIndex}`}
                style={{ "--char-delay": `${delay + slot * step}ms` } as CSSProperties}
              >
                {letter}
              </span>
            );
          })}
          {wordIndex < words.length - 1 ? <span className="letters-space"> </span> : null}
        </span>
      ))}
    </Tag>
  );
}
