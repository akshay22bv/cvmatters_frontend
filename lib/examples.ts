import { heroSampleData } from "./heroShowcase";
import type { ResumeRecord } from "./types";

const stamp = "2026-11-20T00:00:00.000Z";

function requireHero(templateId: "mint" | "formal" | "slate") {
  const data = heroSampleData(templateId);
  if (!data) throw new Error(`Missing hero sample for ${templateId}`);
  return data;
}

/**
 * Anonymized sample resumes across fields — rendered immediately in SSR HTML
 * on `/examples` (before live gallery data loads) and in the homepage showcase.
 */
export const SAMPLE_EXAMPLES: ResumeRecord[] = [
  {
    id: "sample-design-1",
    templateId: "mint",
    category: "Design",
    isPublic: true,
    slug: null,
    jobDescription: "",
    updatedAt: stamp,
    data: requireHero("mint"),
  },
  {
    id: "sample-eng-1",
    templateId: "formal",
    category: "Engineering",
    isPublic: true,
    slug: null,
    jobDescription: "",
    updatedAt: stamp,
    data: requireHero("formal"),
  },
  {
    id: "sample-pm-1",
    templateId: "slate",
    category: "Product",
    isPublic: true,
    slug: null,
    jobDescription: "",
    updatedAt: stamp,
    data: requireHero("slate"),
  },
  {
    id: "sample-mkt-1",
    templateId: "editorial",
    category: "Marketing",
    isPublic: true,
    slug: null,
    jobDescription: "",
    updatedAt: stamp,
    data: {
      fontId: "sans",
      typeSize: 10,
      spacing: 10,
      leading: 1,
      personal: {
        fullName: "Siddharth Rao",
        title: "Growth & Content Lead",
        email: "siddharth.rao@signaldesk.io",
        phone: "+91 98110 22345",
        location: "Remote · Delhi NCR",
        pincode: "110001",
        photoUrl: "",
        linkedin: "linkedin.com/in/siddharthrao",
        github: "",
        website: "siddharthrao.com",
        portfolio: "",
      },
      summary:
        "B2B SaaS growth marketer driving organic acquisition and lifecycle revenue. Built search-led content programs from 0 to 120k monthly visits while keeping payback period under six months.",
      experience: [
        {
          id: "ex-m1",
          role: "Growth & Content Lead",
          company: "Signaldesk",
          location: "Remote",
          start: "05/2021",
          end: "",
          current: true,
          bullets: [
            "Grew non-brand organic traffic 4.2x in 18 months while keeping customer acquisition cost flat.",
            "Launched product-led comparison pages that now drive 31% of qualified inbound demos.",
            "Built an email lifecycle program that lifted trial-to-paid conversion by 11 percentage points.",
          ],
        },
        {
          id: "ex-m2",
          role: "SEO & Content Manager",
          company: "Plotline",
          location: "Gurugram",
          start: "03/2019",
          end: "04/2021",
          current: false,
          bullets: [
            "Scaled blog output from 4 to 14 posts per month without sacrificing quality scores.",
            "Ranked 28 priority keywords in the top three on Google within 12 months.",
          ],
        },
        {
          id: "ex-m3",
          role: "Content Marketing Associate",
          company: "Brightlane",
          location: "Delhi NCR",
          start: "07/2017",
          end: "02/2019",
          current: false,
          bullets: [
            "Owned social and newsletter channels reaching 45k subscribers.",
            "Introduced editorial calendar tooling that cut approval cycles by 40%.",
          ],
        },
      ],
      education: [
        {
          id: "ed-m1",
          degree: "BA (Hons) Economics",
          school: "University of Delhi",
          year: "2017",
          detail: "Minor in statistics",
        },
        {
          id: "ed-m2",
          degree: "Higher Secondary",
          school: "Delhi Public School, R.K. Puram",
          year: "2014",
          detail: "",
        },
      ],
      skills: {
        industry: ["Technical SEO", "Content Strategy", "Lifecycle Email", "Demand Generation", "Product marketing"],
        tools: ["GA4", "Search Console", "Ahrefs", "HubSpot", "Semrush", "Webflow"],
        other: ["Copywriting", "SQL", "A/B testing"],
      },
      extras: [
        {
          id: "ex-mkt-x1",
          title: "Certifications",
          items: ["HubSpot Inbound Marketing, 2022", "Google Analytics Individual Qualification, 2021"],
        },
        {
          id: "ex-mkt-x2",
          title: "Languages",
          items: ["English — fluent", "Hindi — native"],
        },
        {
          id: "ex-mkt-x3",
          title: "Speaking",
          items: ["Growth Engage India 2023 — SEO panel", "Newsletter: Signal Weekly — 4.2k subs"],
        },
      ],
    },
  },
];