"use client";

import { Tilt } from "./motion";
import { ResumeSheet } from "./ResumeSheet";
import { sampleForTemplate } from "@/lib/content";
import { templateName, type TemplateId } from "@/lib/types";

type CatalogItem = { id: TemplateId; blurb: string };

export function LandingTemplateGallery({
  templates,
  busy,
  onPick,
}: {
  templates: CatalogItem[];
  busy: boolean;
  onPick: (id: TemplateId) => void;
}) {
  return (
    <div className="board-gallery" role="list" aria-label="Resume templates">
      {templates.map((item, index) => (
        <Tilt key={item.id} className="board-tile-tilt" max={4} lift={8}>
          <button
            type="button"
            role="listitem"
            className="board-tile"
            disabled={busy}
            style={{ animationDelay: `${index * 40}ms` }}
            onClick={() => onPick(item.id)}
          >
            <span className="board-tile-stage" aria-hidden="true">
              <span className="board-tile-paper">
                <ResumeSheet templateId={item.id} data={sampleForTemplate(item.id)} preview fill />
              </span>
            </span>
            <span className="board-tile-meta">
              <strong>{templateName(item.id)}</strong>
              <em>{item.blurb}</em>
            </span>
          </button>
        </Tilt>
      ))}
    </div>
  );
}