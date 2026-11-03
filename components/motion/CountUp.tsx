"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useMotionPrefs";

/** Counts from its previous value to the new one, easing out. */
export function CountUp({ value, duration = 700, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    const run = (now: number) => {
      const ratio = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setShown(Math.round(origin + (value - origin) * eased));
      if (ratio < 1) frame.current = requestAnimationFrame(run);
      else from.current = value;
    };
    frame.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration, reduced]);

  return (
    <span className="tnum">
      {shown}
      {suffix}
    </span>
  );
}
