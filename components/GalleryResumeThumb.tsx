"use client";

import { useLayoutEffect, useRef } from "react";
import { ResumeSheet } from "./ResumeSheet";
import { sampleForTemplateGallery } from "@/lib/content";
import {
  GALLERY_THUMB_FIT_PAD,
  GALLERY_THUMB_WIDTH_BIAS,
  TEMPLATE_PAGE_W,
  TEMPLATE_THUMB_STAGE_H,
  TEMPLATE_THUMB_W,
} from "@/lib/templateThumb";
import type { TemplateId } from "@/lib/types";

const GALLERY_MOBILE_MQ = "(max-width: 960px)";

/** Scales a full resume preview so every gallery thumb shows dense content, not an empty page. */
export function GalleryResumeThumb({ templateId }: { templateId: TemplateId }) {
  const paperWrapRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrap = paperWrapRef.current;
    if (!wrap) return;

    const fit = () => {
      if (window.matchMedia(GALLERY_MOBILE_MQ).matches) {
        wrap.style.removeProperty("--gallery-thumb-scale");
        return;
      }
      const paper = wrap.querySelector<HTMLElement>(".paper");
      if (!paper) return;
      const height = Math.max(paper.scrollHeight, paper.getBoundingClientRect().height);
      if (height < 1) return;
      const stage = wrap.closest<HTMLElement>(".board-tile-stage");
      const stageW = stage?.clientWidth ?? TEMPLATE_THUMB_W;
      const stageH = stage?.clientHeight ?? TEMPLATE_THUMB_STAGE_H;
      const scaleW = stageW / TEMPLATE_PAGE_W;
      const scaleH = (stageH - GALLERY_THUMB_FIT_PAD) / height;
      const scale =
        scaleH >= scaleW * GALLERY_THUMB_WIDTH_BIAS ? Math.min(scaleW, scaleH) : scaleW;
      wrap.style.setProperty("--gallery-thumb-scale", String(scale));
    };

    fit();
    const fonts = document.fonts;
    if (fonts?.ready) fonts.ready.then(() => requestAnimationFrame(fit));
    const ro = new ResizeObserver(() => requestAnimationFrame(fit));
    const paper = wrap.querySelector(".paper");
    const stage = wrap.closest(".board-tile-stage");
    if (paper) ro.observe(paper);
    if (stage) ro.observe(stage);
    return () => ro.disconnect();
  }, [templateId]);

  return (
    <span ref={paperWrapRef} className="board-tile-paper is-gallery-fit">
      <ResumeSheet templateId={templateId} data={sampleForTemplateGallery(templateId)} preview fill />
    </span>
  );
}