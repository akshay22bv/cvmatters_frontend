"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadScreen } from "./LoadScreen";
import { SiteFooter } from "./SiteFooter";
import { HOME_FAQS } from "./HomeJsonLd";
import { IconChevronRight } from "./icons";
import { Reveal, Tilt } from "./motion";
import { HeroResumePreview } from "./HeroResumePreview";
import { ResumeSheet } from "./ResumeSheet";
import { offeredCatalog } from "@/lib/catalog";
import { sampleForTemplate } from "@/lib/content";
import { SAMPLE_EXAMPLES } from "@/lib/examples";
import { startPath, type StartIntent } from "@/lib/paths";
import { templateName, type ResumeData, type TemplateId } from "@/lib/types";

export type DashIntent = StartIntent;

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

const STORIES = [
  {
    quote:
      "Uploaded my old two-column Word doc and had a clean ATS version ready in ten minutes. I keep one cvmatters.net link on my LinkedIn now.",
    name: "Priya S.",
    role: "Product Designer · Bengaluru",
  },
  {
    quote:
      "Pasting the job description right beside my bullets made tailoring for backend roles painless instead of rewriting from scratch every night.",
    name: "Karthik M.",
    role: "Senior Software Engineer · Pune",
  },
  {
    quote:
      "Recruiters kept asking for a quick link on WhatsApp and LinkedIn. Sending one clean URL that always matches my PDF saved so much back-and-forth.",
    name: "Neha R.",
    role: "Product Manager · Mumbai",
  },
  {
    quote:
      "No bloated wizard or surprise watermarks halfway through. What you see in the live preview is genuinely what exports to PDF.",
    name: "Daniel K.",
    role: "Growth Lead · Remote",
  },
] as const;

/**
 * Home: product story, three ways in, templates, social proof, FAQ, and a footer.
 * Starting a CV goes to /start — a dedicated navigation page.
 */
export function Landing({
  data,
  templateId,
  busy = false,
  busyLabel = "",
  error = "",
  signedIn = false,
  onOpen,
  onCreate,
}: {
  data?: ResumeData;
  templateId?: TemplateId;
  busy?: boolean;
  busyLabel?: string;
  error?: string;
  signedIn?: boolean;
  onOpen?: (intent: DashIntent) => void;
  onCreate: (intent: DashIntent, templateId: TemplateId) => void;
  onUpload?: (file: File, intent: DashIntent, templateId: TemplateId) => void;
  onLinkedin?: (url: string, name: string, intent: DashIntent, templateId: TemplateId) => void;
}) {
  const router = useRouter();
  const templates = useMemo(() => offeredCatalog(), []);
  const owned = !!data;

  const pickIntent = (intent: DashIntent) => {
    if (owned && onOpen) {
      onOpen(intent);
      return;
    }
    router.push(startPath("choose", intent));
  };

  const startWith = (next: TemplateId) => {
    onCreate("build", next);
  };

  return (
    <div className="board" aria-busy={busy || undefined}>
      {busy ? <LoadScreen message={busyLabel || "Starting your CV…"} variant="overlay" /> : null}
      {error ? <p className="board-flash banner">{error}</p> : null}
      <section className="board-story" aria-label="Home">
        <header className="board-hero">
          <div className="board-rail board-hero-shell">
            <div className="board-hero-copy">
              <div className="board-hero-top">
                <p className="board-kicker">Resume builder</p>
                <h1 className="board-brand">
                  <span className="board-brand-dark">CV</span>{" "}
                  <span className="board-brand-accent">Matters</span>
                </h1>
              </div>

              <div className="board-hero-panel">
                <p className="board-lead">
                  Build a clean CV and tune it to a job post—live preview, ATS-friendly layouts, and a shareable link.
                </p>
                <p className="board-seo-blurb sr-only">
                  CV Matters is an online resume builder for students and professionals in India and worldwide. Create a
                  single-column, ATS-friendly curriculum vitae, match bullets to a job description, publish a public page
                  at cvmatters.net/your-name, and export a sharp PDF when recruiters ask for a file.
                </p>
                <div className="board-cta">
                  <button type="button" className="board-pill board-pill-primary board-hero-cta" disabled={busy} onClick={() => pickIntent("build")}>
                    <span className="board-pill-label">{owned ? "Open your CV" : "Create my resume"}</span>
                  </button>
                  {!signedIn ? (
                    <p className="board-cta-meta">
                      <Link href="/login">Sign in</Link>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="board-hero-visual">
              <HeroResumePreview />
            </div>
          </div>
        </header>

        <article className="board-section board-section-actions" aria-label="More ways to start">
          <div className="board-rail">
            <Reveal className="board-intro" blur={false}>
              <p className="board-kicker">Go further</p>
              <h2 className="board-heading">Tailor to a role or see your industry</h2>
              <p className="board-lead is-narrow">Same editor—pick the path that fits what you need next.</p>
            </Reveal>
            <div className="board-action-cards">
              <Reveal className="board-action-card" delay={40} blur={false}>
                <h3 className="board-action-title">Match a job</h3>
                <p className="board-action-body">Paste a posting and we steer your summary and experience toward that role.</p>
                <button type="button" className="board-pill board-pill-outline" disabled={busy} onClick={() => pickIntent("job")}>
                  <span className="board-pill-label">Continue</span>
                  <span className="board-pill-icon" aria-hidden="true">
                    <IconChevronRight />
                  </span>
                </button>
              </Reveal>
              <Reveal className="board-action-card" delay={100} blur={false}>
                <h3 className="board-action-title">Browse your field</h3>
                <p className="board-action-body">Open shared CVs from people in your line to see tone, structure, and strengths.</p>
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
                No cluttered chrome. Fill in your details, watch the page update, then share a link or download a PDF when you are ready.
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
                <p className="board-lead is-narrow">Pick a layout to start. You can switch templates later without losing your draft.</p>
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

        <article className="board-section" aria-labelledby="proof-title">
          <div className="board-rail">
            <Reveal className="board-intro" blur={false}>
              <p className="board-kicker">Real layouts · Real feedback</p>
              <h2 id="proof-title" className="board-heading">
                Built for job seekers who care how their resume reads
              </h2>
              <p className="board-lead is-narrow">
                Anonymized example resumes built in the same editor, plus notes from people using CV Matters during their job search.
              </p>
            </Reveal>

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

            <div className="board-quotes">
              {STORIES.map((item) => (
                <figure key={item.name} className="board-quote">
                  <blockquote>“{item.quote}”</blockquote>
                  <figcaption>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </article>

        <article className="board-section is-soft" id="faq" aria-labelledby="faq-title">
          <div className="board-rail">
            <Reveal className="board-intro" blur={false}>
              <p className="board-kicker">FAQ</p>
              <h2 id="faq-title" className="board-heading">
                Common questions
              </h2>
              <p className="board-lead is-narrow">
                Straight answers on pricing, PDF exports, ATS compatibility, and public links.
              </p>
            </Reveal>
            <div className="board-faq-list">
              {HOME_FAQS.map((item) => (
                <details key={item.q} className="board-faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </article>

        <SiteFooter
          busy={busy}
          onBuild={() => pickIntent("build")}
          onJob={() => pickIntent("job")}
          onField={() => pickIntent("field")}
        />
      </section>
    </div>
  );
}
