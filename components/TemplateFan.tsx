"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ResumeSheet } from "./ResumeSheet";
import { Tilt } from "./motion";
import { IconCheck } from "./icons";
import { OFFERED_IDS, catalogFor, type TemplateFilter } from "@/lib/catalog";
import { TEMPLATES, type ResumeData, type TemplateId } from "@/lib/types";

const PAGE_W = 794;
const PAGE_H = 1123;
const PAD = 6;

const SIZE = {
  rail: 112,
  grid: 98,
  picker: 168,
  pickerMobile: 78,
  strip: 88,
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
}: {
  templateId: TemplateId;
  data: ResumeData;
  onChange: (id: TemplateId) => void;
  layout?: "rail" | "grid" | "picker" | "strip";
  filter?: TemplateFilter;
  maxItems?: number;
}) {
  const currentRef = useRef<HTMLButtonElement>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (layout !== "picker") return;
    const media = window.matchMedia("(max-width: 920px)");
    const sync = () => setNarrow(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [layout]);

  const frameW =
    layout === "picker" && narrow ? SIZE.pickerMobile : layout === "strip" ? SIZE.strip : SIZE[layout as keyof typeof SIZE];
  const scale = frameW / PAGE_W;
  const frameH = Math.ceil(PAGE_H * scale);
  const shiftY = (frameH - PAGE_H * scale) / 2;

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
  // to the large preview on the right of the picker.
  const thumbData: ResumeData = {
    ...data,
    accent: undefined,
    fontId: undefined,
    typeSize: undefined,
    spacing: undefined,
    leading: undefined,
  };

  return (
    <div className={`fan is-${layout}`} role="listbox" aria-label="Resume templates">
      {shown.map((template, index) => {
        const current = template.id === templateId;
        return (
          <Tilt key={template.id} className="fan-tilt" max={7} lift={4} style={{ "--i": index } as CSSProperties}>
            <button
              ref={current ? currentRef : undefined}
              type="button"
              role="option"
              aria-label={template.name}
              aria-selected={current}
              className={current ? "fan-card is-current" : "fan-card"}
              style={{ width: frameW + PAD * 2, height: frameH + PAD * 2 }}
              onClick={() => onChange(template.id)}
            >
              <span className="fan-frame" style={{ width: frameW, height: frameH }}>
                <span className="fan-thumb" style={{ transform: `translate(0px, ${shiftY}px) scale(${scale})` }} aria-hidden="true">
                  <ResumeSheet templateId={template.id} data={thumbData} preview fill />
                </span>
              </span>
              {current && (layout === "strip" || layout === "picker") ? (
                <span className="fan-check" aria-hidden="true">
                  <IconCheck />
                </span>
              ) : null}
              <span className="fan-name">{template.name}</span>
              {layout === "picker" && template.blurb ? (
                <span className="fan-blurb">{template.blurb}</span>
              ) : null}
            </button>
          </Tilt>
        );
      })}
    </div>
  );
}
