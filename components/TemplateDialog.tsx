"use client";

import { useEffect, useState } from "react";
import { LookBar } from "./LookBar";
import { ResumeView } from "./ResumeSheet";
import { TemplateFan } from "./TemplateFan";
import {
  templateName,
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
 * Template and type on the left, the page they produce on the right. Back puts
 * everything the way it was when the sheet opened, so trying things on costs nothing.
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
  templateId: TemplateId;
  data: ResumeData;
  onClose: () => void;
  onTemplate: (id: TemplateId) => void;
  onFont: (id: FontId) => void;
  onAccent: (hex: string | undefined) => void;
  onStyle: (look: Pick<ResumeData, "typeSize" | "spacing" | "leading">) => void;
}) {
  const [onOpen, setOnOpen] = useState<Look | null>(null);

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
    }
    // only when the sheet opens, so later edits are not treated as the starting point
  }, [open]);

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

  const revert = () => {
    if (onOpen) {
      onTemplate(onOpen.templateId);
      if (onOpen.fontId) onFont(onOpen.fontId);
      onAccent(onOpen.accent);
      onStyle({ typeSize: onOpen.typeSize, spacing: onOpen.spacing, leading: onOpen.leading });
    }
    onClose();
  };

  return (
    <div className="picker" role="dialog" aria-modal="true" aria-label="Choose a template">
      <button type="button" className="picker-scrim" aria-label="Close" onClick={revert} />

      <div className="picker-panel">
        <button type="button" className="picker-x" aria-label="Close" onClick={revert}>
          ×
        </button>

        <section className="picker-side">
          <header className="picker-top">
            <h2>Template & look</h2>
            <p className="picker-lead">Pick a layout, then tune type from the bar.</p>
          </header>

          <div className="picker-block">
            <span className="picker-label">Layout</span>
            <div className="picker-grid">
              <TemplateFan layout="picker" templateId={templateId} data={data} onChange={onTemplate} />
            </div>
          </div>

          <div className="picker-look">
            <LookBar data={data} onFont={onFont} onAccent={onAccent} onStyle={onStyle} />
          </div>
        </section>

        <section className="picker-view">
          <div className="picker-stage">
            <ResumeView templateId={templateId} data={data} />
          </div>
        </section>

        <footer className="picker-foot">
          <span className="picker-name">{templateName(templateId)}</span>
          <div className="picker-acts">
            <button type="button" className="step-back" onClick={revert}>
              Back
            </button>
            <button type="button" className="step-next" onClick={onClose}>
              Continue
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
