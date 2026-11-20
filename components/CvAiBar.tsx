"use client";

import { useEffect, useRef, useState } from "react";
import { runAiCommand } from "@/lib/api";
import type { ResumeData, TemplateId } from "@/lib/types";
import { IconArrowUp, Spark } from "./icons";

type Snapshot = {
  templateId: TemplateId;
  data: ResumeData;
};

type Feedback = {
  kind: "ok" | "error";
  text: string;
  canUndo?: boolean;
};

const PLACEHOLDERS: Record<string, string> = {
  details: "Ask AI: center header, royal blue, modern template, fix title…",
  bio: "Ask AI: make summary punchier, serif font, fit on 1 page…",
  experience: "Ask AI: tighten bullets, emerald accent, justify text, compact…",
  education: "Ask AI: move education up, navy accent, classic template…",
  skills: "Ask AI: add React & Docker, compact layout, teal color…",
  extras: "Ask AI: hide references, fit on 1 page, switch template…",
  job: "Ask AI: tailor summary to this role, highlight key skills…",
  compare: "Ask AI: fit on 1 page, royal blue, center header, serif…",
};

function quickPrompts(section: string): { label: string; prompt: string }[] {
  const sectionChip: Record<string, { label: string; prompt: string }> = {
    details: { label: "Center header", prompt: "Center align header" },
    bio: { label: "Polish summary", prompt: "Improve and tighten my summary" },
    experience: { label: "Polish bullets", prompt: "Make my experience bullets stronger and concise" },
    education: { label: "Education first", prompt: "Move education above experience" },
    skills: { label: "Compact spacing", prompt: "Make layout tighter to fit on 1 page" },
    extras: { label: "Tighten spacing", prompt: "Make spacing tighter to fit on 1 page" },
    job: { label: "Tailor to JD", prompt: "Tailor my summary and bullets to the job description" },
    compare: { label: "Fit on 1 page", prompt: "Fit resume on 1 page with tighter spacing" },
  };

  const first = sectionChip[section] || { label: "Fit on 1 page", prompt: "Fit resume on 1 page" };
  const base = [
    first,
    { label: "Fit on 1 page", prompt: "Fit resume on 1 page with compact spacing" },
    { label: "Royal blue", prompt: "Change accent color to royal blue" },
    { label: "Emerald", prompt: "Change accent color to emerald green" },
    { label: "Center header", prompt: "Center align header" },
    { label: "Justify text", prompt: "Justify body text alignment" },
    { label: "Classic serif", prompt: "Use classic serif font" },
    { label: "Modern layout", prompt: "Switch to a modern clean template" },
  ];

  const seen = new Set<string>();
  return base.filter((item) => {
    if (seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  }).slice(0, 6);
}

export function CvAiBar({
  section,
  templateId,
  data,
  jobDescription,
  onApply,
}: {
  section: string;
  templateId: TemplateId;
  data: ResumeData;
  jobDescription: string;
  onApply: (next: { templateId: TemplateId; data: ResumeData }) => void;
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const submit = async (rawPrompt?: string) => {
    const prompt = (rawPrompt ?? query).trim();
    if (!prompt || busy) return;

    setBusy(true);
    setOpen(false);
    setFeedback(null);
    const prev: Snapshot = { templateId, data };

    try {
      const result = await runAiCommand({
        prompt,
        section,
        templateId,
        data,
        jobDescription,
      });

      if (result.changed) {
        setUndoStack((stack) => [...stack.slice(-9), prev]);
        onApply({ templateId: result.templateId, data: result.data });
      }
      setQuery("");
      setFeedback({
        kind: "ok",
        text: result.reply || "Updated your CV.",
        canUndo: result.changed,
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        text: error instanceof Error ? error.message : "Could not run that edit right now.",
      });
    } finally {
      setBusy(false);
    }
  };

  const undo = () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    setUndoStack((stack) => stack.slice(0, -1));
    onApply(last);
    setFeedback({ kind: "ok", text: "Reverted last AI change.", canUndo: false });
  };

  const chips = quickPrompts(section);
  const placeholder = PLACEHOLDERS[section] || "Ask AI to edit text, colors, alignment, font, or template…";

  return (
    <div className={`cv-ai-bar${open ? " is-open" : ""}${busy ? " is-busy" : ""}`} ref={rootRef}>
      {feedback && (
        <div className={`cv-ai-toast${feedback.kind === "error" ? " is-error" : ""}`} role="status" aria-live="polite">
          <span className="cv-ai-toast-dot" aria-hidden="true" />
          <span className="cv-ai-toast-text">{feedback.text}</span>
          {feedback.canUndo && undoStack.length > 0 && (
            <button type="button" className="cv-ai-toast-undo" onClick={undo}>
              Undo
            </button>
          )}
          <button
            type="button"
            className="cv-ai-toast-x"
            aria-label="Dismiss"
            onClick={() => setFeedback(null)}
          >
            ×
          </button>
        </div>
      )}

      {open && !busy && (
        <div className="cv-ai-pop" role="region" aria-label="Quick AI actions">
          <div className="cv-ai-pop-head">
            <span>Ask AI anything about content, colors, alignment, or template</span>
          </div>
          <div className="cv-ai-chips">
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className="cv-ai-chip"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void submit(chip.prompt)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="cv-ai-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <span className="cv-ai-icon" aria-hidden="true">
          <Spark />
        </span>
        <input
          ref={inputRef}
          type="text"
          className="cv-ai-input"
          value={query}
          disabled={busy}
          placeholder={busy ? "Updating your CV…" : placeholder}
          aria-label="Ask AI to edit your CV"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            if (feedback) setFeedback(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
        />
        {undoStack.length > 0 && !query.trim() && !busy && !feedback?.canUndo && (
          <button
            type="button"
            className="cv-ai-undo-inline"
            title="Undo last AI edit"
            onClick={undo}
          >
            Undo
          </button>
        )}
        <button
          type="submit"
          className="cv-ai-send"
          disabled={busy || !query.trim()}
          aria-label="Apply AI edit"
          title="Run AI command"
        >
          {busy ? <span className="cv-ai-spin" aria-hidden="true" /> : <IconArrowUp />}
        </button>
      </form>
    </div>
  );
}
