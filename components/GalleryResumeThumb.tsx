"use client";

import { useLayoutEffect, useRef } from "react";
import { ResumeSheet } from "./ResumeSheet";
import { sampleForTemplateGallery } from "@/lib/content";
import { TEMPLATE_PAGE_W, TEMPLATE_THUMB_STAGE_H, TEMPLATE_THUMB_W } from "@/lib/templateThumb";
import type { TemplateId } from "@/lib/types";

/** Scales a full resume preview so every gallery thumb shows dense content, not an empty page. */
export function GalleryResumeThumb({ templateId }: { templateId: TemplateId }) {
  const paperWrapRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrap = paperWrapRef.current;
    if (!wrap) return;

    const fit = () => {
      const paper = wrap.querySelector<HTMLElement>(".paper");
      if (!paper) return;
      const height = paper.getBoundingClientRect().height || paper.scrollHeight;
      if (height < 1) return;
      const scaleW = TEMPLATE_THUMB_W / TEMPLATE_PAGE_W;
      const scaleH = TEMPLATE_THUMB_STAGE_H / height;
      const scale = Math.min(scaleW, scaleH);
      wrap.style.setProperty("--gallery-thumb-scale", String(scale));
    };

    fit();
    const fonts = document.fonts;
    if (fonts?.ready) fonts.ready.then(() => requestAnimationFrame(fit));
    const ro = new ResizeObserver(() => requestAnimationFrame(fit));
    const paper = wrap.querySelector(".paper");
    if (paper) ro.observe(paper);
    return () => ro.disconnect();
  }, [templateId]);

  return (
    <span ref={paperWrapRef} className="board-tile-paper is-gallery-fit">
      <ResumeSheet templateId={templateId} data={sampleForTemplateGallery(templateId)} preview fill />
    </span>
  );
}