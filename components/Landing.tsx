"use client";

import { useEffect, useMemo, useState } from "react";
import { LoadScreen } from "./LoadScreen";
import { SiteFooter } from "./SiteFooter";
import { IconChevronLeft, IconChevronRight, IconCreate, IconDrop, IconLinkedinBrand, IconUpload } from "./icons";
import { Reveal, Tilt } from "./motion";
import { ResumeSheet } from "./ResumeSheet";
import { offeredCatalog } from "@/lib/catalog";
import { sampleForTemplate } from "@/lib/content";
import { templateName, type ResumeData, type TemplateId } from "@/lib/types";

export type DashIntent = "build" | "job" | "field";

const ABOUT = [
  {
    title: "Live preview",
    body: "Every field you type shows on the page beside you. No guesswork about how the PDF will look.",
  },
  {
    title: "ATS-ready layouts",
    body: "Single-column templates with standard headings. Easy for hiring software to read.",
  },
  {
    title: "Job-tuned copy",
    body: "Paste a posting to steer your summary and bullets toward what that role asks for.",
  },
] as const;

const ASK_TITLE: Record<DashIntent, string> = {
  build: "Build your CV",
  job: "Match a job",
  field: "Resumes in your field",
};

function parseLinkedin(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return { error: "Paste your LinkedIn profile link." };
  let parsed: URL;
  try {
    parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return { error: "That doesn't look like a link." };
  }
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "linkedin.com") return { error: "Use a linkedin.com profile link." };
  const match = parsed.pathname.match(/\/in\/([^/]+)/i);
  if (!match?.[1]) return { error: "Use a profile link, like linkedin.com/in/your-name." };
  const slug = decodeURIComponent(match[1]).replace(/-+/g, " ").replace(/\d+$/, "").trim();
  const name = slug.replace(/\b\w/g, (letter) => letter.toUpperCase());
  return { url: `https://www.linkedin.com/in/${match[1]}`, name };
}

/**
 * Home: product story, three ways in, templates, and a footer.
 * The CV itself lives in the builder once you start.
 */
