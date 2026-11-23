"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ResumeSheet } from "./ResumeSheet";
import { Tilt } from "./motion";
import { IconCheck } from "./icons";
import { OFFERED_IDS, catalogFor, type TemplateFilter } from "@/lib/catalog";
import { sampleForTemplateGallery } from "@/lib/content";
import {
  TEMPLATE_PAGE_H,
  TEMPLATE_PAGE_W,
  TEMPLATE_THUMB_STAGE_H,
  TEMPLATE_THUMB_W,
  TEMPLATE_THUMB_W_MOBILE,
  templateThumbScaleMobile,
} from "@/lib/templateThumb";
import { TEMPLATES, type ResumeData, type TemplateId } from "@/lib/types";

/** No card chrome around thumbs — size matches the scaled page only. */
const PAD = 0;

const SIZE = {
  rail: 112,
  grid: TEMPLATE_THUMB_W,
  picker: TEMPLATE_THUMB_W,
  pickerMobile: TEMPLATE_THUMB_W_MOBILE,
  /** Compact row in Change design — no gallery hover chrome */
  strip: 108,
} as const;

/**
 * Live thumbnails of every template: a vertical rail beside the page, or the
 * grid inside the Design menu. Each card is a real render of the current resume
 * scaled down, so what you hover is what you get.
 */
export function TemplateFan({
  templateId,
  data,
  onChange,
  layout = "rail",
  filter = "picks",
  maxItems,
  /** Use dashboard-style sample copy per template in thumbnails (live preview stays your CV). */
  sampleThumbs = false,
}: {
  templateId: TemplateId;
  data: ResumeData;
  onChange: (id: TemplateId) => void;
  layout?: "rail" | "grid" | "picker" | "strip";
  filter?: TemplateFilter;
  maxItems?: number;
  sampleThumbs?: boolean;
}) {
  const currentRef = useRef<HTMLElement | null>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (layout !== "picker") return;
    const media = window.matchMedia("(max-width: 920px)");
    const sync = () => setNarrow(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [layout]);

  const enhancv = layout === "picker";

  const frameW =
    layout === "picker" && narrow ? SIZE.pickerMobile : layout === "strip" ? SIZE.strip : SIZE[layout as keyof typeof SIZE];
  const scale =
    layout === "picker" && narrow ? templateThumbScaleMobile : frameW / TEMPLATE_PAGE_W;
  const frameH = enhancv ? TEMPLATE_THUMB_STAGE_H : Math.ceil(TEMPLATE_PAGE_H * scale);
  const shiftY = enhancv ? 0 : (frameH - TEMPLATE_PAGE_H * scale) / 2;

  // keep the selected card centred in whichever container is showing
  useEffect(() => {
    const card = currentRef.current;
    const fan = card?.closest(".fan") as HTMLElement | null;
    if (!card || !fan) return;
    const cardBox = card.getBoundingClientRect();
    const fanBox = fan.getBoundingClientRect();
    if (getComputedStyle(fan).overflowX === "auto" || getComputedStyle(fan).overflowX === "scroll") {
      const left = fan.scrollLeft + (cardBox.left - fanBox.left) - (fanBox.width - cardBox.width) / 2;
      fan.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      return;
    }
    const top = fan.scrollTop + (cardBox.top - fanBox.top) - (fanBox.height - cardBox.height) / 2;
    fan.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [templateId, layout]);

  const catalog =
    layout === "picker" || layout === "grid" || layout === "strip"
      ? catalogFor(filter)
      : catalogFor("picks");
  const offered = catalog.flatMap((entry) => {
    const found = TEMPLATES.find((item) => item.id === entry.id);
    return found ? [{ ...found, blurb: entry.blurb }] : [];
  });
  let shown: Array<(typeof TEMPLATES)[number] & { blurb?: string }> =
    layout === "rail"
      ? OFFERED_IDS.flatMap((id) => {
          const found = TEMPLATES.find((item) => item.id === id);
          return found ? [found] : [];
        })
      : offered;
  if (maxItems != null) shown = shown.slice(0, maxItems);

  // Thumbnails keep each layout's own colour and type — look edits apply only
  // to the large preview on the right of the picker. Optional sampleThumbs uses
  // the same dummy content as the dashboard for each template thumbnail.
  const thumbData: ResumeData = {
    ...data,
    accent: undefined,
    fontId: undefined,
    typeSize: undefined,
    spacing: undefined,
    leading: undefined,
  };

  const cardH = frameH + PAD * 2;
  const useTilt = layout !== "strip";

  return (
    <div
      className={`fan is-${layout}${enhancv ? " is-enhancv" : ""}`}
      role="listbox"
      aria-label="Resume templates"
    >
      {shown.map((template, index) => {
        const current = template.id === templateId;
        const frameStyle = {
          width: frameW,
          height: enhancv ? TEMPLATE_THUMB_STAGE_H : frameH,
        };
        const inner = (
          <>
            <span className="fan-frame" style={frameStyle}>
              <span className="fan-thumb" style={{ transform: `translate(0px, ${shiftY}px) scale(${scale})` }} aria-hidden="true">
                  <ResumeSheet
                    templateId={template.id}
                    data={sampleThumbs ? sampleForTemplateGallery(template.id) : thumbData}
                    preview
                    fill={!sampleThumbs}
                  />
              </span>
              {enhancv ? (
                <span className="fan-use-overlay">
                  <span className="fan-use-inner">
                    <span className="fan-use-name">{template.name}</span>
                    <button type="button" className="fan-use-btn" onClick={() => onChange(template.id)}>
                      Use this template →
                    </button>
                  </span>
                </span>
              ) : null}
            </span>
            {current && (layout === "strip" || layout === "picker") ? (
              <span className="fan-check" aria-hidden="true">
                <IconCheck />
              </span>
            ) : null}
            <span className="fan-name">{template.name}</span>
            {layout === "picker" && template.blurb ? <span className="fan-blurb">{template.blurb}</span> : null}
          </>
        );
        const card = enhancv ? (
          <div
            ref={current ? (el) => { currentRef.current = el; } : undefined}
            role="option"
            aria-label={template.name}
            aria-selected={current}
            className={current ? "fan-card is-current is-preview-only" : "fan-card is-preview-only"}
            style={{ width: frameW + PAD * 2, height: cardH, minHeight: cardH }}
          >
            {inner}
          </div>
        ) : (
          <button
            ref={current ? (el) => { currentRef.current = el; } : undefined}
            type="button"
            role="option"
            aria-label={template.name}
            aria-selected={current}
            className={current ? "fan-card is-current" : "fan-card"}
            style={{ width: frameW + PAD * 2, height: cardH, minHeight: cardH }}
            onClick={() => onChange(template.id)}
          >
            {inner}
          </button>
        );
        if (useTilt) {
          return (
            <Tilt key={template.id} className="fan-tilt" max={7} lift={4} style={{ "--i": index } as CSSProperties}>
              {card}
            </Tilt>
          );
        }
        return (
          <div key={template.id} className="fan-tilt is-flat" style={{ "--i": index, "--fan-card-h": `${cardH}px` } as CSSProperties}>
            {card}
          </div>
        );
      })}
    </div>
  );
}
