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

/** Neutral person silhouette used on gallery / dashboard photo templates. */
function dummyPortrait(bg: string, ink: string) {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="${bg}"/>
        <circle cx="120" cy="92" r="44" fill="${ink}" opacity="0.92"/>
        <path d="M42 222c10-52 40-78 78-78s68 26 78 78" fill="${ink}" opacity="0.92"/>
      </svg>`,
    )
  );
}

const DUMMY_PORTRAITS = [
  dummyPortrait("#d7dde7", "#6b7380"),
  dummyPortrait("#dde8e2", "#5f7468"),
  dummyPortrait("#e6e0d8", "#7a6f63"),
  dummyPortrait("#dce4ef", "#5b6c84"),
  dummyPortrait("#e8dfe3", "#7a6570"),
  dummyPortrait("#dfe7e0", "#617066"),
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
    industry: ["Product Design", "Design Systems", "User Research"],
    tools: ["Figma", "Prototyping", "FigJam"],
    other: ["HTML", "CSS"],
  },
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
      title: "Awards",
      items: ["Design system adopted across three product lines", "Onboarding setup time cut in half"],
    },
    {
      id: "extra-hobbies",
      title: "Interests",
      items: ["Letterpress", "City sketching", "Weekend football"],
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
