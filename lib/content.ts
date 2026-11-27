import { templateHasPhoto, type Experience, type ResumeData, type TemplateId } from "./types";

export const blank: ResumeData = {
  fontId: "sans",
  typeSize: 10,
  spacing: 10,
  leading: 1,
  personal: { fullName: "", title: "", email: "", phone: "", location: "", pincode: "", photoUrl: "", linkedin: "", github: "", website: "", portfolio: "" },
  summary: "",
  experience: [],
  education: [],
  skills: { industry: [], tools: [], other: [] },
};

export const starter: ResumeData = {
  fontId: "sans",
  typeSize: 10,
  spacing: 10,
  leading: 1,
  personal: {
    fullName: "Alex Rivera",
    title: "Senior Product Designer",
    email: "alex.rivera@studio.dev",
    phone: "+91 98400 22190",
    location: "Bengaluru, India",
    pincode: "560001",
    photoUrl: "",
    linkedin: "",
    github: "",
    website: "",
    portfolio: "",
  },
  summary:
    "I'm a Senior Product Designer focused on calm, useful products. For the last decade I've shaped design systems and end-to-end flows for teams that ship. I care about clear hierarchy, honest interfaces, and work that still holds up after launch.",
  experience: [
    {
      id: "exp-northwind",
      role: "Senior Product Designer",
      company: "Northwind Studio",
      location: "Bengaluru, India",
      start: "03/2022",
      end: "",
      current: true,
      bullets: [
        "Designed the core product surfaces for a multi-brand design system used by 40 designers.",
        "Partnered with research and engineering to simplify onboarding and cut setup time in half.",
        "Led weekly critiques that kept visual quality consistent across web and mobile.",
      ],
    },
    {
      id: "exp-fieldnote",
      role: "Product Designer",
      company: "Fieldnote",
      location: "Remote",
      start: "01/2020",
      end: "02/2022",
      current: false,
      bullets: [
        "Shipped a planning app for small teams, from first sketches through launch.",
        "Built a component library that replaced one-off screens and sped up delivery.",
        "Worked with founders on positioning, the pricing page, and the first marketing site.",
      ],
    },
    {
      id: "exp-loom",
      role: "UX Designer",
      company: "Loom & Co.",
      location: "Pune, India",
      start: "06/2018",
      end: "12/2019",
      current: false,
      bullets: [
        "Designed high-fidelity flows for a retail client's checkout and account tools.",
        "Turned research notes into patterns the team could reuse on the next release.",
      ],
    },
  ],
  education: [
    {
      id: "edu-nid",
      degree: "BDes in Communication Design",
      school: "National Institute of Design",
      year: "2018",
      detail: "Graduated with distinction",
    },
    {
      id: "edu-xavier",
      degree: "BA in Psychology",
      school: "St. Xavier's College",
      year: "2015",
      detail: "Focus on cognition and research methods",
    },
  ],
  skills: {
    industry: ["Product Design", "Design Systems", "User Research", "Interaction Design"],
    tools: ["Figma", "FigJam", "Prototyping", "Photoshop"],
    other: ["HTML", "CSS", "Design QA"],
  },
};

/** Realistic headshots for gallery / dashboard photo templates (Unsplash, crop=faces). */
const DUMMY_PORTRAITS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&h=320&fit=crop&crop=faces&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&h=320&fit=crop&crop=faces&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&h=320&fit=crop&crop=faces&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=320&h=320&fit=crop&crop=faces&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&h=320&fit=crop&crop=faces&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&h=320&fit=crop&crop=faces&q=80",
] as const;

const PORTRAIT = DUMMY_PORTRAITS[0];

/**
 * The page a template opens with. Same shape as a filled sample: photo, summary,
 * three roles, education, skills, and two side sections, packed tight so the
 * sheet reads as a finished page rather than a header on blank paper.
 */
