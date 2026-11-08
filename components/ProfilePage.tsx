"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckRow } from "./Field";
import { Monogram } from "./Monogram";
import { Stars } from "./Stars";
import { useConfirm } from "./ConfirmProvider";
import { Trash } from "./icons";
import { ApiError, createResume, deleteResume, listResumes, loadBilling, updateHosting } from "@/lib/api";
import { publicResumePath } from "@/lib/paths";
import type { AccountState } from "@/lib/useAccount";
import type { Category, RatingSummary, ResumeData, ResumeRecord } from "@/lib/types";

function suggestSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 24);
}

function linkHref(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
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
  onPreviewCv,
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
  onPreviewCv: (record: ResumeRecord) => void;
}) {
  const name = data.personal.fullName.trim() || account.user?.name || "Your name";
  const title = data.personal.title.trim() || "Add a job title on your CV";
  const likes = rating?.count || 0;
  const average = rating?.average || 0;
  const planName = account.entitlement.subscription?.plan || null;

  const [draft, setDraft] = useState(slug || suggestSlug(name) || "");
  const [hosting, setHosting] = useState(isPublic);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [orders, setOrders] = useState<{ id: string; plan: string; amount: number; status: string; createdAt: string }[]>([]);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const confirm = useConfirm();

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

  const websites = useMemo(() => {
    const rows: { label: string; href: string }[] = [];
    const push = (label: string, value: string) => {
      const href = linkHref(value);
      if (href) rows.push({ label, href });
    };
    push("Website", data.personal.website);
    push("Portfolio", data.personal.portfolio);
    push("LinkedIn", data.personal.linkedin);
    push("GitHub", data.personal.github);
    return rows;
  }, [data.personal]);

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
    const rowTitle = resumes.find((item) => item.id === id)?.data.personal.fullName.trim() || "this CV";
    const ok = await confirm({
      title: "Delete CV",
      message: `Delete “${rowTitle}”? This can't be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
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

      <header className="prof-hero prof-card">
        <div className="prof-hero-main">
          <Monogram name={name} photoUrl={data.personal.photoUrl} size={88} />
          <div className="prof-hero-body">
            <p className="prof-kicker">Your profile</p>
            <h1>{name}</h1>
            <p className="prof-title">{title}</p>
            {data.personal.email ? (
              <a className="prof-hero-email" href={`mailto:${data.personal.email}`}>
                {data.personal.email}
              </a>
            ) : null}
            <div className="prof-hero-actions">
              <Link href="/cv/details" className="prof-btn is-primary">
                Edit CV
              </Link>
              {isPublic && publicPath ? (
                <Link href={publicPath} className="prof-btn">
                  View resume
                </Link>
              ) : (
                <a href="#prof-public" className="prof-btn">
                  Set up sharing
                </a>
              )}
              {account.user ? (
                <button type="button" className="prof-btn is-ghost" onClick={onShare}>
                  Sharing
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="prof-hero-aside" aria-label="Profile details">
          <div className="prof-meta-row">
            <span>Plan</span>
            <strong>{planName ? planName.replace(/^\w/, (c) => c.toUpperCase()) : "Free"}</strong>
            <em className={account.entitlement.canDownload ? "prof-pill is-on" : "prof-pill"}>
              {account.entitlement.canDownload ? "Downloads on" : "Upgrade for PDF"}
            </em>
          </div>
          {data.personal.location ? (
            <div className="prof-meta-row">
              <span>Location</span>
              <strong>{data.personal.location}</strong>
            </div>
          ) : null}
          <div className="prof-meta-row">
            <span>Field</span>
            <strong>{category}</strong>
          </div>
          <div className="prof-meta-row">
            <span>Rating</span>
            <div className="prof-meta-rating">
              <strong>{average ? average.toFixed(1) : "—"}</strong>
              <Stars value={average} count={likes} size={12} />
            </div>
          </div>
          <div className="prof-meta-row">
            <span>CVs saved</span>
            <strong>{resumes.length}</strong>
          </div>
          {websites.length ? (
            <div className="prof-socials">
              {websites.map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer noopener" title={item.label}>
                  {item.label.slice(0, 1)}
                </a>
              ))}
            </div>
          ) : null}
        </aside>
      </header>

      <div className="prof-manage">
        <section className="prof-card prof-card-block">
          <header className="prof-block-head">
            <h2 className="prof-card-title">Your CVs</h2>
            <p>Switch between resumes or start a fresh one.</p>
          </header>
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
              const rowTitle = item.data.personal.fullName.trim() || "Untitled";
              const role = item.data.personal.title.trim() || "No job title";
              const current = item.id === resumeId;
              return (
                <li key={item.id} className={current ? "prof-cv is-current" : "prof-cv"}>
                  <div className="prof-cv-copy">
                    <strong>
                      {rowTitle}
                      {current ? <em className="prof-cv-active">Active</em> : null}
                    </strong>
                    <span>
                      {role} · {item.category}
                      {item.slug ? ` · /${item.slug}` : ""}
                    </span>
                  </div>
                  <div className="prof-cv-acts">
                    <button type="button" className="prof-btn is-primary" onClick={() => onPreviewCv(item)}>
                      View
                    </button>
                    <button
                      type="button"
                      className="prof-cv-del"
                      aria-label={`Delete ${rowTitle}`}
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

        <div className="prof-manage-split">
          <section className="prof-card prof-card-block" id="prof-public">
            <header className="prof-block-head">
              <h2 className="prof-card-title">Public page</h2>
              <p>Choose a username and share one link to your CV.</p>
            </header>

            <div className="prof-host-fields">
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
              <CheckRow
                className="prof-host-check"
                label="Anyone with the link can view and rate this CV"
                checked={hosting}
                disabled={busy || !resumeId}
                onChange={setHosting}
              />
            </div>

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

          {orders.length > 0 ? (
            <section className="prof-card prof-card-block">
              <header className="prof-block-head">
                <h2 className="prof-card-title">Billing</h2>
                <p>Recent purchases.</p>
              </header>
              <ul className="prof-orders prof-bill-list">
                {orders.slice(0, 4).map((order) => (
                  <li key={order.id}>
                    <strong>{order.plan}</strong>
                    <span>{order.status}</span>
                    <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="prof-card prof-card-block prof-card-muted">
              <header className="prof-block-head">
                <h2 className="prof-card-title">Billing</h2>
                <p className="prof-note">Subscription receipts show up here after you upgrade.</p>
              </header>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
