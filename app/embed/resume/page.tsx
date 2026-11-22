"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResumeSheet } from "@/components/ResumeSheet";
import { sampleForTemplate } from "@/lib/content";
import { heroSampleData, heroShowcaseSlides } from "@/lib/heroShowcase";
import { readTemplateId, type TemplateId } from "@/lib/types";

function EmbedResumeBody() {
  const search = useSearchParams();
  const heroParam = search.get("hero");
  const templateParam = search.get("template");
  const mode = search.get("mode") ?? "gallery";

  let templateId: TemplateId = "mint";
  let data = sampleForTemplate("mint");

  if (heroParam !== null && heroParam !== "") {
    const slides = heroShowcaseSlides();
    const index = Math.min(Math.max(Number(heroParam) || 0, 0), slides.length - 1);
    const slide = slides[index] ?? slides[0];
    templateId = slide.templateId;
    data = slide.data;
  } else {
    templateId = readTemplateId(templateParam ?? undefined);
    if (mode === "hero") {
      data = heroSampleData(templateId) ?? sampleForTemplate(templateId);
    } else {
      data = sampleForTemplate(templateId);
    }
  }

  return <ResumeSheet templateId={templateId} data={data} preview fill />;
}

export default function EmbedResumePage() {
  return (
    <Suspense fallback={null}>
      <EmbedResumeBody />
    </Suspense>
  );
}