"use client";

import { AreaField } from "./Field";
import { StepCard } from "./StepCard";
import { Spark } from "./icons";
import { resumePlainText } from "@/lib/content";
import { keywords } from "@/lib/keywords";
import type { ResumeData } from "@/lib/types";

/**
 * The feature the whole builder is for: put a posting in, get a resume that
 * answers it. One field takes either the text or its link — pasting a URL is
 * the same gesture as pasting the post, so asking which it is only adds a step.
 */
export function JobStep({
  data,
  jobDescription,
  onJob,
  onAdjust,
  adjusting,
  onSeeField,
}: {
  data: ResumeData;
  jobDescription: string;
  onJob: (value: string) => void;
  onAdjust: (text: string) => void;
  adjusting: boolean;
  onSeeField?: () => void;
}) {
  const value = jobDescription.trim();

  const found = keywords(jobDescription);
  const resume = resumePlainText(data);
  const matched = found.filter((word) => resume.includes(word));
  const missing = found.filter((word) => !resume.includes(word));
  const score = found.length ? Math.round((matched.length / found.length) * 100) : 0;

  return (
    <>
      <StepCard title="Which job are you going for?" grid={false} plain>
        <AreaField
          label="Job posting"
          value={jobDescription}
          placeholder="Paste the job post or a link"
          minHeight={150}
          onChange={onJob}
        />

        <div className="job-acts">
          <button type="button" className="btn-cta" disabled={adjusting || !value} onClick={() => onAdjust(value)}>
            <Spark />
            {adjusting ? "Rewriting your CV…" : "Rewrite my CV for this job"}
          </button>
          {onSeeField ? (
            <button type="button" className="btn" onClick={onSeeField}>
              See resumes in your field
            </button>
          ) : null}
        </div>
      </StepCard>

      {found.length > 0 && (
        <StepCard
          title="Match score"
          sub={`${matched.length} of ${found.length} words from the posting already appear in your resume.`}
          grid={false}
          aside={<span className="score">{score}%</span>}
        >
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${score}%` }} />
          </div>

          {missing.length > 0 && (
            <div className="chip-group">
              <p className="chip-label">Worth working in</p>
              <div className="chips">
                {missing.map((word) => (
                  <span key={word} className="chip">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {matched.length > 0 && (
            <div className="chip-group">
              <p className="chip-label">Already covered</p>
              <div className="chips">
                {matched.map((word) => (
                  <span key={word} className="chip on">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </StepCard>
      )}
    </>
  );
}
