"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResumeView } from "./ResumeSheet";
import { LoadScreen } from "./LoadScreen";
import { Stars } from "./Stars";
import { ApiError, loadPublicResume, loadRatings, rateResume } from "@/lib/api";
import type { RatingSummary, ResumeRecord } from "@/lib/types";

/**
 * Public resume at `/:username` — black stage, CV only, no site header.
 */
export function PublicCvPage({
  id,
  signedIn,
  onSignIn,
}: {
  id: string;
  signedIn: boolean;
  onSignIn: () => void;
}) {
  const [record, setRecord] = useState<(ResumeRecord & { isMine?: boolean }) | null>(null);
  const [notes, setNotes] = useState<{ stars: number; note: string; name: string; at: string }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError("");
    setRecord(null);
    loadPublicResume(id)
      .then(async (row) => {
        if (cancelled) return;
        setRecord(row);
        try {
          const detail = await loadRatings(row.id);
          if (!cancelled) setNotes(detail.notes || []);
        } catch {
          if (!cancelled) setNotes([]);
        }
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : "Couldn't open that resume.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onRate = async (stars: number) => {
    if (!signedIn) {
      onSignIn();
      return;
    }
    if (!record) return;
    if (record.isMine) {
      setHint("You can't rate your own resume.");
      return;
    }
    setBusy(true);
    setHint("");
    try {
      const next = await rateResume(record.id, stars, "");
      setRecord((current) => (current ? { ...current, rating: next } : current));
    } catch (reason) {
      if (reason instanceof ApiError && reason.needsSignIn) onSignIn();
      else setHint(reason instanceof Error ? reason.message : "Couldn't save that rating.");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="public-stage">
        <Link href="/" className="public-float-close" aria-label="Close">
          ×
        </Link>
        <div className="public-empty">
          <h1>Resume not found</h1>
          <p>{error}</p>
          <Link href="/">Go home</Link>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="public-stage">
        <LoadScreen message="Opening resume…" variant="on-dark" />
      </div>
    );
  }

  const rating = (record.rating || { average: 0, count: 0, mine: 0 }) as RatingSummary;
  const name = record.data.personal.fullName.trim() || "This resume";

  return (
    <div className="public-stage">
      <Link href="/" className="public-float-close" aria-label="Close">
        ×
      </Link>

      <div className="public-rate-bar">
        <Stars
          value={rating.mine || 0}
          size={16}
          label={`Rate ${name}`}
          onRate={(stars) => {
            if (!busy) void onRate(stars);
          }}
        />
        <span>
          {rating.count
            ? `${rating.average.toFixed(1)} · ${rating.count}`
            : signedIn
              ? "Rate this CV"
              : "Sign in to rate"}
        </span>
        {!signedIn ? (
          <button type="button" className="public-rate-btn" onClick={onSignIn}>
            Sign in
          </button>
        ) : null}
        {hint ? <em>{hint}</em> : null}
      </div>

      <div className="public-sheet">
        <ResumeView templateId={record.templateId} data={record.data} hideContact={false} />
      </div>

      {notes.length > 0 ? (
        <section className="public-notes">
          <h2>Reviews</h2>
          <ul>
            {notes.map((item, index) => (
              <li key={`${item.at}-${index}`}>
                <Stars value={item.stars} size={12} />
                <strong>{item.name}</strong>
                <p>{item.note}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
