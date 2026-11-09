export const TEMPLATES = [
  { id: "mint", name: "Clean" },
  { id: "banner", name: "Header" },
  { id: "formal", name: "Classic" },
  { id: "apex", name: "Profile" },
  { id: "cabinet", name: "Sidebar" },
  { id: "manor", name: "Ribbon" },
  { id: "canvas", name: "Spine" },
  { id: "cobalt", name: "Accent" },
  { id: "studio", name: "Bars" },
  { id: "vault", name: "Balance" },
  { id: "plaza", name: "Center" },
  { id: "editorial", name: "Standard" },
  { id: "signal", name: "Inline" },
  { id: "split", name: "Column" },
  { id: "ledger", name: "Traditional" },
  { id: "compact", name: "Essential" },
  { id: "horizon", name: "Corporate" },
  { id: "classic", name: "Harvard" },
  { id: "blocks", name: "Bold" },
  { id: "sage", name: "Sage" },
  { id: "navy", name: "Navy" },
  { id: "prime", name: "Prime" },
  { id: "iconic", name: "Iconic" },
  { id: "crisp", name: "Crisp" },
  { id: "timeline", name: "Timeline" },
  { id: "band", name: "Band" },
  { id: "folio", name: "Folio" },
  { id: "slate", name: "Slate" },
  { id: "quartz", name: "Quartz" },
  { id: "dens", name: "Ash" },
  { id: "hex", name: "Hex" },
  { id: "hello", name: "Hello" },
  { id: "quote", name: "Quote" },
  { id: "tide", name: "Tide" },
  { id: "taupe", name: "Taupe" },
  { id: "grid", name: "Grid" },
  { id: "crest", name: "Crest" },
  { id: "ruby", name: "Ruby" },
  { id: "linen", name: "Linen" },
] as const;

export const CATEGORIES = ["Design", "Engineering", "Product", "Marketing"] as const;

const FIELD_WORDS: Record<(typeof CATEGORIES)[number], RegExp> = {
  Engineering: /\b(engineer|developer|software|backend|frontend|full[- ]stack|devops|sre|python|java|react|node)\b/gi,
  Product: /\b(product manager|product owner|product management|\bpm\b|roadmap|stakeholder)\b/gi,
  Marketing: /\b(marketing|seo|content|campaign|brand|growth|copywriter|copywriting)\b/gi,
  Design: /\b(designer|design|figma|ux|ui|visual|prototype|wireframe)\b/gi,
};

/** Best-guess field from a job posting, so examples open in the same field. */
export function fieldFromText(text: string): (typeof CATEGORIES)[number] | null {
  let best: (typeof CATEGORIES)[number] | null = null;
  let bestCount = 0;
  for (const category of CATEGORIES) {
    const count = text.match(FIELD_WORDS[category])?.length || 0;
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }
  return best;
}

export const STEPS = [
  { id: "details", label: "Your Details" },
  { id: "bio", label: "Short Bio" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
] as const;

/**
 * The order the builder walks: the five sections every resume needs, then the
 * optional extras, then the two things you do with a finished resume.
 */
export const FLOW = ["details", "bio", "experience", "education", "skills", "extras", "job", "compare"] as const;

/** Sections offered on the extras step, in the order they are suggested. */
export const EXTRA_KINDS: { id: string; title: string; pick?: boolean }[] = [
  { id: "certifications", title: "Certifications", pick: true },
  { id: "languages", title: "Languages", pick: true },
  { id: "projects", title: "Projects" },
  { id: "awards", title: "Accomplishments and awards" },
  { id: "hobbies", title: "Hobbies and interests" },
  { id: "links", title: "Websites, portfolios, profiles" },
];

export type TemplateId = (typeof TEMPLATES)[number]["id"];

const PHOTO_TEMPLATES = new Set<TemplateId>([
  "apex",
  "cabinet",
  "manor",
  "canvas",
  "cobalt",
  "vault",
  "plaza",
  "split",
  "sage",
  "navy",
  "folio",
  "iconic",
  "tide",
  "crest",
  "hex",
]);

export function isTemplateId(value: string | undefined): value is TemplateId {
  return !!value && TEMPLATES.some((item) => item.id === value);
}

/** Unknown or retired ids land on Clean. */
export function readTemplateId(value: string | undefined): TemplateId {
  if (value === "ink") return "mint";
  return isTemplateId(value) ? value : "mint";
}

export function templateHasPhoto(templateId: TemplateId) {
  return PHOTO_TEMPLATES.has(templateId);
}
export type Category = (typeof CATEGORIES)[number];
export type StepId = (typeof STEPS)[number]["id"];
export type PanelId = (typeof FLOW)[number] | "ats";

export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  bullets: string[];
};

