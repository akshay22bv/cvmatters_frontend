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
  body: string;
  label: string;
  Icon: () => ReactNode;
}[] = [
  { id: "details", title: "Details", body: "Name, photo, and how to reach you.", label: "Details", Icon: IconUser },
  { id: "bio", title: "Summary", body: "Two or three lines at the top of the page.", label: "Summary", Icon: IconBio },
  { id: "experience", title: "Experience", body: "Roles, companies, and what you did.", label: "Work", Icon: IconWork },
  { id: "education", title: "Education", body: "Schools, degrees, and years.", label: "School", Icon: IconSchool },
  { id: "skills", title: "Skills", body: "Tools and strengths for the role.", label: "Skills", Icon: IconSkills },
  { id: "extras", title: "Extra sections", body: "Projects, awards, languages, and more.", label: "Extra", Icon: IconPage },
  { id: "job", title: "Job post", body: "Paste the role you are aiming at.", label: "Job", Icon: IconTarget },
  { id: "compare", title: "Download", body: "Take a PDF when the page is ready.", label: "PDF", Icon: IconDownload },
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

