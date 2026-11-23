"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/motion/useMotionPrefs";

const SLUG = "your-name";
const TYPE_MS = 85;
const DELETE_MS = 50;
const PAUSE_MS = 2200;

/** Types and deletes the example username in the hero public URL. */
export function HeroTypingSlug() {
  const reduced = useReducedMotion();
  const [text, setText] = useState(reduced ? SLUG : "");

  useEffect(() => {
    if (reduced) {
      setText(SLUG);
      return;
    }

    let cancelled = false;
    let index = 0;
    let deleting = false;

    const step = () => {
      if (cancelled) return;
      if (!deleting) {
        index += 1;
        setText(SLUG.slice(0, index));
        if (index >= SLUG.length) {
          deleting = true;
          window.setTimeout(step, PAUSE_MS);
          return;
        }
        window.setTimeout(step, TYPE_MS);
        return;
      }
      index -= 1;
      setText(SLUG.slice(0, Math.max(0, index)));
      if (index <= 0) {
        deleting = false;
        window.setTimeout(step, TYPE_MS);
        return;
      }
      window.setTimeout(step, DELETE_MS);
    };

    const start = window.setTimeout(step, TYPE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [reduced]);

  return (
    <span className="board-hero-public-slug board-hero-public-slug--typing">
      {text}
      <span className="board-hero-public-caret" aria-hidden="true" />
    </span>
  );
}