/** A section you add yourself: a heading and a few lines under it. */
export type Extra = {
  id: string;
  title: string;
  items: string[];
  /** When true, lines print as a bullet list. Default is plain text. */
  bullets?: boolean;
};

export type Education = {
  id: string;
  degree: string;
  school: string;
  year: string;
  detail: string;
};

export const FONTS = [
  { id: "sans", name: "Google Sans", sample: "Aa" },
  { id: "dm", name: "DM Sans", sample: "Aa" },
  { id: "inter", name: "Inter", sample: "Aa" },
  { id: "roboto", name: "Roboto", sample: "Aa" },
  { id: "montserrat", name: "Montserrat", sample: "Aa" },
  { id: "poppins", name: "Poppins", sample: "Aa" },
  { id: "serif", name: "Source Serif", sample: "Aa" },
  { id: "lora", name: "Lora", sample: "Aa" },
  { id: "libre", name: "Libre", sample: "Aa" },
  { id: "merriweather", name: "Merriweather", sample: "Aa" },
  { id: "playfair", name: "Playfair", sample: "Aa" },
] as const;

export type FontId = (typeof FONTS)[number]["id"];

export function isFontId(value: string | undefined): value is FontId {
  return !!value && FONTS.some((font) => font.id === value);
}

export function fontClass(id?: string) {
  return isFontId(id) ? `font-${id}` : "font-sans";
}

/**
 * A numeric design control. `base` is the template's own size (CSS scale 1).
 * `legacy` keeps resumes saved when these were Small / Tight / Relaxed.
 */
type Metric = {
  min: number;
  max: number;
  step: number;
  base: number;
  legacy: Record<string, number>;
};

/** Body size in points. 10pt is the template's own size. 9 and 11 were Small and Large. */
export const FONT_SIZE: Metric = {
  min: 8,
  max: 14,
  step: 1,
  base: 10,
  legacy: { sm: 9, md: 10, lg: 11 },
};

/** Space between sections, in points. 10pt is the template's own rhythm. */
export const SPACING: Metric = {
  min: 4,
  max: 20,
  step: 1,
  base: 10,
  legacy: { tight: 6, normal: 10, relaxed: 14 },
};

/** Line height the way a word processor shows it. 1.00 is the template's own. */
export const LINE_HEIGHT: Metric = {
  min: 0.9,
  max: 1.5,
  step: 0.05,
  base: 1,
  legacy: { tight: 0.9, normal: 1, relaxed: 1.15 },
};

export function clampMetric(metric: Pick<Metric, "min" | "max" | "step">, value: number) {
  const steps = Math.round((value - metric.min) / metric.step);
  const snapped = metric.min + steps * metric.step;
  const clamped = Math.min(metric.max, Math.max(metric.min, snapped));
  const decimals = (String(metric.step).split(".")[1] || "").length;
  return Number(clamped.toFixed(decimals));
}

/** Resolve a stored value, including the old word ids, to a number on the control. */
export function readMetric(metric: Metric, value: unknown) {
  if (typeof value === "string" && Object.prototype.hasOwnProperty.call(metric.legacy, value)) return metric.legacy[value];
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return metric.base;
  return clampMetric(metric, n);
}

export function formatMetric(metric: Metric, value: number) {
  const decimals = (String(metric.step).split(".")[1] || "").length;
  return value.toFixed(decimals);
}

function metricScale(metric: Metric, value: unknown) {
  return readMetric(metric, value) / metric.base;
}

