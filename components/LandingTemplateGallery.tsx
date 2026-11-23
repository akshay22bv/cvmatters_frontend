"use client";

import { GalleryResumeThumb } from "./GalleryResumeThumb";
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
        <div
          key={item.id}
          className="board-tile-tilt"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div
            role="listitem"
            className={busy ? "board-tile is-busy" : "board-tile"}
            aria-label={templateName(item.id)}
          >
            <span className="board-tile-stage" aria-hidden="true">
              <GalleryResumeThumb templateId={item.id} />
              <span className="board-tile-hover">
                <span className="board-tile-hover-inner">
                  <span className="board-tile-hover-name">{templateName(item.id)}</span>
                  <button
                    type="button"
                    className="board-tile-hover-cta"
                    disabled={busy}
                    onClick={() => onPick(item.id)}
                  >
                    Use this template →
                  </button>
                </span>
              </span>
            </span>
            <div className="board-tile-foot">
              <button
                type="button"
                className="board-tile-foot-cta"
                disabled={busy}
                onClick={() => onPick(item.id)}
              >
                Use this template →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}