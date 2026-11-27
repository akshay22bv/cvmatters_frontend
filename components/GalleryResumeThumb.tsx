import { isAtsSplit } from "./atsTemplates";
import { ResumeSheet } from "./ResumeSheet";
import { sampleForTemplateGallery } from "@/lib/content";
import type { TemplateId } from "@/lib/types";
import { readTemplateId } from "@/lib/types";

/**
 * Landing gallery thumb — CSS container width sets scale (no post-mount JS refit).
 * Post-load height fitting was shrinking scale after fonts/images loaded and made type look wrong.
 */
export function GalleryResumeThumb({ templateId: rawId }: { templateId: TemplateId }) {
  const templateId = readTemplateId(rawId);
  const splitLayout = isAtsSplit(templateId);
  return (
    <span className="board-tile-paper is-gallery-fit is-thumb-stage">
      <ResumeSheet
        templateId={templateId}
        data={sampleForTemplateGallery(templateId)}
        preview
        fill={splitLayout}
      />
    </span>
  );
}