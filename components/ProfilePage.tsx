"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Monogram } from "./Monogram";
import { Stars } from "./Stars";
import { Trash } from "./icons";
import { ApiError, createResume, deleteResume, listResumes, loadBilling, loadRatings, updateHosting } from "@/lib/api";
import { publicResumePath } from "@/lib/paths";
import type { AccountState } from "@/lib/useAccount";
import { templateName, type Category, type RatingSummary, type ResumeData, type ResumeRecord } from "@/lib/types";

function suggestSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 24);
}

export function ProfilePage({
  data,
  category,
  isPublic,
  rating,
  account,
  resumeId,
  slug,
  ownerKey,
  onShare,
  onPlans,
  onSaved,
  onUse,
}: {
  data: ResumeData;
  category: Category;
  isPublic: boolean;
  rating?: RatingSummary;
  account: AccountState;
  resumeId: string | null;
  slug: string | null;
  ownerKey: string;
  onShare: () => void;
  onPlans: () => void;
  onSaved: (next: { slug: string | null; isPublic: boolean }) => void;
  onUse: (record: ResumeRecord) => void;
}) {
  const name = data.personal.fullName.trim() || account.user?.name || "Your name";
  const likes = rating?.count || 0;
  const average = rating?.average || 0;
  const planName = account.entitlement.subscription?.plan || null;

  const [draft, setDraft] = useState(slug || suggestSlug(name) || "");
  const [hosting, setHosting] = useState(isPublic);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState<{ stars: number; note: string; name: string; at: string }[]>([]);
  const [orders, setOrders] = useState<{ id: string; plan: string; amount: number; status: string; createdAt: string }[]>([]);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setDraft(slug || "");
    setHosting(isPublic);
  }, [slug, isPublic, resumeId]);

  useEffect(() => {
    if (!ownerKey) return;
    let cancelled = false;
    listResumes(ownerKey)
      .then((rows) => {
        if (!cancelled) setResumes(rows);
      })
      .catch(() => {
        if (!cancelled) setResumes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [ownerKey, resumeId]);

  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;
    loadRatings(resumeId)
      .then((detail) => {
        if (!cancelled) setNotes(detail.notes || []);
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  useEffect(() => {
    if (!account.user) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    loadBilling()
      .then((status) => {
        if (!cancelled) setOrders(status.orders || []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, [account.user]);

  const liveSlug = (slug || "").trim();
  const publicPath = liveSlug ? publicResumePath(liveSlug) : null;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = publicPath ? `${origin}${publicPath}` : "";

  const preview = useMemo(() => {
    const clean = draft.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    return clean ? `${origin}/${clean}` : `${origin}/your-name`;
  }, [draft, origin]);

  const saveHosting = async () => {
    if (!resumeId || !ownerKey) {
      setError("Create a CV first, then come back to host it.");
      return;
    }
    if (!account.user) {
      setError("Sign in to host a public page.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const saved = await updateHosting(resumeId, {
        ownerKey,
        isPublic: hosting,
        slug: draft.trim() || null,
      });
      onSaved({ slug: saved.slug || null, isPublic: saved.isPublic });
    } catch (reason) {
      if (reason instanceof ApiError) setError(reason.message);
      else setError(reason instanceof Error ? reason.message : "Couldn't save that.");
    } finally {
      setBusy(false);
    }
  };

  const startNewCv = async () => {
    if (!ownerKey) return;
    setCreating(true);
    setError("");
    try {
      const created = await createResume(ownerKey);
      onUse(created);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Couldn't create another CV.");
      setCreating(false);
    }
  };

  const removeCv = async (id: string) => {
    if (!ownerKey || deletingId) return;
    const title = resumes.find((item) => item.id === id)?.data.personal.fullName.trim() || "this CV";
    if (!window.confirm(`Delete “${title}”? This can't be undone.`)) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteResume(id, ownerKey);
      const remaining = resumes.filter((item) => item.id !== id);
      setResumes(remaining);
      if (id === resumeId) {
        if (remaining[0]) onUse(remaining[0]);
        else onUse(await createResume(ownerKey));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Couldn't delete that CV.");
    } finally {
      setDeletingId(null);
    }
  };

  const copyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="prof">
      <div className="prof-top">
        <Link href="/cv/details" className="prof-back">
          ← Back to CV
        </Link>
        {!account.entitlement.canDownload ? (
          <button type="button" className="prof-linkish" onClick={onPlans}>
            Upgrade plan
          </button>
        ) : null}
      </div>

      <header className="prof-head">
        <Monogram name={name} photoUrl={data.personal.photoUrl} size={72} />
        <div className="prof-who">
          <p className="prof-kicker">Account</p>
          <h1>{name}</h1>
          <p className="prof-title">{data.personal.title || "Add a job title on your CV"}</p>
          {data.personal.email ? <p className="prof-meta">{data.personal.email}</p> : null}
        </div>
        <div className="prof-quick">
          <Link href="/cv/details" className="prof-btn is-primary">
            Edit current CV
          </Link>
          {account.user ? (
            <button type="button" className="prof-btn is-ghost" onClick={onShare}>
              Sharing
            </button>
          ) : null}
        </div>
      </header>

      <ul className="prof-stats">
        <li>
          <span>Plan</span>
          <strong>{planName ? planName.replace(/^\w/, (c) => c.toUpperCase()) : "Free"}</strong>
          <small>{account.entitlement.canDownload ? "PDF downloads on" : "Upgrade for PDF export"}</small>
        </li>
        <li>
          <span>CVs</span>
          <strong>{resumes.length}</strong>
          <small>{resumes.length === 1 ? "Document saved" : "Documents saved"}</small>
        </li>
        <li>
          <span>Rating</span>
          <strong>{average ? average.toFixed(1) : "—"}</strong>
          <Stars value={average} count={likes} size={13} />
        </li>
        <li>
          <span>Reviews</span>
          <strong>{likes}</strong>
          <small>{likes ? "On your public page" : "No reviews yet"}</small>
        </li>
      </ul>

      <div className="prof-layout">
        <div className="prof-main">
          <section className="prof-panel">
            <div className="prof-panel-head">
              <div className="prof-panel-copy">
                <h2>Your CVs</h2>
                <p>Switch between resumes or start a fresh one.</p>
              </div>
            </div>
            <ul className="prof-cvs">
              <li>
                <button type="button" className="prof-start" disabled={creating} onClick={() => void startNewCv()}>
                  <span className="prof-start-icon" aria-hidden="true">
                    +
                  </span>
                  <span className="prof-start-copy">
                    <strong>{creating ? "Creating…" : "Start new CV"}</strong>
                    <small>Blank resume · saved to your account</small>
                  </span>
                </button>
              </li>
              {resumes.map((item) => {
                const title = item.data.personal.fullName.trim() || "Untitled";
                const role = item.data.personal.title.trim() || "No job title";
                const current = item.id === resumeId;
                return (
                  <li key={item.id} className={current ? "prof-cv is-current" : "prof-cv"}>
                    <div>
                      <strong>{title}</strong>
                      <span>
                        {role} · {templateName(item.templateId)}
                        {item.slug ? ` · /${item.slug}` : ""}
                      </span>
                    </div>
                    <div className="prof-cv-acts">
                      <button type="button" className="prof-btn" onClick={() => onUse(item)}>
                        Open
                      </button>
                      <button
                        type="button"
                        className="prof-cv-del"
                        aria-label={`Delete ${title}`}
                        disabled={deletingId === item.id}
                        onClick={() => void removeCv(item.id)}
                      >
                        <Trash />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {!resumes.length ? <p className="prof-note">No saved CVs yet — tap Start new CV to add one.</p> : null}
          </section>

          <section className="prof-panel is-focus">
            <div className="prof-panel-copy">
              <h2>Public page</h2>
              <p>Choose a username and share one link to your CV.</p>
            </div>

            <label className="prof-user">
              <span>Username</span>
              <input
                value={draft}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                placeholder={suggestSlug(name) || "your-name"}
                disabled={busy || !resumeId}
                onChange={(event) => setDraft(event.target.value.toLowerCase())}
              />
            </label>
            <p className="prof-preview">{preview}</p>

            <label className="prof-switch">
              <input
                type="checkbox"
                checked={hosting}
                disabled={busy || !resumeId}
                onChange={(event) => setHosting(event.target.checked)}
              />
              <span>Anyone with the link can view and rate this CV</span>
            </label>

            {error ? <p className="prof-error">{error}</p> : null}

            <div className="prof-host-acts">
              <button type="button" className="prof-btn is-primary" disabled={busy || !resumeId} onClick={() => void saveHosting()}>
                {busy ? "Saving…" : "Save"}
              </button>
              {isPublic && publicPath ? (
                <>
                  <button type="button" className="prof-btn" onClick={() => void copyLink()}>
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <Link href={publicPath} className="prof-btn">
                    View page
                  </Link>
                </>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="prof-aside">
          {orders.length > 0 ? (
            <section className="prof-panel prof-panel-compact">
              <div className="prof-panel-copy">
                <h2>Billing</h2>
                <p>Recent purchases.</p>
              </div>
              <ul className="prof-orders">
                {orders.slice(0, 4).map((order) => (
                  <li key={order.id}>
                    <strong>{order.plan}</strong>
                    <span>{order.status}</span>
                    <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="prof-panel prof-panel-compact">
            <div className="prof-panel-copy">
              <h2>Reviews</h2>
              <p>Feedback on your hosted CV.</p>
            </div>
            {notes.length ? (
              <ul className="prof-notes">
                {notes.map((item, index) => (
                  <li key={`${item.at}-${index}`}>
                    <Stars value={item.stars} size={12} />
                    <strong>{item.name}</strong>
                    <p>{item.note}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="prof-note">Turn on your public page to collect reviews.</p>
            )}
          </section>

          <section className="prof-panel prof-panel-compact prof-panel-muted">
            <p className="prof-aside-tip">
              {[category, hosting || isPublic ? "Public" : "Private"].filter(Boolean).join(" · ")}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
