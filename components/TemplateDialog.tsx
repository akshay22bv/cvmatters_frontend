"use client";

import { useCallback, useEffect, useState } from "react";
import { AccentSwatches } from "./LookBar";
import { SpacingPicker, TextSizePicker } from "./DesignPickers";
import { ResumeView } from "./ResumeSheet";
import { TemplateFan } from "./TemplateFan";
import { CATALOG } from "@/lib/catalog";
import {
  type FontId,
  type ResumeData,
  type TemplateId,
} from "@/lib/types";

type Look = {
  templateId: TemplateId;
  fontId?: FontId;
  accent?: string;
  typeSize?: number;
  spacing?: number;
  leading?: number;
};

/**
 * Change design: live preview on the left, template and look controls on the right.
 * Cancel restores what you had when the sheet opened.
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
  const [onOpen, setOnOpen] = useState<Look | null>(null);
  const [seeAll, setSeeAll] = useState(false);
  const templateCount = CATALOG.length;

  useEffect(() => {
    if (open) {
      setOnOpen({
        templateId,
        fontId: data.fontId,
        accent: data.accent,
        typeSize: data.typeSize,
        spacing: data.spacing,
        leading: data.leading,
      });
      setSeeAll(false);
    }
  }, [open, templateId, data.fontId, data.accent, data.typeSize, data.spacing, data.leading]);

  const revert = useCallback(() => {
    if (onOpen) {
      onTemplate(onOpen.templateId);
      if (onOpen.fontId) onFont(onOpen.fontId);
      onAccent(onOpen.accent);
      onStyle({ typeSize: onOpen.typeSize, spacing: onOpen.spacing, leading: onOpen.leading });
    }
    onClose();
  }, [onOpen, onTemplate, onFont, onAccent, onStyle, onClose]);

  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") revert();
    };
    window.addEventListener("keydown", key);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = previous;
    };
  }, [open, revert]);

  if (!open) return null;

  return (
    <div className="picker" role="dialog" aria-modal="true" aria-labelledby="picker-title">
      <button type="button" className="picker-scrim" aria-label="Close" onClick={revert} />

      <div className="picker-panel is-design">
        <header className="picker-head">
          <h2 id="picker-title">Change design</h2>
          <button type="button" className="picker-x" aria-label="Close" onClick={revert}>
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
              <button type="button" className="picker-see-all" onClick={() => setSeeAll((value) => !value)}>
                {seeAll ? "Show less" : `See all ${templateCount}`}
              </button>
            </div>
            <div className={seeAll ? "picker-grid" : "picker-strip-wrap"}>
              <TemplateFan
                layout={seeAll ? "picker" : "strip"}
                filter={seeAll ? "all" : "picks"}
                maxItems={seeAll ? undefined : 4}
                templateId={templateId}
                data={data}
                onChange={onTemplate}
              />
            </div>
          </div>

          <div className="picker-block">
            <span className="picker-label">Colour</span>
            <AccentSwatches accent={data.accent} onAccent={onAccent} className="picker-colors picker-colors-row" />
          </div>

          <div className="picker-block">
            <span className="picker-label">Text size</span>
            <TextSizePicker
              typeSize={data.typeSize}
              onChange={(typeSize) => onStyle({ typeSize, spacing: data.spacing, leading: data.leading })}
            />
          </div>

          <div className="picker-block">
            <span className="picker-label">Spacing</span>
            <SpacingPicker
              spacing={data.spacing}
              onChange={(spacing) => onStyle({ typeSize: data.typeSize, spacing, leading: data.leading })}
            />
          </div>
        </section>

        <footer className="picker-foot">
          <div className="picker-acts">
            <button type="button" className="picker-cancel" onClick={revert}>
              Cancel
            </button>
            <button type="button" className="picker-done" onClick={onClose}>
              Done
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
