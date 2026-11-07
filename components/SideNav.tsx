"use client";

import type { ReactNode } from "react";
import {
  IconBio,
  IconDownload,
  IconPage,
  IconSchool,
  IconSkills,
  IconTarget,
  IconUser,
  IconWork,
} from "./icons";
import { checkpoints, completeness } from "@/lib/progress";
import type { PanelId, ResumeData } from "@/lib/types";

export const SECTIONS: {
  id: PanelId;
  title: string;
  label: string;
  Icon: () => ReactNode;
}[] = [
  { id: "details", title: "Details", label: "Details", Icon: IconUser },
  { id: "bio", title: "Summary", label: "Summary", Icon: IconBio },
  { id: "experience", title: "Experience", label: "Work", Icon: IconWork },
  { id: "education", title: "Education", label: "School", Icon: IconSchool },
  { id: "skills", title: "Skills", label: "Skills", Icon: IconSkills },
  { id: "extras", title: "Extra sections", label: "Extra", Icon: IconPage },
  { id: "job", title: "Job post", label: "Job", Icon: IconTarget },
  { id: "compare", title: "Download", label: "PDF", Icon: IconDownload },
];

/** Section order — used when swiping the form sideways between panels. */
export const DOCK_ORDER: PanelId[] = SECTIONS.map((item) => item.id);

export function sectionFilled(id: PanelId, data: ResumeData, jobDescription: string) {
  const mark = checkpoints(data).find((item) => item.id === id);
  if (mark) return mark.done;
  if (id === "extras") {
    return (data.extras || []).some((extra) => extra.title.trim() || extra.items.some((line) => line.trim()));
  }
  if (id === "job") return jobDescription.trim().length > 40;
  if (id === "compare") return completeness(data) >= 80;
  return false;
}

