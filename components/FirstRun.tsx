"use client";

import { useEffect, useState } from "react";

const KEY = "cv-matters-intro";

/**
 * A short note the first time the editor opens, so the two jobs of the
 * product are obvious even if someone skipped the front page.
 */
export function FirstRun({ onJob, onField }: { onJob: () => void; onField: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem(KEY) !== "1");
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const close = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* the note just won't remember */
    }
    setOpen(false);
  };

  return (
    <aside className="first-run">
      <p>
        <strong>Start with the job.</strong> Paste the job description, edit your CV so it answers that posting, then read resumes from people in your field.
      </p>
      <div className="first-run-acts">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            close();
            onJob();
          }}
        >
          Paste a job
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            close();
            onField();
          }}
        >
          See your field
        </button>
        <button type="button" className="btn-quiet" onClick={close}>
          Got it
        </button>
      </div>
    </aside>
  );
}
