import Link from "next/link";
import { SiteFooter } from "./SiteFooter";

const VALUES = [
  {
    title: "Clarity over clutter",
    body: "You edit one section at a time with a live page beside you. The layout stays readable for people and for hiring software.",
  },
  {
    title: "Job-aware writing",
    body: "Paste a posting and tune your summary and experience toward what that role asks for, without starting from a blank page each time.",
  },
  {
    title: "Learn from your field",
    body: "Browse shared CVs in your industry to see tone, structure, and skills that peers actually use.",
  },
] as const;

export function AboutPage() {
  return (
    <div className="board board-static">
      <section className="board-section board-about-hero" aria-labelledby="about-title">
        <div className="board-rail">
          <p className="board-kicker">About</p>
          <h1 id="about-title" className="board-heading">
            CV Matters helps you ship a resume you&apos;re willing to send
          </h1>
          <p className="board-lead is-narrow">
            We built CV Matters for people who rewrite the same CV for every application. You get ATS-friendly templates, a live preview,
            optional job-matching, and a public page when you want to share one link.
          </p>
          <div className="board-about-acts">
            <Link href="/cv/details" className="board-pill board-pill-primary">
              <span className="board-pill-label">Start your CV</span>
            </Link>
            <Link href="/" className="board-pill board-pill-outline">
              <span className="board-pill-label">Back to home</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="board-section is-soft" aria-label="What we focus on">
        <div className="board-rail">
          <h2 className="board-heading">What we focus on</h2>
          <div className="board-points">
            {VALUES.map((item, index) => (
              <article key={item.title} className="board-point">
                <span className="board-point-num">{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="board-section" aria-label="How it works">
        <div className="board-rail">
          <h2 className="board-heading">How it works</h2>
          <ol className="board-about-steps">
            <li>
              <strong>Build</strong> — Fill in details, experience, and skills with templates that stay single-column and scannable.
            </li>
            <li>
              <strong>Match</strong> — Add a job description to see keyword fit and steer your copy.
            </li>
            <li>
              <strong>Share</strong> — Export a PDF or publish at a username link when you&apos;re ready.
            </li>
          </ol>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
