"use client";

import { useEffect, useState } from "react";
import { ResumeSheet } from "./ResumeSheet";
import { loadGallery } from "@/lib/api";
import { sampleForTemplate } from "@/lib/content";
import type { Category, ResumeData, TemplateId } from "@/lib/types";

/**
 * The same kind of clip Enhancv puts on a template card: the real page,
 * cropped in a frame, drifting down and back so it reads as a short video.
 */
export function ResumeFilm({
  templateId,
  data,
  delay = "0s",
}: {
  templateId: TemplateId;
  data: ResumeData;
  delay?: string;
}) {
  return (
    <span className="film" aria-hidden="true">
      <span className="film-reel" style={{ animationDelay: delay }}>
        <ResumeSheet templateId={templateId} data={data} preview />
      </span>
    </span>
  );
}

export function JobFilm({ templateId, data }: { templateId: TemplateId; data: ResumeData }) {
  return (
    <span className="film" aria-hidden="true">
      <span className="film-reel" style={{ animationDelay: "-6s" }}>
        <ResumeSheet templateId={templateId} data={data} preview />
      </span>
      <span className="film-job">
        <small>Job post</small>
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

export function CompareFilm({
  templateId,
  data,
  field,
}: {
  templateId: TemplateId;
  data: ResumeData;
  field: Category;
}) {
  const [other, setOther] = useState<{ templateId: TemplateId; data: ResumeData } | null>(null);

  useEffect(() => {
    let cancel = false;
    loadGallery(field)
      .then((rows) => {
        if (cancel) return;
        const named = (row: (typeof rows)[number]) => row.data.personal.fullName.trim();
        const pick =
          rows.find((row) => named(row) && named(row) !== data.personal.fullName.trim() && row.data.experience.length > 0) ||
          rows.find((row) => named(row) && row.data.experience.length > 0);
        if (pick) setOther({ templateId: pick.templateId, data: pick.data });
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [field, data.personal.fullName]);

  const side = other || { templateId: "mint" as TemplateId, data: sampleForTemplate("mint") };

  return (
    <span className="film is-pair" aria-hidden="true">
      <span className="film-reel is-left">
        <ResumeSheet templateId={templateId} data={data} preview />
      </span>
      <span className="film-reel is-right">
        <ResumeSheet templateId={side.templateId} data={side.data} preview />
      </span>
    </span>
  );
}
