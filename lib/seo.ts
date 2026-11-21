import type { Metadata } from "next";
import { pathToView, publicResumePath, SECTION_LABEL, type AppView } from "./paths";
import {
  buildPublicResumeDescription,
  hasPublicResumeContent,
  type PublicResumeDataLike,
} from "./publicResume";
import { DEFAULT_DESCRIPTION, OG_IMAGE_PATH, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, siteUrl } from "./site";

const NO_INDEX: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

type PublicResumeMeta = {
  slug?: string;
  updatedAt?: string;
  data?: PublicResumeDataLike;
};

async function fetchPublicResume(slug: string): Promise<PublicResumeMeta | null> {
  const origin = process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000";
  try {
    const response = await fetch(`${origin}/api/resumes/${encodeURIComponent(slug)}/public`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function titleTemplate(page: string) {
  return `${page} · ${SITE_NAME}`;
}

function openGraph(partial: NonNullable<Metadata["openGraph"]>): NonNullable<Metadata["openGraph"]> {
  return {
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    ...partial,
  };
}

function baseMeta(input: {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
  imageUrl?: string;
  imageAlt?: string;
  ogType?: "website" | "profile";
}): Metadata {
  const url = siteUrl(input.path);
  const ogImage = input.imageUrl || siteUrl(OG_IMAGE_PATH);
  const ogAlt = input.imageAlt || input.title;
  return {
    // Use `absolute` so RootLayout's `title.template` (`%s · CV Matters`) never doubles the suffix.
    title: { absolute: input.title },
    description: input.description,
    keywords: SITE_KEYWORDS,
    alternates: { canonical: url },
    robots: input.robots ?? { index: true, follow: true },
    openGraph: openGraph({
      type: input.ogType ?? "website",
      title: input.title,
      description: input.description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }],
    }),
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
  };
}

async function metadataForView(view: AppView, pathname: string): Promise<Metadata> {
  if (view.kind === "start") {
    const title = `${SITE_NAME} — Resume builder & job-matched CV editor`;
    return baseMeta({
      title,
      description: DEFAULT_DESCRIPTION,
      path: "/",
    });
  }

  if (view.kind === "begin") {
    const stepLabel =
      view.step === "upload" ? "Upload your CV" : view.step === "linkedin" ? "Import from LinkedIn" : "Start your CV";
    return baseMeta({
      title: titleTemplate(stepLabel),
      description:
        "Start a CV blank, upload a PDF or DOCX, or import from LinkedIn. Live preview and ATS-friendly templates on CV Matters.",
      path: pathname,
    });
  }

  if (view.kind === "examples") {
    return baseMeta({
      title: titleTemplate("Resumes in your field"),
      description:
        "Browse shared CV examples by industry. See structure, tone, and skills people use in roles like yours.",
      path: "/examples",
    });
  }

  if (view.kind === "about") {
    return baseMeta({
      title: titleTemplate("About"),
      description:
        "CV Matters is a resume builder with live preview, ATS-friendly templates, job-aware editing, and optional public sharing.",
      path: "/about",
    });
  }

  if (view.kind === "contact") {
    return baseMeta({
      title: titleTemplate("Contact us"),
      description:
        "Get help with CV Matters — product support, billing, privacy requests, and feedback. We typically reply within 1–2 business days.",
      path: "/contact",
    });
  }

  if (view.kind === "not-found") {
    return {
      title: { absolute: titleTemplate("Page not found") },
      description: `That page does not exist on ${SITE_NAME}.`,
      robots: NO_INDEX,
    };
  }

  if (view.kind === "public") {
    const record = await fetchPublicResume(view.id);
    if (!record) {
      return {
        title: { absolute: titleTemplate("Page not found") },
        description: `That resume is private or does not exist on ${SITE_NAME}.`,
        robots: NO_INDEX,
      };
    }

    const path = publicResumePath(view.id);
    // Do not ask Google to index empty / unpublished draft profiles.
    if (!hasPublicResumeContent(record.data)) {
      return baseMeta({
        title: titleTemplate("Resume not published yet"),
        description: `This resume on ${SITE_NAME} hasn't been published yet.`,
        path,
        robots: NO_INDEX,
      });
    }

    const name = record.data?.personal?.fullName?.trim() || view.id;
    const role = record.data?.personal?.title?.trim() || "";
    const pageTitle = role ? `${name} — ${role}` : `${name}'s Resume`;
    const description = buildPublicResumeDescription(record.data, view.id, SITE_NAME);
    const version = record.updatedAt ? `?v=${encodeURIComponent(record.updatedAt.slice(0, 19))}` : "";
    const imageUrl = siteUrl(`/og/cv/${encodeURIComponent(view.id)}${version}`);

    return baseMeta({
      title: titleTemplate(pageTitle),
      description,
      path,
      imageUrl,
      imageAlt: role ? `${name} — ${role}` : `${name}'s Resume`,
      ogType: "profile",
    });
  }

  if (view.kind === "profile") {
    return baseMeta({
      title: titleTemplate("Your profile"),
      description: "Manage your CV Matters account, resumes, and PDF export settings.",
      path: "/profile",
      robots: NO_INDEX,
    });
  }

  if (view.kind === "cv") {
    const section = SECTION_LABEL[view.section] || "Editor";
    return baseMeta({
      title: titleTemplate(`${section} — My CV`),
      description: `${SITE_TAGLINE} Edit the ${section.toLowerCase()} section with a live preview.`,
      path: pathname,
      robots: NO_INDEX,
    });
  }

  return {
    title: { absolute: SITE_NAME },
    description: DEFAULT_DESCRIPTION,
    robots: NO_INDEX,
  };
}

export async function metadataForPath(pathname: string): Promise<Metadata> {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const view = pathToView(normalized);
  return metadataForView(view, normalized);
}