export const showcase: ResumeData = {
  fontId: "sans",
  typeSize: 10,
  spacing: 10,
  leading: 1,
  personal: {
    fullName: "Alex Rivera",
    title: "Product Designer",
    email: "alex.rivera@studio.dev",
    phone: "+91 98400 22190",
    location: "Bengaluru, India",
    pincode: "560001",
    photoUrl: PORTRAIT,
    linkedin: "linkedin.com/in/alexrivera",
    github: "github.com/alexrivera",
    website: "alexrivera.design",
    portfolio: "dribbble.com/alexrivera",
  },
  summary:
    "Product designer with ten years taking software from the first sketch to the version people use. Known for design systems, clear interfaces, and work that holds up after launch.",
  experience: [
    {
      id: "exp-northwind",
      role: "Senior Product Designer",
      company: "Northwind Studio",
      location: "Bengaluru",
      start: "03/2022",
      end: "",
      current: true,
      bullets: [
        "Designed the core surfaces of a design system used by 40 designers.",
        "Cut onboarding setup time in half, working with research and engineering.",
        "Kept visual quality consistent across web and mobile.",
        "Presented quarterly design reviews to leadership with measurable UX outcomes.",
      ],
    },
    {
      id: "exp-fieldnote",
      role: "Product Designer",
      company: "Fieldnote",
      location: "Remote",
      start: "01/2020",
      end: "02/2022",
      current: false,
      bullets: [
        "Shipped a planning app for small teams, from sketches through launch.",
        "Replaced one-off screens with a component library the team could reuse.",
        "Ran moderated usability tests monthly and folded findings into the roadmap.",
      ],
    },
    {
      id: "exp-loom",
      role: "UX Designer",
      company: "Loom & Co.",
      location: "Pune",
      start: "06/2018",
      end: "12/2019",
      current: false,
      bullets: [
        "Designed checkout and account flows for a retail client.",
        "Turned research notes into patterns the next release could reuse.",
        "Partnered with developers on responsive specs and motion handoff.",
      ],
    },
  ],
  education: [
    {
      id: "edu-nid",
      degree: "BDes, Communication Design",
      school: "National Institute of Design",
      year: "2018",
      detail: "Graduated with distinction",
    },
    {
      id: "edu-xavier",
      degree: "BA in Psychology",
      school: "St. Xavier's College",
      year: "2015",
      detail: "Focus on cognition and research methods",
    },
  ],
  skills: {
    industry: [
      "Product Design",
      "Design Systems",
      "User Research",
      "Interaction Design",
      "Visual Design",
      "Design Ops",
    ],
    tools: ["Figma", "Prototyping", "FigJam", "Maze", "Principle", "After Effects"],
    other: ["HTML", "CSS", "Accessibility", "Design QA"],
  },
  hiddenSections: [],
  extras: [
    {
      id: "extra-certs",
      title: "Certifications",
      items: ["NN/g UX Certification, 2021", "Google UX Design Certificate, 2020"],
    },
    {
      id: "extra-languages",
      title: "Languages",
      items: ["English — native", "Hindi — fluent", "Kannada — conversational"],
    },
    {
      id: "extra-projects",
      title: "Projects",
      items: ["Fieldnote planning app, shipped to 12,000 teams", "Northwind design system, used by 40 designers"],
    },
    {
      id: "extra-awards",
      title: "Key Achievements",
      bullets: true,
      items: [
        "Increased activation by 38% through onboarding and empty-state redesign",
        "Built a design system adopted by 40 designers across three product lines",
        "Cut new-hire setup time in half with reusable templates and docs",
      ],
    },
    {
      id: "extra-hobbies",
      title: "Passions",
      items: ["Letterpress", "City sketching", "Mentoring junior designers"],
    },
    {
      id: "extra-quote",
      title: "Favorite Quote",
      items: ['"Design is intelligence made visible." — Alina Wheeler'],
    },
    {
      id: "extra-links",
      title: "Links",
      items: ["alexrivera.design", "dribbble.com/alexrivera"],
    },
  ],
};

/** A fresh copy, so editing the opened sample does not change the gallery. */
export function sampleResume(role?: string): ResumeData {
  const title = role?.trim();
  return {
    ...showcase,
    personal: { ...showcase.personal, title: title || showcase.personal.title },
    experience: showcase.experience.map((job) => ({ ...job, bullets: [...job.bullets] })),
    education: showcase.education.map((item) => ({ ...item })),
    skills: {
      industry: [...showcase.skills.industry],
      tools: [...showcase.skills.tools],
      other: [...showcase.skills.other],
    },
    extras: (showcase.extras || []).map((extra) => ({ ...extra, items: [...extra.items] })),
  };
}

/**
 * Dashboard / gallery preview for one layout. Photo templates get a dummy
 * portrait; layouts without a photo slot stay blank so initials do not appear.
 */
export function sampleForTemplate(templateId: TemplateId, role?: string): ResumeData {
  const base = sampleResume(role);
  if (!templateHasPhoto(templateId)) {
    return { ...base, personal: { ...base.personal, photoUrl: "" } };
  }
  const index = Math.abs(
    [...templateId].reduce((total, char) => total + char.charCodeAt(0), 0),
  ) % DUMMY_PORTRAITS.length;
  return {
    ...base,
    personal: { ...base.personal, photoUrl: DUMMY_PORTRAITS[index] },
  };
}

/** Gallery thumbs: one full page, readable type (home + picker). */
const GALLERY_SAMPLE_PAGE: Pick<ResumeData, "typeSize" | "spacing" | "leading"> = {
  typeSize: 10,
  spacing: 8,
  leading: 0.98,
};

/** Gallery thumbs: rich sections + compact spacing so every layout looks finished. */
export function sampleForTemplateGallery(templateId: TemplateId, role?: string): ResumeData {
  const base = sampleForTemplate(templateId, role);
  return {
    ...base,
    ...GALLERY_SAMPLE_PAGE,
    personal: {
      ...base.personal,
      github: "",
      website: "",
      portfolio: "",
    },
  };
}

export function dateRange(job: Experience) {
  const end = job.current ? "present" : job.end;
  const bits = [job.start, end].filter(Boolean);
  if (!bits.length) return "";
  return `(${bits.join(" – ")})`;
}

export function plainRange(job: Experience) {
  const end = job.current ? "present" : job.end;
  return [job.start, end].filter(Boolean).join(" – ");
}

export function resumePlainText(data: ResumeData) {
  return [
    data.personal.fullName,
    data.personal.title,
    data.personal.linkedin,
    data.personal.github,
    data.personal.website,
    data.personal.portfolio,
    data.summary,
    ...data.experience.flatMap((job) => [job.role, job.company, job.location, ...job.bullets]),
    ...data.education.flatMap((item) => [item.degree, item.school, item.detail]),
    ...data.skills.industry,
    ...data.skills.tools,
    ...data.skills.other,
  ]
    .join(" ")
    .toLowerCase();
}
