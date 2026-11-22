"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResumeView } from "./ResumeSheet";
import { LoadScreen } from "./LoadScreen";
import { Stars } from "./Stars";
import { IconDownload } from "./icons";
import { ApiError, loadPublicResume, loadRatings, rateResume } from "@/lib/api";
import { hasPublicResumeContent } from "@/lib/publicResume";
import type { RatingSummary, ResumeRecord } from "@/lib/types";

/**
 * Public resume at `/:username` — black stage, CV first, optional rating below.
 */
export function PublicCvPage({
  id,
  initialRecord = null,
  signedIn,
  downloading = false,
  downloadError = "",
  onSignIn,
  onDownload,
}: {
  id: string;
  initialRecord?: (ResumeRecord & { isMine?: boolean }) | null;
  signedIn: boolean;
  downloading?: boolean;
  downloadError?: string;
  onSignIn: () => void;
  onDownload?: (name: string) => void;
}) {
  const [record, setRecord] = useState<(ResumeRecord & { isMine?: boolean }) | null>(initialRecord);
  const [notes, setNotes] = useState<{ stars: number; note: string; name: string; at: string }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const [pendingStars, setPendingStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError("");
    if (!initialRecord || initialRecord.id !== id) {
      setRecord(initialRecord || null);
    }
    loadPublicResume(id)
      .then(async (row) => {
        if (cancelled) return;
        setRecord(row);
        if (!hasPublicResumeContent(row.data)) {
          setNotes([]);
          return;
        }
        try {
          const detail = await loadRatings(row.id);
          if (!cancelled) setNotes(detail.notes || []);
        } catch {
          if (!cancelled) setNotes([]);
        }
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        if (!initialRecord) {
          setError(reason instanceof Error ? reason.message : "Couldn't open that resume.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, initialRecord]);

  const submitRating = async (stars: number) => {
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
      if (reason instanceof ApiError && reason.needsSignIn) {
        setPendingStars(stars);
        onSignIn();
      } else {
        setHint(reason instanceof Error ? reason.message : "Couldn't save that rating.");
      }
    } finally {
      setBusy(false);
    }
  };

  // If the visitor clicked a star while signed out and just finished signing in, submit it smoothly.
  useEffect(() => {
    if (!signedIn || pendingStars == null || !record || busy) return;
    const stars = pendingStars;
    setPendingStars(null);
    void submitRating(stars);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, pendingStars, record?.id]);

  const onRate = (stars: number) => {
    if (busy) return;
    if (!signedIn) {
      setPendingStars(stars);
      onSignIn();
      return;
    }
    void submitRating(stars);
  };

  if (error) {
    return (
      <div className="public-stage">
        <Link href="/" className="sheet-x public-float-close" aria-label="Close">
          ×
        </Link>
        <div className="public-empty">
          <h1>Resume not found</h1>
          <p>{error}</p>
          <div className="public-empty-acts">
            <Link href="/" className="btn-cta">
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="public-stage is-loading">
        <LoadScreen message="Opening resume…" variant="on-dark" />
      </div>
    );
  }

  if (!hasPublicResumeContent(record.data)) {
    const handle = record.slug || id;
    return (
      <div className="public-stage">
        <Link href="/" className="sheet-x public-float-close" aria-label="Close">
          ×
        </Link>
        <div className="public-empty public-unpublished">
          <span className="public-unpublished-pill">/{handle}</span>
          <h1>This resume isn&apos;t published yet</h1>
          <p>
            The owner of this link is still putting their CV together. Check back soon, or create your own
            resume on CV Matters.
          </p>
          <div className="public-empty-acts">
            <Link href="/start" className="btn-cta">
              Create your own CV
            </Link>
            <Link href="/" className="public-empty-ghost">
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rating = (record.rating || { average: 0, count: 0, mine: 0 }) as RatingSummary;
  const name = record.data.personal.fullName.trim() || "This resume";
  const role = record.data.personal.title.trim();

  return (
    <div className="public-stage">
      <h1 className="sr-only">{role ? `${name} — ${role}` : name}</h1>
      <Link href="/" className="sheet-x public-float-close" aria-label="Close">
        ×
      </Link>

      <div className="public-sheet">
        <ResumeView templateId={record.templateId} data={record.data} hideContact={false} />
      </div>

      <div className="public-rate-bar">
        <Stars
          value={rating.mine || 0}
          size={16}
          label={`Rate ${name}`}
          onRate={onRate}
        />
        <span>
          {rating.count
            ? `${rating.average.toFixed(1)} · ${rating.count} ${rating.count === 1 ? "rating" : "ratings"}`
            : "Rate this CV"}
        </span>
        {hint ? <em>{hint}</em> : null}
      </div>

      <div className="public-join-bar">
        <Link href="/start" className="public-join-cta">
          Create your free CV →
        </Link>
        {onDownload ? (
          <button
            type="button"
            className="public-join-cta public-download-cta"
            aria-label={downloading ? "Building PDF…" : `Download ${name}'s resume as PDF`}
            title={downloading ? "Building PDF…" : "Free PDF download"}
            disabled={downloading}
            onClick={() => onDownload(name)}
          >
            {downloading ? <span className="public-download-spin" aria-hidden="true" /> : <IconDownload />}
            <span>{downloading ? "Building PDF…" : "Free download"}</span>
          </button>
        ) : null}
      </div>
      {downloadError ? <p className="public-download-err" role="alert">{downloadError}</p> : null}

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
