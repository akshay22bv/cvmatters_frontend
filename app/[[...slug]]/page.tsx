import type { Metadata } from "next";
import { HomeJsonLd } from "@/components/HomeJsonLd";
import { metadataForPath } from "@/lib/seo";
import { pathToView } from "@/lib/paths";

type PageProps = { params: Promise<{ slug?: string[] }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = `/${(slug || []).join("/")}`.replace(/\/+$/, "") || "/";
  return metadataForPath(path);
}

/** Route shell only — the builder lives in the root layout so it stays mounted. */
export default async function AppPage({ params }: PageProps) {
  const { slug } = await params;
  const path = `/${(slug || []).join("/")}`.replace(/\/+$/, "") || "/";
  const view = pathToView(path);
  if (view.kind === "start" || view.kind === "begin") {
    return <HomeJsonLd />;
  }
  return null;
}
