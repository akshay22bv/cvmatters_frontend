import { sampleForTemplate, sampleResume } from "./content";
import type { ResumeData, TemplateId } from "./types";

/** Match the editor default — balanced line height and section spacing on one A4 page. */
const HERO_PAGE: Pick<ResumeData, "typeSize" | "spacing" | "leading"> = {
  typeSize: 10,
  spacing: 10,
  leading: 1,
};

const HERO_SLIDES_SPEC: { templateId: TemplateId; data: ResumeData }[] = [
  {
    templateId: "mint",
    data: sampleResume("Product Designer"),
  },
  {
    templateId: "formal",
    data: {
      fontId: "libre",
      ...HERO_PAGE,
      personal: {
        fullName: "Rohan Kulkarni",
        title: "Senior Full-Stack Engineer",
        email: "rohan.kulkarni@clearledger.io",
        phone: "+91 98765 43210",
        location: "Pune, India",
        pincode: "411001",
        photoUrl: "",
        linkedin: "linkedin.com/in/rohankulkarni",
        github: "github.com/rohankulkarni",
        website: "rohan.dev",
        portfolio: "",
      },
      summary:
        "Full-stack engineer specializing in TypeScript, Node.js, and PostgreSQL. Track record of shipping reliable billing, search, and low-latency web apps used by thousands of businesses daily.",
      experience: [
        {
          id: "hero-formal-1",
          role: "Senior Software Engineer",
          company: "Clearledger",
          location: "Pune",
          start: "06/2021",
          end: "",
          current: true,
          bullets: [
            "Architected an idempotent webhook and invoicing pipeline processing 180k monthly transactions at 99.98% uptime.",
            "Reduced P95 search latency from 620ms to 95ms through PostgreSQL indexing and query caching.",
            "Mentored three engineers on API design, observability, and safe database migrations.",
          ],
        },
        {
          id: "hero-formal-2",
          role: "Software Engineer",
          company: "Kestrel Systems",
          location: "Hyderabad",
          start: "07/2019",
          end: "05/2021",
          current: false,
          bullets: [
            "Built React + TypeScript analytics dashboards serving 35k daily active users.",
            "Introduced end-to-end CI checks that halved post-release hotfixes.",
          ],
        },
        {
          id: "hero-formal-3",
          role: "Backend Developer",
          company: "Bytecraft Labs",
          location: "Pune",
          start: "06/2017",
          end: "06/2019",
          current: false,
          bullets: [
            "Maintained REST APIs in Node.js and documented OpenAPI specs for partner integrations.",
            "Cut deployment time from 45 minutes to 12 with Docker and GitHub Actions.",
          ],
        },
      ],
      education: [
        {
          id: "hero-formal-ed1",
          degree: "BTech in Computer Science",
          school: "COEP Technological University",
          year: "2017",
          detail: "First class with distinction",
        },
        {
          id: "hero-formal-ed2",
          degree: "Higher Secondary (PCM)",
          school: "Fergusson College",
          year: "2013",
          detail: "99.2 percentile in Maharashtra CET",
        },
      ],
      skills: {
        industry: ["System Design", "REST APIs", "Distributed Systems", "Event-driven architecture"],
        tools: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker"],
        other: ["AWS", "Redis", "Kafka", "GraphQL"],
      },
      extras: [
        {
          id: "hero-formal-x1",
          title: "Certifications",
          items: ["AWS Solutions Architect Associate, 2023", "PostgreSQL Professional, 2022"],
        },
        {
          id: "hero-formal-x2",
          title: "Open source",
          items: ["pg-migrate-kit — 2.1k GitHub stars", "Contributed to Vitest and Prisma docs"],
        },
        {
          id: "hero-formal-x3",
          title: "Languages",
          items: ["English — fluent", "Marathi — native", "Hindi — fluent"],
        },
        {
          id: "hero-formal-x4",
          title: "Projects",
          items: ["Clearledger billing platform — 180k tx/month", "Kestrel analytics — 35k DAU"],
        },
        {
          id: "hero-formal-x5",
          title: "Interests",
          items: ["Rust experiments", "Trail running", "Mechanical keyboards"],
        },
      ],
    },
  },
  {
    templateId: "slate",
    data: {
      fontId: "sans",
      ...HERO_PAGE,
      personal: {
        fullName: "Meera Nair",
        title: "Product Manager",
        email: "meera.nair@paybridge.in",
        phone: "+91 98123 45678",
        location: "Mumbai, India",
        pincode: "400001",
        photoUrl: "",
        linkedin: "linkedin.com/in/meeranair",
        github: "",
        website: "meeranair.pm",
        portfolio: "",
      },
      summary:
        "Product manager focused on fintech checkout and activation loops. Combines funnel analytics with rapid user discovery to grow conversion, retention, and revenue on mobile-first products.",
      experience: [
        {
          id: "hero-slate-1",
          role: "Product Manager — Checkout",
          company: "Paybridge",
          location: "Mumbai",
          start: "02/2022",
          end: "",
          current: true,
          bullets: [
            "Increased mobile checkout completion by 14% by streamlining UPI intent and fallback card flows.",
            "Partnered with 6 engineers and 2 designers to launch saved payment methods in 8 weeks.",
            "Defined success metrics and dashboards used in weekly leadership reviews.",
          ],
        },
        {
          id: "hero-slate-2",
          role: "Associate Product Manager",
          company: "Cartloom",
          location: "Bengaluru",
          start: "08/2019",
          end: "01/2022",
          current: false,
          bullets: [
            "Defined activation metrics and shipped guided onboarding, lifting 30-day retention by 9 points.",
            "Ran 40+ customer calls per quarter to prioritize the roadmap for a 2M-user marketplace.",
          ],
        },
        {
          id: "hero-slate-3",
          role: "Business Analyst",
          company: "Finroute",
          location: "Mumbai",
          start: "07/2017",
          end: "07/2019",
          current: false,
          bullets: [
            "Translated regulatory requirements into product specs for KYC and payout flows.",
            "Built SQL reports that cut manual reconciliation time by 60%.",
          ],
        },
      ],
      education: [
        {
          id: "hero-slate-ed1",
          degree: "MBA in Strategy & Product",
          school: "SPJIMR Mumbai",
          year: "2019",
          detail: "Product & analytics electives",
        },
        {
          id: "hero-slate-ed2",
          degree: "BCom (Honours)",
          school: "HR College of Commerce",
          year: "2015",
          detail: "",
        },
      ],
      skills: {
        industry: ["Product Strategy", "A/B Experimentation", "Funnel Analytics", "Roadmapping", "Payments"],
        tools: ["SQL", "Mixpanel", "Amplitude", "Figma", "Jira", "Notion"],
        other: ["UPI", "B2C Growth", "Stakeholder management"],
      },
      extras: [
        {
          id: "hero-slate-x1",
          title: "Certifications",
          items: ["Pragmatic Institute Certified, 2021", "Reforge Growth Series, 2020"],
        },
        {
          id: "hero-slate-x2",
          title: "Languages",
          items: ["English — fluent", "Malayalam — native", "Hindi — conversational"],
        },
        {
          id: "hero-slate-x3",
          title: "Volunteering",
          items: ["Mentor at Product Guild Mumbai", "Pro-bono PM for two NGO payment pilots"],
        },
        {
          id: "hero-slate-x4",
          title: "Projects",
          items: ["Paybridge checkout redesign", "Cartloom onboarding playbook"],
        },
        {
          id: "hero-slate-x5",
          title: "Interests",
          items: ["Chess", "Carnatic music", "Weekend cycling"],
        },
      ],
    },
  },
  {
    templateId: "editorial",
    data: {
      fontId: "sans",
      ...HERO_PAGE,
      personal: {
        fullName: "Ananya Verma",
        title: "Senior Product Designer",
        email: "ananya.verma@design.io",
        phone: "+91 99887 76655",
        location: "Bengaluru, India",
        pincode: "560034",
        photoUrl: "",
        linkedin: "linkedin.com/in/ananyaverma",
        github: "github.com/ananyaverma",
        website: "ananyaverma.com",
        portfolio: "behance.net/ananyaverma",
      },
      summary:
        "Product designer with 7+ years building design systems and B2B workflows. Focused on simplifying dense operational tools into clear, fast interfaces that teams adopt without training.",
      experience: [
        {
          id: "hero-ed-1",
          role: "Senior Product Designer",
          company: "Northwind Cloud",
          location: "Bengaluru",
          start: "04/2022",
          end: "",
          current: true,
          bullets: [
            "Led a 40-component design system adopted across 4 web products, cutting UI QA regressions by 38%.",
            "Redesigned self-serve onboarding with product and engineering, lifting week-1 activation from 41% to 63%.",
            "Facilitated design sprints with sales and CS to align roadmap with customer pain points.",
          ],
        },
        {
          id: "hero-ed-2",
          role: "Product Designer",
          company: "Fieldnote Labs",
          location: "Remote",
          start: "01/2020",
          end: "03/2022",
          current: false,
          bullets: [
            "Owned core planning and reporting screens used weekly by 12,000+ small business teams.",
            "Ran 50+ customer interviews to reshape mobile navigation and reduce drop-off.",
          ],
        },
        {
          id: "hero-ed-3",
          role: "UI Designer",
          company: "Studio Kite",
          location: "Bengaluru",
          start: "06/2018",
          end: "12/2019",
          current: false,
          bullets: [
            "Delivered marketing sites and product UI for three funded startups.",
            "Introduced a shared Figma library that shortened handoff cycles by a third.",
          ],
        },
      ],
      education: [
        {
          id: "hero-ed-ed1",
          degree: "BDes in Communication Design",
          school: "National Institute of Design",
          year: "2018",
          detail: "Graduated with distinction",
        },
        {
          id: "hero-ed-ed2",
          degree: "Foundation in Design",
          school: "Srishti Institute",
          year: "2014",
          detail: "",
        },
      ],
      skills: {
        industry: ["Product Design", "Design Systems", "User Research", "Information Architecture"],
        tools: ["Figma", "Prototyping", "FigJam", "After Effects"],
        other: ["HTML", "CSS", "Accessibility (WCAG)"],
      },
      extras: [
        {
          id: "hero-ed-x1",
          title: "Certifications",
          items: ["IDEO U Design Thinking, 2020", "IxDF UI Design Certificate, 2019"],
        },
        {
          id: "hero-ed-x2",
          title: "Speaking",
          items: ["Design Systems India 2024 — panelist", "Bengaluru UX Meetup — talk on B2B onboarding"],
        },
        {
          id: "hero-ed-x3",
          title: "Interests",
          items: ["Letterpress", "City sketching", "Weekend trekking"],
        },
        {
          id: "hero-ed-x4",
          title: "Projects",
          items: ["Northwind Cloud design system", "Fieldnote Labs mobile navigation"],
        },
        {
          id: "hero-ed-x5",
          title: "Awards",
          items: ["Week-1 activation uplift — Northwind", "UI QA regressions down 38%"],
        },
        {
          id: "hero-ed-x6",
          title: "Languages",
          items: ["English — fluent", "Hindi — fluent", "Konkani — conversational"],
        },
      ],
    },
  },
];

