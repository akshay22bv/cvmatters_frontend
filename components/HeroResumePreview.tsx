"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ResumeSheet } from "./ResumeSheet";
import { heroShowcaseSlides } from "@/lib/heroShowcase";

const PAGE_W = 794;
const PAGE_H = 1123;
const ROTATE_MS = 5000;
const DESKTOP_MAX_W = 360;

const HERO_SLIDES = heroShowcaseSlides();

/** Fixed sample CVs in the hero — one full page each; never the visitor's draft. */
export function HeroResumePreview() {
  const fitRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(0.52);

  const slide = HERO_SLIDES[index] ?? HERO_SLIDES[0];
  const fitH = PAGE_H * scale;

  const measure = useCallback(() => {
    const fit = fitRef.current;
    if (!fit) return;

    const isDesktop = window.matchMedia("(min-width: 961px)").matches;
    const boxW = fit.clientWidth;
    if (boxW <= 0) return;

    const targetW = isDesktop ? Math.min(boxW, DESKTOP_MAX_W) : boxW;
    const raw = targetW / PAGE_W;
    const dpr = window.devicePixelRatio || 1;
    setScale(Math.round(raw * dpr * 1000) / (dpr * 1000));
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (fitRef.current) ro.observe(fitRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (reducedMotion || HERO_SLIDES.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className="board-hero-stage">
      <div
        className="board-hero-paper-fit"
        ref={fitRef}
        style={{ height: fitH }}
      >
        <div
          className="board-hero-paper"
          style={{
            width: PAGE_W,
            height: PAGE_H,
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <div
            key={`hero-slide-${index}`}
            className={reducedMotion ? "board-hero-paper-swap is-instant" : "board-hero-paper-swap"}
          >
            <ResumeSheet templateId={slide.templateId} data={slide.data} preview fill />
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Example resume: {slide.data.personal.fullName}, {slide.data.personal.title}
      </p>
    </div>
  );
}