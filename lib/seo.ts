import type { Metadata } from "next";
import { pathToView, publicResumePath, SECTION_LABEL, type AppView } from "./paths";
import { DEFAULT_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, siteUrl } from "./site";

const NO_INDEX: Metadata["robots"] = { index: false, follow: false };

type PublicResumeMeta = {
  data?: {
    personal?: { fullName?: string; title?: string };
    bio?: string;
  };
};

async function fetchPublicResume(slug: string): Promise<PublicResumeMeta | null> {
  const origin = process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000";
  try {
    const response = await fetch(`${origin}/api/resumes/${encodeURIComponent(slug)}/public`, {
      next: { revalidate: 3600 },
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

function baseMeta(input: { title: string; description: string; path: string; robots?: Metadata["robots"] }): Metadata {
  const url = siteUrl(input.path);
  return {
    title: input.title,
    description: input.description,
    keywords: SITE_KEYWORDS,
    alternates: { canonical: url },
    robots: input.robots ?? { index: true, follow: true },
    openGraph: openGraph({
      title: input.title,
      description: input.description,
      url,
    }),
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}

async function metadataForView(view: AppView, pathname: string): Promise<Metadata> {
  if (view.kind === "start") {
    const title = `${SITE_NAME} — Resume builder & job-matched CV editor`;
    return {
      ...baseMeta({
        title,
        description: DEFAULT_DESCRIPTION,
        path: "/",
      }),
      title: { absolute: title },
    };
  }

  if (view.kind === "examples") {
    return baseMeta({
      title: titleTemplate("Resumes in your field"),
      description: "Browse shared CV examples by industry. See structure, tone, and skills people use in roles like yours.",
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

  if (view.kind === "public") {
    const record = await fetchPublicResume(view.id);
    const name = record?.data?.personal?.fullName?.trim() || view.id;
    const role = record?.data?.personal?.title?.trim();
    const pageTitle = role ? `${name} — ${role}` : `${name}'s resume`;
    const bio = record?.data?.bio?.trim().replace(/\s+/g, " ");
    const description =
      bio && bio.length > 40
        ? bio.slice(0, 160)
        : `Public resume for ${name}${role ? `, ${role}` : ""} on ${SITE_NAME}.`;
    const path = publicResumePath(view.id);
    return baseMeta({
      title: titleTemplate(pageTitle),
      description,
      path,
    });
  }

  if (view.kind === "profile") {
    return {
      ...baseMeta({
        title: titleTemplate("Your profile"),
        description: "Manage your CV Matters account, resumes, and PDF export settings.",
        path: "/profile",
      }),
      robots: NO_INDEX,
    };
  }

  if (view.kind === "cv") {
    const section = SECTION_LABEL[view.section] || "Editor";
    return {
      ...baseMeta({
        title: titleTemplate(`${section} — My CV`),
        description: `${SITE_TAGLINE} Edit the ${section.toLowerCase()} section with a live preview.`,
        path: pathname,
      }),
      robots: NO_INDEX,
    };
  }

  return {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    robots: NO_INDEX,
  };
}

export async function metadataForPath(pathname: string): Promise<Metadata> {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const view = pathToView(normalized);
  return metadataForView(view, normalized);
}
