import type { TemplateId } from "./types";

export type CatalogEntry = {
  id: TemplateId;
  blurb: string;
  /** One column, or a side column beside the roles. */
  kind: "one" | "two";
  photo?: boolean;
  /** Shown first, the way a template gallery leads with a short list. */
  pick?: boolean;
};

export const CATALOG: CatalogEntry[] = [
  { id: "mint", kind: "one", pick: true, blurb: "Teal name and headings, contact on the right. Clean single column for ATS." },
  { id: "banner", kind: "one", pick: true, blurb: "Dark header band with icons. Blue section titles, single column." },
  { id: "formal", kind: "one", pick: true, blurb: "Centred serif name, pipe-separated contact, classic date columns." },
  { id: "apex", kind: "two", photo: true, pick: true, blurb: "Photo top-right, blue accents, skill pills and a side column." },
  { id: "cabinet", kind: "two", photo: true, pick: true, blurb: "Photo beside the name, grey skill sidebar with bars." },
  { id: "manor", kind: "two", photo: true, pick: true, blurb: "Slate sidebar, photo, and a dark title ribbon across the page." },
  { id: "canvas", kind: "two", photo: true, pick: true, blurb: "Warm header with photo, dual columns linked by a spine." },
  { id: "cobalt", kind: "two", photo: true, pick: true, blurb: "Grey sidebar with blue accents and timeline roles." },
  { id: "studio", kind: "one", pick: true, blurb: "Minimal black type with grey section bars." },
  { id: "vault", kind: "two", photo: true, pick: true, blurb: "Roles on the left, photo and skills on the right." },
  { id: "plaza", kind: "one", photo: true, pick: true, blurb: "Name, photo, and contact in one header band." },
  { id: "editorial", kind: "one", blurb: "Left-aligned name, clean sans type." },
  { id: "split", kind: "two", photo: true, blurb: "Skills sit beside the roles." },
  { id: "classic", kind: "one", blurb: "Centred serif name and double rules." },
  { id: "navy", kind: "two", photo: true, blurb: "A dark side column for contact and skills." },
  { id: "timeline", kind: "one", blurb: "A vertical line and dots beside each role." },
  { id: "compact", kind: "one", blurb: "Tight single column." },
  { id: "quartz", kind: "two", blurb: "Roles on the left, highlights on the right." },
  { id: "signal", kind: "one", blurb: "Name, title, then contact on one line." },
  { id: "ledger", kind: "one", blurb: "Full serif page, small-caps headings." },
  { id: "horizon", kind: "one", blurb: "Name and contact in a dark band." },
  { id: "ink", kind: "one", blurb: "A dark page." },
  { id: "blocks", kind: "one", blurb: "Section titles in solid bars." },
  { id: "sage", kind: "two", photo: true, blurb: "A green side column." },
  { id: "prime", kind: "one", blurb: "Dates in their own column." },
  { id: "iconic", kind: "one", photo: true, blurb: "A coloured banner with a photo." },
  { id: "crisp", kind: "one", blurb: "Lots of air and a single coloured rule." },
  { id: "band", kind: "one", blurb: "The role sits in a band under the name." },
  { id: "folio", kind: "one", photo: true, blurb: "Photo, name, and contact in one header." },
  { id: "slate", kind: "two", blurb: "A grey column for skills." },
  { id: "dens", kind: "one", blurb: "Initials in a dark bar." },
  { id: "hex", kind: "one", photo: true, blurb: "A photo mark, then the roles." },
  { id: "hello", kind: "one", blurb: "Opens with a short hello." },
  { id: "quote", kind: "two", blurb: "A light side column." },
  { id: "tide", kind: "two", photo: true, blurb: "A coloured side column." },
  { id: "taupe", kind: "one", blurb: "A warm band for the name." },
  { id: "grid", kind: "one", blurb: "Skills in two columns first." },
  { id: "crest", kind: "one", photo: true, blurb: "A dark header with the photo on the right." },
  { id: "ruby", kind: "one", blurb: "A coloured bar across the top." },
  { id: "linen", kind: "two", blurb: "A warm side column for skills." },
];

/** ATS layouts the product offers in the picker and gallery. */
export const OFFERED_IDS = [
  "mint",
  "banner",
  "formal",
  "apex",
  "cabinet",
  "manor",
  "canvas",
  "cobalt",
  "studio",
  "vault",
  "plaza",
] as const;

export function offeredCatalog() {
  return OFFERED_IDS.map((id) => CATALOG.find((item) => item.id === id)).filter((item): item is CatalogEntry => !!item);
}

export const TEMPLATE_FILTERS = [
  { id: "picks", label: "Top picks" },
  { id: "one", label: "One column" },
  { id: "two", label: "Two columns" },
  { id: "photo", label: "With photo" },
] as const;

export type TemplateFilter = (typeof TEMPLATE_FILTERS)[number]["id"] | "all";

export function catalogFor(filter: TemplateFilter) {
  if (filter === "all") return CATALOG;
  if (filter === "picks") return offeredCatalog();
  if (filter === "photo") return offeredCatalog().filter((item) => item.photo);
  return offeredCatalog().filter((item) => item.kind === filter);
}
