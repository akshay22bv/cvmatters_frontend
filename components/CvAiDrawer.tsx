"use client";

import { useEffect, useRef, useState } from "react";
import { runAiCommand } from "@/lib/api";
import type { ResumeData, TemplateId } from "@/lib/types";
import { IconAiDots, IconArrowUp, IconPalette, IconX, Spark } from "./icons";

type Snapshot = {
  templateId: TemplateId;
  data: ResumeData;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  error?: boolean;
  undoSnapshot?: Snapshot;
  undone?: boolean;
};

type RecCard = {
  id: string;
  tone: "blue" | "pink" | "green" | "amber";
  title: string;
  desc: string;
  prompt: string;
};

function firstNameOf(raw: string | undefined) {
  const clean = String(raw || "").trim();
  if (!clean) return "";
  const first = clean.split(/\s+/)[0] || "";
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "";
}

function recommendationsFor(section: string): RecCard[] {
  const summaryCard: RecCard = {
    id: "summary",
    tone: "blue",
    title: "Write or sharpen summary",
    desc: "Draft or tighten a crisp, recruiter-ready summary from your role and strengths.",
    prompt: "Write and polish a concise summary for my CV",
  };
  const expCard: RecCard = {
    id: "experience",
    tone: "pink",
    title: "Strengthen experience bullets",
    desc: "Lead with stronger action verbs and tighten every bullet point for impact.",
    prompt: "Strengthen and polish my experience bullets",
  };
  const skillsCard: RecCard = {
    id: "skills",
    tone: "green",
    title: "Suggest relevant skills",
    desc: "Add high-signal skills that match your job title and experience, deduplicated.",
    prompt: "Suggest and add relevant skills for my role",
  };
  const designCard: RecCard = {
    id: "design",
    tone: "amber",
    title: "Style, color & 1-page fit",
    desc: "Tune accent color, font, alignment, and spacing so your CV looks balanced.",
    prompt: "Change accent color to royal blue and fit resume cleanly on 1 page",
  };

  if (section === "experience") {
    return [
      { ...expCard, tone: "blue" },
      { ...summaryCard, tone: "pink" },
      skillsCard,
      designCard,
    ];
  }
  if (section === "skills") {
    return [
      { ...skillsCard, tone: "blue" },
      expCard,
      { ...summaryCard, tone: "green" },
      designCard,
    ];
  }
  if (section === "education") {
    return [
      {
        id: "edu-order",
        tone: "blue",
        title: "Highlight education first",
        desc: "Move Education above Experience to showcase your degree near the top.",
        prompt: "Move education above experience",
      },
      expCard,
      skillsCard,
      designCard,
    ];
  }
  if (section === "job") {
    return [
      {
        id: "tailor",
        tone: "blue",
        title: "Tailor CV to this job post",
        desc: "Align your summary and experience bullets with the target job description.",
        prompt: "Tailor my summary and experience bullets to this job description",
      },
      skillsCard,
      expCard,
      designCard,
    ];
  }

  return [summaryCard, expCard, skillsCard, designCard];
}

function followupsFor(lastUserPrompt: string) {
  const lower = lastUserPrompt.toLowerCase();
  if (/\b(template|layout)\b/.test(lower)) {
    return [
      { label: "Try another template", prompt: "Change to another template" },
      { label: "Change color", prompt: "Change accent color" },
      { label: "Change font", prompt: "Change the font" },
      { label: "Fit on 1 page", prompt: "Fit resume on 1 page" },
    ];
  }
  if (/\b(color|colour|accent|font|serif|sans|align|justify|page|spacing)\b/.test(lower)) {
    return [
      { label: "Try another color", prompt: "Change accent color" },
      { label: "Try another font", prompt: "Change the font" },
      { label: "Switch template", prompt: "Change the template" },
      { label: "Reset style", prompt: "Reset style" },
    ];
  }
  if (/\b(skill)\b/.test(lower)) {
    return [
      { label: "Polish bullets", prompt: "Strengthen and polish my experience bullets" },
      { label: "Sharpen summary", prompt: "Write and polish a concise summary for my CV" },
      { label: "Switch template", prompt: "Change the template" },
      { label: "Fit on 1 page", prompt: "Fit resume on 1 page" },
    ];
  }
  return [
    { label: "Suggest skills", prompt: "Suggest and add relevant skills for my role" },
    { label: "Polish bullets", prompt: "Strengthen and polish my experience bullets" },
    { label: "Switch template", prompt: "Change the template" },
    { label: "Change color", prompt: "Change accent color" },
  ];
}

function RecIcon({ tone }: { tone: RecCard["tone"] }) {
  if (tone === "blue") return <Spark />;
  if (tone === "pink") return <IconPalette />;
  if (tone === "green") {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2.8" width="12" height="14.4" rx="2" />
        <path d="M7.2 7h5.6M7.2 10h5.6M7.2 13h3.6" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5h12M6 10h8M4 14.5h12" />
    </svg>
  );
}

