"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckRow } from "./Field";
import { Monogram } from "./Monogram";
import { useConfirm } from "./ConfirmProvider";
import { IconCard, IconEye, IconPage, Trash } from "./icons";
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

function planLabel(plan: string | null) {
  if (!plan) return "Free";
  return plan.replace(/^\w/, (c) => c.toUpperCase());
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
  onSignIn,
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
  onSignIn: () => void;
  onSaved: (next: { slug: string | null; isPublic: boolean }) => void;
  onUse: (record: ResumeRecord) => void;
  onPreviewCv: (record: ResumeRecord) => void;
}) {
  const name = data.personal.fullName.trim() || account.user?.name || "Your name";
  const title = data.personal.title.trim() || "Add a job title on your CV";
  const likes = rating?.count || 0;
  const average = rating?.average || 0;
  const planName = account.entitlement.subscription?.plan || null;
  const downloadsOn = account.entitlement.canDownload;
  const freeCvLimit = 2;

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
  const atCvLimit = !downloadsOn && resumes.length >= freeCvLimit;

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
  const hostPrefix = origin ? `${origin.replace(/^https?:\/\//, "")}/` : "/";

  const previewSlug = useMemo(() => {
    return draft.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "your-name";
  }, [draft]);

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
    if (!downloadsOn && resumes.length >= freeCvLimit) {
      setError(`Free plan includes ${freeCvLimit} CVs. Upgrade to create more.`);
      onPlans();
      return;
    }
    setCreating(true);
    setError("");
    try {
      const created = await createResume(ownerKey);
      onUse(created);
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === "upgrade") {
        setError(reason.message);
        onPlans();
      } else {
        setError(reason instanceof Error ? reason.message : "Couldn't create another CV.");
      }
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

  const shareStatus = isPublic && publicPath ? "Live" : hosting ? "Ready to publish" : "Private";

  return (
    <div className="prof">
      <div className="prof-top">
        <Link href="/cv/details" className="prof-back">
          ← Back to CV
        </Link>
        {!downloadsOn ? (
          <button type="button" className="prof-linkish" onClick={onPlans}>
            Upgrade plan
          </button>
        ) : null}
      </div>

      <div className="prof-pagehead">
        <div className="prof-pagehead-copy">
          <h1 className="prof-page-title">
            Account
            <em className="prof-badge">You</em>
          </h1>
          <p className="prof-page-lead">Manage your CVs, public link, and plan in one place.</p>
        </div>
        <div className="prof-pagehead-acts">
          <Link href="/cv/details" className="prof-btn is-primary">
            Edit CV
          </Link>
          {isPublic && publicPath ? (
            <Link href={publicPath} className="prof-btn">
              View live page
            </Link>
          ) : (
            <a href="#prof-public" className="prof-btn">
              Set up link
            </a>
          )}
        </div>
      </div>

      <header className="prof-banner">
        <div className="prof-banner-glow" aria-hidden="true" />
        <div className="prof-banner-main">
          <Monogram name={name} photoUrl={data.personal.photoUrl} size={84} />
          <div className="prof-banner-copy">
            <p className="prof-kicker">Profile</p>
            <h2>{name}</h2>
            <p className="prof-title">{title}</p>
            {data.personal.email ? (
              <a className="prof-hero-email" href={`mailto:${data.personal.email}`}>
                {data.personal.email}
              </a>
            ) : null}
            {data.personal.location ? <p className="prof-banner-meta">{data.personal.location}</p> : null}
            <div className="prof-hero-actions">
              {account.user ? (
                <button type="button" className="prof-btn is-soft" onClick={onShare}>
                  Sharing settings
                </button>
              ) : (
                <button type="button" className="prof-btn is-soft" onClick={onSignIn}>
                  Sign in
                </button>
              )}
              {websites.map((item) => (
                <a
                  key={item.label}
                  className="prof-btn is-soft"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="prof-banner-cards" aria-label="Quick facts">
          <article className="prof-glass">
            <span className="prof-glass-icon" aria-hidden="true">
              <IconCard />
            </span>
            <strong>{planLabel(planName)}</strong>
            <small>{downloadsOn ? "PDF downloads included" : "Upgrade for PDF downloads"}</small>
          </article>
          <article className="prof-glass">
            <span className="prof-glass-icon" aria-hidden="true">
              <IconPage />
            </span>
            <strong>
              {resumes.length} CV{resumes.length === 1 ? "" : "s"}
            </strong>
            <small>{category} focus</small>
          </article>
          <article className="prof-glass">
            <span className="prof-glass-icon" aria-hidden="true">
              <IconEye />
            </span>
            <strong>{shareStatus}</strong>
            <small>
              {average ? `${average.toFixed(1)} ★ · ${likes} rating${likes === 1 ? "" : "s"}` : "No ratings yet"}
            </small>
          </article>
        </div>
      </header>

      <div className="prof-manage">
        <section className="prof-card prof-card-block">
          <header className="prof-block-head">
            <div>
              <h2 className="prof-card-title">Your CVs</h2>
              <p>
                {downloadsOn
                  ? "Open a resume to edit, or start a blank one for another role."
                  : `Free plan includes ${freeCvLimit} CVs. Upgrade for unlimited resumes.`}
              </p>
            </div>
            {atCvLimit ? (
              <button type="button" className="prof-btn is-primary" onClick={onPlans}>
                Upgrade for more
              </button>
            ) : (
              <button type="button" className="prof-btn is-primary" disabled={creating} onClick={() => void startNewCv()}>
                {creating ? "Creating…" : "New CV"}
              </button>
            )}
          </header>
          {error && (error.includes("CV") || error.includes("Upgrade") || error.includes("create")) ? (
            <p className="prof-error">{error}</p>
          ) : null}

          <ul className="prof-cvs">
            {!resumes.length ? (
              <li>
                <button type="button" className="prof-start" disabled={creating} onClick={() => void startNewCv()}>
                  <span className="prof-start-icon" aria-hidden="true">
                    +
                  </span>
                  <span className="prof-start-copy">
                    <strong>{creating ? "Creating…" : "Start a blank CV"}</strong>
                    <small>Fresh resume · saved to your account</small>
                  </span>
                </button>
              </li>
            ) : null}
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
                      {role}
                      {item.slug ? (
                        <>
                          <span className="prof-cv-dot" aria-hidden="true">
                            ·
                          </span>
                          /{item.slug}
                        </>
                      ) : null}
                    </span>
                  </div>
                  <div className="prof-cv-acts">
                    <button type="button" className="prof-btn is-primary" onClick={() => onPreviewCv(item)}>
                      Preview
                    </button>
                    {!current ? (
                      <button type="button" className="prof-btn" onClick={() => onUse(item)}>
                        Open
                      </button>
                    ) : null}
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
        </section>

        <div className="prof-manage-split">
          <section className="prof-card prof-card-block" id="prof-public">
            <header className="prof-block-head">
              <div>
                <h2 className="prof-card-title">Public link</h2>
                <p>Choose a short username. Share one link so people can view and rate your CV.</p>
              </div>
              <em className={isPublic && publicPath ? "prof-pill is-on" : "prof-pill"}>{shareStatus}</em>
            </header>

            <div className="prof-host-fields">
              <label className="prof-user">
                <span>Username</span>
                <div className="prof-slug">
                  <span className="prof-slug-prefix">{hostPrefix}</span>
                  <input
                    value={draft}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    placeholder={suggestSlug(name) || "your-name"}
                    disabled={busy || !resumeId}
                    onChange={(event) => setDraft(event.target.value.toLowerCase())}
                  />
                </div>
              </label>
              <p className="prof-preview">
                Preview: {origin}/{previewSlug}
              </p>
              <CheckRow
                className="prof-host-check"
                label="Make this CV public — anyone with the link can view and rate it"
                checked={hosting}
                disabled={busy || !resumeId}
                onChange={setHosting}
              />
            </div>

            {!account.user ? (
              <p className="rate-gate">
                Sign in to publish a public page.{" "}
                <button type="button" onClick={onSignIn}>
                  Sign in
                </button>
              </p>
            ) : error ? (
              <p className="prof-error">{error}</p>
            ) : null}

            <div className="prof-host-acts">
              <button type="button" className="prof-btn is-primary" disabled={busy || !resumeId} onClick={() => void saveHosting()}>
                {busy ? "Saving…" : "Save link"}
              </button>
              {isPublic && publicPath ? (
                <>
                  <button type="button" className="prof-btn" onClick={() => void copyLink()}>
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <Link href={publicPath} className="prof-btn">
                    Open page
                  </Link>
                </>
              ) : null}
            </div>
          </section>

          {orders.length > 0 ? (
            <section className="prof-card prof-card-block">
              <header className="prof-block-head">
                <div>
                  <h2 className="prof-card-title">Billing</h2>
                  <p>Recent purchases and plan receipts.</p>
                </div>
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
            <section className="prof-card prof-card-block prof-upgrade">
              <header className="prof-block-head">
                <div>
                  <h2 className="prof-card-title">Billing</h2>
                  <p>Receipts appear here after you upgrade. Unlock PDF downloads and more when you need them.</p>
                </div>
              </header>
              {!downloadsOn ? (
                <button type="button" className="prof-btn is-primary" onClick={onPlans}>
                  See plans
                </button>
              ) : (
                <p className="prof-note">You&apos;re on a paid plan. New receipts show up after each purchase.</p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