export function Landing({
  data,
  templateId,
  busy = false,
  busyLabel = "",
  error = "",
  onOpen,
  onCreate,
  onUpload,
  onLinkedin,
}: {
  data?: ResumeData;
  templateId?: TemplateId;
  busy?: boolean;
  busyLabel?: string;
  error?: string;
  onOpen?: (intent: DashIntent) => void;
  onCreate: (intent: DashIntent, templateId: TemplateId) => void;
  onUpload: (file: File, intent: DashIntent, templateId: TemplateId) => void;
  onLinkedin: (url: string, name: string, intent: DashIntent, templateId: TemplateId) => void;
}) {
  const layout = templateId || "mint";
  const [ask, setAsk] = useState<DashIntent | null>(null);
  const [step, setStep] = useState<"choose" | "upload" | "linkedin">("choose");
  const [dragging, setDragging] = useState(false);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const templates = useMemo(() => offeredCatalog(), []);
  const heroTemplate = templateId || "mint";
  const heroData = data || sampleForTemplate(heroTemplate);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && ask) setAsk(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ask]);

  const owned = !!data;

  const pickIntent = (intent: DashIntent) => {
    if (owned && onOpen) {
      onOpen(intent);
      return;
    }
    setStep("choose");
    setLinkError("");
    setAsk(intent);
  };

  const startWith = (next: TemplateId) => {
    onCreate("build", next);
  };

  return (
    <div className="board" aria-busy={busy || undefined}>
      {busy ? <LoadScreen message={busyLabel || "Starting your CV…"} variant="overlay" /> : null}
      {!ask && error ? <p className="board-flash banner">{error}</p> : null}
      <section className="board-story" aria-label="Home">
        <header className="board-hero">
          <div className="board-hero-glow" aria-hidden="true" />
          <div className="board-rail board-hero-grid">
            <div className="board-hero-copy">
              <p className="board-kicker">Resume builder</p>
              <h1 className="board-brand">CV Matters</h1>
              <p className="board-lead">
                Build a clean CV and tune it to a job post—live preview, ATS-friendly layouts.
              </p>
              <div className="board-cta">
                <button type="button" className="board-pill board-pill-primary" disabled={busy} onClick={() => pickIntent("build")}>
                  <span className="board-pill-label">{owned ? "Open your CV" : "Create my resume"}</span>
                  <span className="board-pill-icon" aria-hidden="true">
                    <IconChevronRight />
                  </span>
                </button>
              </div>
            </div>

            <div className="board-hero-visual">
              <div className="board-hero-stage">
                <div className="board-hero-paper">
                  <ResumeSheet templateId={heroTemplate} data={heroData} preview fill />
                </div>
              </div>
            </div>
          </div>
        </header>

        <article className="board-section board-section-actions" aria-label="More ways to start">
          <div className="board-rail">
            <Reveal className="board-intro" blur={false}>
              <p className="board-kicker">Go further</p>
              <h2 className="board-heading">Tailor to a role or see your industry</h2>
              <p className="board-lead is-narrow">
                Same editor—pick the path that fits what you need next.
              </p>
            </Reveal>
            <div className="board-action-cards">
              <Reveal className="board-action-card" delay={40} blur={false}>
                <h3 className="board-action-title">Match a job</h3>
                <p className="board-action-body">
                  Paste a posting and we steer your summary and experience toward that role.
                </p>
                <button type="button" className="board-pill board-pill-outline" disabled={busy} onClick={() => pickIntent("job")}>
                  <span className="board-pill-label">Continue</span>
                  <span className="board-pill-icon" aria-hidden="true">
                    <IconChevronRight />
                  </span>
                </button>
              </Reveal>
              <Reveal className="board-action-card" delay={100} blur={false}>
                <h3 className="board-action-title">Browse your field</h3>
                <p className="board-action-body">
                  Open shared CVs from people in your line to see tone, structure, and strengths.
                </p>
                <button type="button" className="board-pill board-pill-outline" disabled={busy} onClick={() => pickIntent("field")}>
                  <span className="board-pill-label">Continue</span>
                  <span className="board-pill-icon" aria-hidden="true">
                    <IconChevronRight />
                  </span>
                </button>
              </Reveal>
            </div>
          </div>
        </article>

        <article className="board-section is-soft">
          <div className="board-rail">
            <Reveal className="board-intro" blur={false}>
              <p className="board-kicker">Why CV Matters</p>
              <h2 className="board-heading">Write once. See the page as hiring software and people will.</h2>
              <p className="board-lead is-narrow">
                No cluttered chrome. Fill in your details, watch the page update, then download a PDF when you are ready.
              </p>
            </Reveal>
            <div className="board-points">
              {ABOUT.map((item, index) => (
                <Reveal key={item.title} className="board-point" delay={index * 80} blur={false}>
                  <span className="board-point-num">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </article>

        <article className="board-section is-warm" id="templates">
          <div className="board-rail">
            <Reveal className="board-intro is-row" blur={false}>
              <div>
                <p className="board-kicker">Templates</p>
                <h2 className="board-heading">Tested layouts recruiters and ATS both read cleanly.</h2>
                <p className="board-lead is-narrow">
                  Pick a layout to start. You can switch templates later without losing your draft.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="board-gallery" role="list" aria-label="Resume templates">
            {templates.map((item, index) => (
              <Tilt key={item.id} className="board-tile-tilt" max={4} lift={8}>
                <button
                  type="button"
                  role="listitem"
                  className="board-tile"
                  disabled={busy}
                  style={{ animationDelay: `${index * 40}ms` }}
                  onClick={() => startWith(item.id)}
                >
                  <span className="board-tile-stage" aria-hidden="true">
                    <span className="board-tile-paper">
                      <ResumeSheet templateId={item.id} data={sampleForTemplate(item.id)} preview fill />
                    </span>
                  </span>
                  <span className="board-tile-meta">
                    <strong>{templateName(item.id)}</strong>
                    <em>{item.blurb}</em>
                  </span>
                </button>
              </Tilt>
            ))}
          </div>
        </article>

        <SiteFooter
          busy={busy}
          onBuild={() => pickIntent("build")}
          onJob={() => pickIntent("job")}
          onField={() => pickIntent("field")}
        />

        {ask && (
          <div className="board-ask" role="dialog" aria-labelledby="board-ask-title">
            <div className="board-rail board-ask-inner">
              <div className={step === "choose" ? "board-ask-stage is-wide" : "board-ask-stage is-form"}>
              <header className="board-ask-hero">
                <button
                  type="button"
                  className="board-ask-back"
                  onClick={() => {
                    if (step === "choose") setAsk(null);
                    else setStep("choose");
                  }}
                >
                  <IconChevronLeft />
                  Back
                </button>
                <p className="board-kicker">{ASK_TITLE[ask]}</p>
                <h1 id="board-ask-title">
                  {step === "choose" && "How should this start?"}
                  {step === "upload" && "Upload your CV"}
                  {step === "linkedin" && "Import from LinkedIn"}
                </h1>
                <p className="board-lead board-ask-lead">
                  {step === "choose" &&
                    (owned
                      ? "This replaces the CV you have now. A blank page, a file you already have, or a LinkedIn profile."
                      : "A blank page, a file you already have, or a LinkedIn profile.")}
                  {step === "upload" &&
                    `Drop the file. The sections come out of it, then this opens ${
                      ask === "job" ? "the job post" : ask === "field" ? "resumes in your field" : "the editor"
                    }.`}
                  {step === "linkedin" && "A profile link opens a draft with your name on it."}
                </p>
              </header>
              <div className="board-ask-body">
              <div className="board-ask-panel">
              {step === "choose" && (
                <>
                  <div className="board-ask-cards">
                    <button type="button" className="board-ask-card" disabled={busy} onClick={() => onCreate(ask, layout)}>
                      <span className="board-ico">
                        <IconCreate />
                      </span>
                      <span className="board-ask-copy">
                        <strong>Create a new CV</strong>
                        <span>Start from an empty page in {templateName(layout)}.</span>
                      </span>
                    </button>
                    <button type="button" className="board-ask-card" disabled={busy} onClick={() => setStep("upload")}>
                      <span className="board-ico">
                        <IconUpload />
                      </span>
                      <span className="board-ask-copy">
                        <strong>Upload an existing CV</strong>
                        <span>PDF, DOCX, or TXT. We read the sections out of the file.</span>
                      </span>
                    </button>
                    <button type="button" className="board-ask-card" disabled={busy} onClick={() => setStep("linkedin")}>
                      <span className="board-ico is-brand">
                        <IconLinkedinBrand />
                      </span>
                      <span className="board-ask-copy">
                        <strong>Import from LinkedIn</strong>
                        <span>Paste a linkedin.com/in/… link. Your name goes on the page.</span>
                      </span>
                    </button>
                  </div>
                  <aside className="board-ask-hints" aria-label="Quick guide">
                    <p>
                      <strong>Not sure?</strong> Start blank for a fast draft, upload if you already have a résumé file, or paste a
                      LinkedIn profile link to pre-fill your name.
                    </p>
                    <ul>
                      <li>Your data stays in your browser until you sign in.</li>
                      <li>Switch layout anytime from the editor.</li>
                    </ul>
                  </aside>
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
                      if (file) onUpload(file, ask, layout);
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
                        if (file) onUpload(file, ask, layout);
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
                        onLinkedin(parsed.url, parsed.name, ask, layout);
                      }
                    }}
                  >
                    <div className="board-link-form-head">
                      <span className="board-ico is-brand" aria-hidden="true">
                        <IconLinkedinBrand />
                      </span>
                      <div className="board-link-form-intro">
                        <strong>LinkedIn profile link</strong>
                        <span>Use your public <em>linkedin.com/in/…</em> URL — we add your name; you complete the CV in the editor.</span>
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
                </>
              )}
              {busy && busyLabel ? <p className="board-note">{busyLabel}</p> : null}
              {error ? <p className="banner">{error}</p> : null}
              </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
