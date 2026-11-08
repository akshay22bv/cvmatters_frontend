"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExamplesStep } from "./ExamplesStep";
import { CvMobileChrome, CvSectionRail } from "./CvChrome";
import { ResumeView } from "./ResumeSheet";
import { IconChevronLeft, Pencil } from "./icons";
import { Stars } from "./Stars";
import { ApiError, rateResume } from "@/lib/api";
import {
  templateName,
  type Category,
  type PanelId,
  type ResumeData,
  type ResumeRecord,
  type RatingSummary,
} from "@/lib/types";
import type { AccountState } from "@/lib/useAccount";

/**
 * Standalone “CV examples” experience: same list + preview layout as before, but
 * reached from /examples (rail link) instead of a builder step.
 */
export function ExamplesBrowsePage({
  panel,
  data,
  jobDescription,
  mineId,
  category,
  account,
  onPanel,
  downloading = false,
  onDownload,
  onTemplate,
}: {
  panel: PanelId | null;
  data: ResumeData;
  jobDescription: string;
  mineId: string | null;
  category: Category;
  account: AccountState;
  onPanel: (id: PanelId) => void;
  downloading?: boolean;
  onDownload?: () => void;
  onTemplate?: () => void;
}) {
  const router = useRouter();
  const [viewing, setViewing] = useState<ResumeRecord | null>(null);
  const [rated, setRated] = useState<{ id: string; summary: RatingSummary } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [rateBusy, setRateBusy] = useState(false);
  const [rateHint, setRateHint] = useState("");

  const stageRecord = viewing;
  const sharedPreview = previewOpen && stageRecord ? stageRecord : null;
  const sharedOwn = Boolean(stageRecord && (stageRecord.isMine || stageRecord.id === mineId));

  const rateShared = async (resume: ResumeRecord, stars: number) => {
    if (!account.user) {
      setRateHint("Download a PDF to sign in, then you can rate.");
      return;
    }
    setRateBusy(true);
    setRateHint("");
    try {
      const summary = await rateResume(resume.id, stars, "");
      const next = { ...resume, rating: summary };
      setViewing(next);
      const payload = { id: resume.id, summary };
      setRated(payload);
    } catch (error) {
      if (error instanceof ApiError && error.needsSignIn) setRateHint("Download a PDF to sign in, then you can rate.");
      else setRateHint(error instanceof Error ? error.message : "Couldn't save that rating.");
    } finally {
      setRateBusy(false);
    }
  };

  return (
    <div className="cv-editor-shell">
      <CvSectionRail panel={panel} data={data} jobDescription={jobDescription} onPanel={onPanel} examplesActive />
      <div className="layout">
        <main className="work">
          <CvMobileChrome
            panel={panel}
            downloading={downloading}
            onPreview={() => {
              if (viewing) setPreviewOpen(true);
            }}
            onDownload={() => onDownload?.()}
            onOpenDesign={() => onTemplate?.()}
          />
          <div className="work-scroll">
            <div className="work-inner">
              <ExamplesStep
                mineId={mineId}
                account={account}
                suggest={category}
                rated={rated}
                onView={(resume) => {
                  setViewing(resume);
                  setRateHint("");
                }}
                onOpen={(resume) => {
                  setViewing(resume);
                  setRateHint("");
                  if (window.matchMedia("(max-width: 860px)").matches) setPreviewOpen(true);
                }}
              />
            </div>
          </div>
        </main>

        <aside className="look">
          <div className="look-sheet">
            {stageRecord && (
              <div className="look-rate">
                <div className="look-rate-who">
                  <strong>{stageRecord.data.personal.fullName || "Shared resume"}</strong>
                  <span>
                    {templateName(stageRecord.templateId)}
                    {stageRecord.rating?.count
                      ? ` · ${stageRecord.rating.average.toFixed(1)} (${stageRecord.rating.count})`
                      : ""}
                  </span>
                </div>
                {!sharedOwn ? (
                  <Stars
                    value={stageRecord.rating?.mine || 0}
                    size={15}
                    label={`Rate ${stageRecord.data.personal.fullName || "this resume"}`}
                    onRate={(stars) => {
                      if (!rateBusy) void rateShared(stageRecord, stars);
                    }}
                  />
                ) : (
                  <Stars value={stageRecord.rating?.average || 0} count={stageRecord.rating?.count || 0} size={13} />
                )}
                {rateHint ? <p className="look-rate-hint">{rateHint}</p> : null}
              </div>
            )}
            <div className="look-paper" key={stageRecord ? stageRecord.id : "examples-placeholder"}>
              {stageRecord ? (
                <ResumeView templateId={stageRecord.templateId} data={stageRecord.data} hideContact />
              ) : (
                <p className="fld-note" style={{ margin: "28px 8px" }}>
                  Pick a resume on the left to preview it here.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {previewOpen && sharedPreview && (
        <div
          className="preview-sheet"
          role="dialog"
          aria-label={`${sharedPreview.data.personal.fullName || "Shared"} resume`}
        >
          <div className="preview-sheet-top">
            <button type="button" className="preview-sheet-icon preview-sheet-back" aria-label="Close preview" onClick={() => setPreviewOpen(false)}>
              <IconChevronLeft />
            </button>
            <button
              type="button"
              className="preview-sheet-icon"
              aria-label="Edit my CV"
              onClick={() => {
                setPreviewOpen(false);
                router.push("/cv/details");
              }}
            >
              <Pencil />
            </button>
          </div>
          {!sharedOwn ? (
            <div className="preview-rate">
              <Stars
                value={sharedPreview.rating?.mine || 0}
                size={16}
                label={`Rate ${sharedPreview.data.personal.fullName || "this resume"}`}
                onRate={(stars) => {
                  if (!rateBusy) void rateShared(sharedPreview, stars);
                }}
              />
              {sharedPreview.rating?.count ? (
                <span>
                  {sharedPreview.rating.average.toFixed(1)} ({sharedPreview.rating.count})
                </span>
              ) : null}
              {rateHint ? <p className="look-rate-hint">{rateHint}</p> : null}
            </div>
          ) : null}
          <div className="preview-sheet-body">
            <ResumeView templateId={sharedPreview.templateId} data={sharedPreview.data} hideContact />
          </div>
        </div>
      )}
    </div>
  );
}