export function CvAiDrawer({
  open,
  onClose,
  userName,
  section,
  templateId,
  data,
  jobDescription,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  userName?: string;
  section: string;
  templateId: TemplateId;
  data: ResumeData;
  jobDescription: string;
  onApply: (next: { templateId: TemplateId; data: ResumeData }) => void;
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showRecs, setShowRecs] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Only auto-focus on pointer-fine desktops; mobile opens cleanly without slamming the keyboard up.
    const isDesktop = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
    const timer = isDesktop ? window.setTimeout(() => inputRef.current?.focus(), 160) : null;
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer != null) window.clearTimeout(timer);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy, showRecs]);

  const send = async (rawPrompt?: string) => {
    const prompt = (rawPrompt ?? query).trim();
    if (!prompt || busy) return;

    const prev: Snapshot = { templateId, data };
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: prompt };
    setMessages((list) => [...list, userMsg]);
    setShowRecs(false);
    setQuery("");
    setBusy(true);

    try {
      const result = await runAiCommand({
        prompt,
        section,
        templateId,
        data,
        jobDescription,
      });

      if (result.changed) {
        onApply({ templateId: result.templateId, data: result.data });
      }

      setMessages((list) => [
        ...list,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: result.reply || "Updated your CV.",
          undoSnapshot: result.changed ? prev : undefined,
        },
      ]);
    } catch (error) {
      setMessages((list) => [
        ...list,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: error instanceof Error ? error.message : "Could not run that edit right now.",
          error: true,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const undoMessage = (msgId: string) => {
    const target = messages.find((m) => m.id === msgId);
    if (!target?.undoSnapshot || target.undone) return;
    onApply(target.undoSnapshot);
    setMessages((list) => list.map((m) => (m.id === msgId ? { ...m, undone: true } : m)));
  };

  if (!open) return null;

  const firstName = firstNameOf(data.personal.fullName) || firstNameOf(userName);
  const recs = recommendationsFor(section);
  const showingHome = showRecs || messages.length === 0;

  return (
    <div className="ai-drawer-wrap" role="presentation">
      <button type="button" className="ai-drawer-scrim" aria-label="Close AI assistant" onClick={onClose} />
      <aside className="ai-drawer" role="dialog" aria-label="Ask AI assistant">
        <div className="ai-drawer-top">
          {!showingHome ? (
            <button type="button" className="ai-drawer-back" onClick={() => setShowRecs(true)}>
              ← Recommended
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="ai-drawer-close" aria-label="Close AI assistant" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="ai-drawer-scroll" ref={scrollRef}>
          {showingHome ? (
            <div className="ai-drawer-home">
              <div className="ai-drawer-mark" aria-hidden="true">
                <IconAiDots size={24} />
              </div>
              <h2 className="ai-drawer-greet">
                {firstName ? (
                  <>
                    <strong>{firstName},</strong> let me know if I can help with anything.
                  </>
                ) : (
                  <>
                    <strong>Let me know</strong> if I can help with anything.
                  </>
                )}
              </h2>

              <p className="ai-drawer-label">Recommended</p>
              <div className="ai-rec-list">
                {recs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="ai-rec-item"
                    disabled={busy}
                    onClick={() => void send(item.prompt)}
                  >
                    <span className={`ai-rec-ico is-${item.tone}`} aria-hidden="true">
                      <RecIcon tone={item.tone} />
                    </span>
                    <span className="ai-rec-copy">
                      <strong>{item.title}</strong>
                      <span>{item.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="ai-thread">
              {messages.map((msg) => (
                <div key={msg.id} className={`ai-msg is-${msg.role}${msg.error ? " is-error" : ""}`}>
                  {msg.role === "assistant" && (
                    <span className="ai-msg-avatar" aria-hidden="true">
                      <IconAiDots size={14} />
                    </span>
                  )}
                  <div className="ai-msg-body">
                    <p>{msg.text}</p>
                    {msg.undoSnapshot && (
                      <div className="ai-msg-acts">
                        <button
                          type="button"
                          className="ai-msg-undo"
                          disabled={msg.undone}
                          onClick={() => undoMessage(msg.id)}
                        >
                          {msg.undone ? "Reverted" : "Undo change"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {busy && (
                <div className="ai-msg is-assistant is-thinking">
                  <span className="ai-msg-avatar" aria-hidden="true">
                    <IconAiDots size={14} />
                  </span>
                  <div className="ai-msg-body">
                    <p>Updating your CV…</p>
                  </div>
                </div>
              )}

              {!busy && (
                <div className="ai-followups" aria-label="Quick follow-ups">
                  {followupsFor([...messages].reverse().find((m) => m.role === "user")?.text || "").map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      className="ai-followup-chip"
                      onClick={() => void send(chip.prompt)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ai-drawer-foot">
          <form
            className="ai-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <button
              type="button"
              className={`ai-composer-menu${showingHome ? " is-on" : ""}`}
              aria-label={showingHome ? "Show conversation" : "Show recommended prompts"}
              title={showingHome ? "Recommended" : "Recommended prompts"}
              onClick={() => {
                if (messages.length > 0) setShowRecs((v) => !v);
              }}
            >
              <IconAiDots size={16} />
            </button>
            <div className="ai-composer-pill">
              <input
                ref={inputRef}
                type="text"
                className="ai-composer-input"
                value={query}
                disabled={busy}
                placeholder="Ask anything"
                aria-label="Ask AI anything about your CV"
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                type="submit"
                className="ai-composer-send"
                disabled={busy || !query.trim()}
                aria-label="Send"
              >
                {busy ? <span className="ai-composer-spin" aria-hidden="true" /> : <IconArrowUp />}
              </button>
            </div>
          </form>
          <p className="ai-drawer-note">You are interacting with an AI assistant · Undo anytime.</p>
        </div>
      </aside>
    </div>
  );
}
