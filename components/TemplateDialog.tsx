"use client";

import { useEffect } from "react";
import { AccentSwatches } from "./LookBar";
import { TypographyStripPicker } from "./DesignPickers";
import { ResumeView } from "./ResumeSheet";
import { TemplateFan } from "./TemplateFan";
import {
  type FontId,
  type ResumeData,
  type TemplateId,
} from "@/lib/types";

/**
 * Change design: live preview on the left, template and look controls on the right.
 * Close via scrim or × — edits stay applied.
 */
export function TemplateDialog({
  open,
  templateId,
  data,
  onClose,
  onTemplate,
  onFont,
  onAccent,
  onStyle,
}: {
  open: boolean;
  intent?: "layout" | "look";
  templateId: TemplateId;
  data: ResumeData;
  onClose: () => void;
  onTemplate: (id: TemplateId) => void;
  onFont: (id: FontId) => void;
  onAccent: (hex: string | undefined) => void;
  onStyle: (look: Pick<ResumeData, "typeSize" | "spacing" | "leading">) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", key);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="picker" role="dialog" aria-modal="true" aria-labelledby="picker-title">
      <button type="button" className="picker-scrim" aria-label="Close" onClick={onClose} />

      <div className="picker-panel is-design">
        <header className="picker-head">
          <h2 id="picker-title">Change design</h2>
          <button type="button" className="picker-x" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>

        <section className="picker-view" aria-label="Preview">
          <div className="picker-stage">
            <ResumeView templateId={templateId} data={data} />
          </div>
        </section>

        <section className="picker-side" aria-label="Design options">
          <div className="picker-block">
            <div className="picker-row-head">
              <span className="picker-label">Template</span>
            </div>
            <div className="picker-strip-wrap picker-template-scroll">
              <TemplateFan
                layout="strip"
                filter="all"
                templateId={templateId}
                data={data}
                onChange={onTemplate}
                sampleThumbs
              />
            </div>
          </div>

          <div className="picker-block">
            <span className="picker-label">Colour</span>
            <AccentSwatches accent={data.accent} onAccent={onAccent} className="picker-colors picker-colors-row" />
          </div>

          <div className="picker-block">
            <span className="picker-label">Type & spacing</span>
            <TypographyStripPicker
              typeSize={data.typeSize}
              spacing={data.spacing}
              onTypeSize={(typeSize) => onStyle({ typeSize, spacing: data.spacing, leading: data.leading })}
              onSpacing={(spacing) => onStyle({ typeSize: data.typeSize, spacing, leading: data.leading })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
