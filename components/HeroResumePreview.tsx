"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ResumeSheet } from "./ResumeSheet";
import { HeroResumePreviewSkeleton } from "./HeroResumePreviewSkeleton";
import { heroShowcaseSlides } from "@/lib/heroShowcase";
import { useMediaQuery } from "@/lib/useMediaQuery";

const PAGE_W = 794;
const PAGE_H = 1123;
const ROTATE_MS = 5000;
const DESKTOP_MAX_W = 360;

const HERO_SLIDES = heroShowcaseSlides();

/** Fixed sample CVs in the hero — one full page each; never the visitor's draft. */
export function HeroResumePreview() {
  const fitRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(0.45);
  const isMobile = useMediaQuery("(max-width: 960px)");
  const [reducedMotion, setReducedMotion] = useState(false);

  const slide = HERO_SLIDES[index] ?? HERO_SLIDES[0];
  const fitH = PAGE_H * scale;

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted || isMobile) return;
    const fit = fitRef.current;
    if (!fit) return;
    const boxW = fit.getBoundingClientRect().width;
    if (boxW <= 0) return;
    const targetW = Math.min(boxW, DESKTOP_MAX_W);
    setScale(targetW / PAGE_W);
    const ro = new ResizeObserver(() => {
      const nextW = fit.getBoundingClientRect().width;
      if (nextW > 0) setScale(Math.min(nextW, DESKTOP_MAX_W) / PAGE_W);
    });
    ro.observe(fit);
    return () => ro.disconnect();
  }, [mounted, isMobile]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(motion.matches);
    onMotion();
    motion.addEventListener("change", onMotion);
    return () => motion.removeEventListener("change", onMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion || HERO_SLIDES.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  if (!mounted) {
    return <HeroResumePreviewSkeleton />;
  }

  /** Mobile hero uses copy instead of preview — keep DOM stable; no iframe branch. */
  if (isMobile) {
    return null;
  }

  return (
    <div className="board-hero-stage">
      <div className="board-hero-paper-fit" ref={fitRef} style={{ height: fitH }}>
        <div
          className="board-hero-paper is-scale"
          style={{
            width: PAGE_W,
            height: PAGE_H,
            transform: `translate3d(-50%, 0, 0) scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <div
            key={`hero-slide-${index}`}
            className={
              reducedMotion
                ? "board-hero-paper-swap is-instant"
                : "board-hero-paper-swap board-hero-paper-swap--slow"
            }
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