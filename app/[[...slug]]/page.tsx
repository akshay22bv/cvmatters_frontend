import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/components/AboutPage";
import { ContactPage } from "@/components/ContactPage";
import { HomeJsonLd } from "@/components/HomeJsonLd";
import { PublicCvShell } from "@/components/PublicCvShell";
import { metadataForPath } from "@/lib/seo";
import { pathToView } from "@/lib/paths";
import type { ResumeRecord } from "@/lib/types";

type PageProps = { params: Promise<{ slug?: string[] }> };

async function lookupPublicResume(slug: string): Promise<{ status: "found"; record: ResumeRecord } | { status: "missing" } | { status: "error" }> {
  const origin = process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000";
  try {
    const response = await fetch(`${origin}/api/resumes/${encodeURIComponent(slug)}/public`, {
      cache: "no-store",
    });
    if (response.status === 404) return { status: "missing" };
    if (!response.ok) return { status: "error" };
    const record = (await response.json()) as ResumeRecord;
    return { status: "found", record };
  } catch {
    return { status: "error" };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = `/${(slug || []).join("/")}`.replace(/\/+$/, "") || "/";
  return metadataForPath(path);
}

/**
 * Interactive SPA routes (/, /start, /cv/*, /examples, /profile) are mounted by
 * AppShell in RootLayout so /cv/* navigation never remounts. Standalone pages
 * (/about, /contact, /:username) render here and unknown URLs return a real 404.
 */
export default async function AppPage({ params }: PageProps) {
  const { slug } = await params;
  const path = `/${(slug || []).join("/")}`.replace(/\/+$/, "") || "/";
  const view = pathToView(path);

  if (view.kind === "not-found") {
    notFound();
  }

  if (view.kind === "about") {
    return <AboutPage />;
  }

  if (view.kind === "contact") {
    return <ContactPage />;
  }

  if (view.kind === "public") {
    const looked = await lookupPublicResume(view.id);
    if (looked.status === "missing") {
      notFound();
    }
    return <PublicCvShell id={view.id} initialRecord={looked.status === "found" ? looked.record : null} />;
  }

  if (view.kind === "start" || view.kind === "begin") {
    return <HomeJsonLd />;
  }

  return null;
}
