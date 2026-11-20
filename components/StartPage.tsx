"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadScreen } from "./LoadScreen";
import { IconChevronLeft, IconChevronRight, IconCreate, IconDrop, IconLinkedinBrand, IconUpload } from "./icons";
import { Reveal } from "./motion";
import { parseLinkedin } from "@/lib/linkedin";
import { startPath, type StartIntent, type StartStep } from "@/lib/paths";
import { templateName, type TemplateId } from "@/lib/types";

const ASK_TITLE: Record<StartIntent, string> = {
  build: "Build your CV",
  job: "Match a job",
  field: "Resumes in your field",
};

/**
 * Dedicated start navigation page — blank, upload, or LinkedIn — with its own URL.
 */
export function StartPage({
  intent,
  step,
  templateId,
  owned = false,
  busy = false,
  busyLabel = "",
  error = "",
  onCreate,
  onUpload,
  onLinkedin,
}: {
  intent: StartIntent;
  step: StartStep;
  templateId: TemplateId;
  owned?: boolean;
  busy?: boolean;
  busyLabel?: string;
  error?: string;
  onCreate: (intent: StartIntent, templateId: TemplateId) => void;
  onUpload: (file: File, intent: StartIntent, templateId: TemplateId) => void;
  onLinkedin: (url: string, name: string, intent: StartIntent, templateId: TemplateId) => void;
}) {
  const router = useRouter();
  const layout = templateId || "mint";
  const [dragging, setDragging] = useState(false);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  const openStep = (next: StartStep) => {
    setLinkError("");
    router.push(startPath(next, intent));
  };

  const title = useMemo(() => {
    if (step === "upload") return "Upload your CV";
    if (step === "linkedin") return "Import from LinkedIn";
    return "How should this start?";
  }, [step]);

  const lead = useMemo(() => {
    if (step === "upload") {
      return `Drop the file. The sections come out of it, then this opens ${
        intent === "job" ? "the job post" : intent === "field" ? "resumes in your field" : "the editor"
      }.`;
    }
    if (step === "linkedin") return "A profile link opens a draft with your name on it.";
    return owned
      ? "This replaces the CV you have now. A blank page, a file you already have, or a LinkedIn profile."
      : "A blank page, a file you already have, or a LinkedIn profile.";
  }, [step, intent, owned]);

  return (
    <div className="board board-start-page" aria-busy={busy || undefined}>
      {busy ? <LoadScreen message={busyLabel || "Starting your CV…"} variant="overlay" /> : null}
      <section className="board-ask is-page" aria-labelledby="board-ask-title">
        <div className="board-rail board-ask-inner">
          <div className={step === "choose" ? "board-ask-stage is-wide" : "board-ask-stage is-form"}>
            <header className="board-ask-hero">
              {step !== "choose" ? (
                <button type="button" className="board-ask-back" onClick={() => openStep("choose")}>
                  <IconChevronLeft />
                  Back
                </button>
              ) : null}
              <p className="board-kicker">{ASK_TITLE[intent]}</p>
              <h1 id="board-ask-title">{title}</h1>
              <p className="board-lead board-ask-lead">{lead}</p>
            </header>

            <div className="board-ask-body">
              <div className="board-ask-panel">
                {step === "choose" && (
                  <>
                    <div className="board-ask-cards">
                      <Reveal className="board-ask-card-wrap" delay={40} blur={false}>
                        <button type="button" className="board-ask-card" disabled={busy} onClick={() => onCreate(intent, layout)}>
                          <span className="board-ico">
                            <IconCreate />
                          </span>
                          <span className="board-ask-copy">
                            <strong>Create a new CV</strong>
                            <span>Start from an empty page in {templateName(layout)}.</span>
                          </span>
                          <span className="board-ask-go" aria-hidden="true">
                            Start blank <IconChevronRight />
                          </span>
                        </button>
                      </Reveal>
                      <Reveal className="board-ask-card-wrap" delay={90} blur={false}>
                        <button type="button" className="board-ask-card" disabled={busy} onClick={() => openStep("upload")}>
                          <span className="board-ico">
                            <IconUpload />
                          </span>
                          <span className="board-ask-copy">
                            <strong>Upload an existing CV</strong>
                            <span>PDF, DOCX, or TXT. We read the sections out of the file.</span>
                          </span>
                          <span className="board-ask-go" aria-hidden="true">
                            Upload file <IconChevronRight />
                          </span>
                        </button>
                      </Reveal>
                      <Reveal className="board-ask-card-wrap" delay={140} blur={false}>
                        <button type="button" className="board-ask-card" disabled={busy} onClick={() => openStep("linkedin")}>
                          <span className="board-ico is-brand">
                            <IconLinkedinBrand />
                          </span>
                          <span className="board-ask-copy">
                            <strong>Import from LinkedIn</strong>
                            <span>Paste a linkedin.com/in/… link. Your name goes on the page.</span>
                          </span>
                          <span className="board-ask-go" aria-hidden="true">
                            Import link <IconChevronRight />
                          </span>
                        </button>
                      </Reveal>
                    </div>
                  </>
                )}

                {step === "upload" && (
                  <>
                    <label
                      className={dragging ? "board-drop is-drag" : "board-drop"}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        const file = event.dataTransfer.files?.[0];
                        if (file) onUpload(file, intent, layout);
                      }}
                    >
                      <IconDrop />
                      <strong>Click to upload</strong>
                      <span>or drag and drop · PDF, DOCX, or TXT · up to 4 MB</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt,application/pdf"
                        disabled={busy}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (file) onUpload(file, intent, layout);
                        }}
                      />
                    </label>
                    <aside className="board-ask-hints" aria-label="Upload tips">
                      <p>
                        <strong>What we read</strong> — headings, experience, education, and skills when the file is structured. You can
                        fix anything in the editor after import.
                      </p>
                    </aside>
                  </>
                )}

                {step === "linkedin" && (
                  <>
                    <form
                      className="board-link-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const parsed = parseLinkedin(link);
                        if ("error" in parsed && parsed.error) {
                          setLinkError(parsed.error);
                          return;
                        }
                        if ("url" in parsed && parsed.url && parsed.name) {
                          setLinkError("");
                          onLinkedin(parsed.url, parsed.name, intent, layout);
                        }
                      }}
                    >
                      <div className="board-link-form-head">
                        <span className="board-ico is-brand" aria-hidden="true">
                          <IconLinkedinBrand />
                        </span>
                        <div className="board-link-form-intro">
                          <strong>LinkedIn profile link</strong>
                          <span>
                            Use your public <em>linkedin.com/in/…</em> URL — we add your name; you complete the CV in the editor.
                          </span>
                        </div>
                      </div>
                      <div className="board-link-form-row">
                        <label className="board-link-field">
                          <span className="sr-only">Profile link</span>
                          <input
                            value={link}
                            autoFocus
                            placeholder="https://www.linkedin.com/in/your-name"
                            disabled={busy}
                            onChange={(event) => setLink(event.target.value)}
                          />
                        </label>
                        <button type="submit" className="board-pill board-pill-primary board-link-submit" disabled={busy}>
                          <span className="board-pill-label">Continue</span>
                          <span className="board-pill-icon" aria-hidden="true">
                            <IconChevronRight />
                          </span>
                        </button>
                      </div>
                    </form>
                    {linkError ? <p className="banner">{linkError}</p> : null}
                    <p className="board-ask-alt">
                      Prefer a file instead?{" "}
                      <Link href={startPath("upload", intent)} className="board-ask-alt-link">
                        Upload a CV
                      </Link>
                      {" · "}
                      <Link href={startPath("choose", intent)} className="board-ask-alt-link">
                        Start blank
                      </Link>
                    </p>
                  </>
                )}

                {busy && busyLabel ? <p className="board-note">{busyLabel}</p> : null}
                {error ? <p className="banner">{error}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
