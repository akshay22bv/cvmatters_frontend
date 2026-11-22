"use client";

import Link from "next/link";
import { ResumeSheet } from "./ResumeSheet";
import { SAMPLE_EXAMPLES } from "@/lib/examples";
import { templateName } from "@/lib/types";

export function LandingProofSamples() {
  return (
    <div className="board-proof-samples" role="list" aria-label="Anonymized resume previews">
      {SAMPLE_EXAMPLES.slice(0, 3).map((sample) => (
        <Link key={sample.id} href="/examples" className="board-proof-sample" role="listitem">
          <span className="board-proof-paper" aria-hidden="true">
            <ResumeSheet templateId={sample.templateId} data={sample.data} preview fill />
          </span>
          <span className="board-proof-meta">
            <strong>{sample.data.personal.title}</strong>
            <span>
              {sample.category} · {templateName(sample.templateId)}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}