function copyResume(data: ResumeData): ResumeData {
  return {
    ...data,
    personal: { ...data.personal },
    experience: data.experience.map((job) => ({ ...job, bullets: [...job.bullets] })),
    education: data.education.map((item) => ({ ...item })),
    skills: {
      industry: [...data.skills.industry],
      tools: [...data.skills.tools],
      other: [...data.skills.other],
    },
    extras: (data.extras || []).map((extra) => ({ ...extra, items: [...extra.items] })),
  };
}

let cachedSlides: { templateId: TemplateId; data: ResumeData }[] | null = null;

/** Rich, recruiter-style sample pages for the landing hero (contact lines, roles, skills). */
export function heroShowcaseSlides(): { templateId: TemplateId; data: ResumeData }[] {
  if (cachedSlides) return cachedSlides;
  cachedSlides = HERO_SLIDES_SPEC.map(({ templateId, data }) => {
    const portrait = sampleForTemplate(templateId, data.personal.title);
    const next = copyResume(data);
    next.personal.photoUrl = portrait.personal.photoUrl;
    return { templateId, data: next };
  });
  return cachedSlides;
}

/** Resume body for a hero / gallery template id (same copy as the landing carousel). */
export function heroSampleData(templateId: TemplateId): ResumeData | undefined {
  return heroShowcaseSlides().find((slide) => slide.templateId === templateId)?.data;
}