/** Black on a light fill, white on a dark one. The crossover is where black's contrast wins. */
function inkFor(hex: string) {
  const raw = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return "#ffffff";
  const n = Number.parseInt(raw, 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? "#1c1c1c" : "#ffffff";
}

/** CSS variables the page reads for colour, type size, spacing and line height. */
export function paperStyle(data: { accent?: string; typeSize?: number; spacing?: number; leading?: number }) {
  const style: Record<string, string> = {
    "--type": String(metricScale(FONT_SIZE, data.typeSize)),
    "--space": String(metricScale(SPACING, data.spacing)),
    "--lead": String(metricScale(LINE_HEIGHT, data.leading)),
  };
  if (data.accent) {
    style["--accent"] = data.accent;
    style["--header"] = data.accent;
    style["--theme"] = data.accent;
    style["--on-theme"] = inkFor(data.accent);
  }
  return style;
}

/**
 * Accent colours a resume can take. Templates that paint with var(--accent)
 * follow whichever is chosen; the rest keep their own palette by design.
 */
/** Preset accent swatches in the design picker; all are in ACCENTS. */
export const SITE_COLOURS = [
  "#0a0a0a",
  "#1f2430",
  "#3f4652",
  "#6b7280",
  "#3b63e8",
  "#3657ff",
  "#2f6d85",
  "#2c6b4f",
  "#8fb34a",
  "#eab308",
  "#d97706",
  "#c75c5c",
  "#8f2f2f",
  "#6b5444",
] as const;

export const ACCENTS = [
  "#0a0a0a", "#8fb34a",
  "#6b7280", "#c9c4bb", "#3b63e8", "#93aef6", "#6fc5e8", "#74c3a6", "#eab308", "#e08b8b",
  "#3f4652", "#b3a79b", "#2f4f9e", "#3657ff", "#4a9bbf", "#3f8f6f", "#d97706", "#c75c5c",
  "#1f2430", "#6b5444", "#16306b", "#2a44c8", "#2f6d85", "#2c6b4f", "#a65b06", "#8f2f2f",
] as const;

export function isAccent(value: string | undefined): value is string {
  return !!value && (ACCENTS as readonly string[]).includes(value);
}

export type ResumeData = {
  fontId?: FontId;
  /** Hex from ACCENTS, or undefined to keep the template's own colour. */
  accent?: string;
  /** Absent means the template's own size (10pt), spacing (10pt) and line height (1). */
  typeSize?: number;
  spacing?: number;
  leading?: number;
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    pincode: string;
    photoUrl: string;
    linkedin: string;
    github: string;
    website: string;
    portfolio: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: {
    industry: string[];
    tools: string[];
    other: string[];
  };
  extras?: Extra[];
  /** What a shared copy reveals. Absent means neither. */
  share?: { email: boolean; phone: boolean };
};

export type ResumeRecord = {
  id: string;
  templateId: TemplateId;
  category: Category;
  isPublic: boolean;
  /** Public handle the owner chose, e.g. `akshay`. */
  slug?: string | null;
  jobDescription: string;
  data: ResumeData;
  updatedAt: string;
  /** Only on gallery rows. */
  rating?: RatingSummary;
  isMine?: boolean;
};

export function templateName(id: string) {
  return TEMPLATES.find((item) => item.id === id)?.name || "Standard";
}

/* --- accounts, billing and ratings --- */

export type Account = {
  id: string;
  email: string;
  name: string;
};

export type Subscription = {
  id: string;
  plan: string;
  planName: string;
  status: string;
  startedAt: string;
  expiresAt: string;
};

/** What a shared copy of the resume reveals. */
export type Share = {
  listed: boolean;
  email: boolean;
  phone: boolean;
};

export type Entitlement = {
  canDownload: boolean;
  subscription: Subscription | null;
};

export type Plan = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  price: string;
  cadence: string;
  blurb: string;
  perks: string[];
  best: boolean;
  savingsNote: string;
};

export type RatingSummary = {
  average: number;
  count: number;
  mine: number;
};
