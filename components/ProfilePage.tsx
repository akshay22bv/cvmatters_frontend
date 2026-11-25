"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckRow } from "./Field";
import { Monogram } from "./Monogram";
import { useConfirm } from "./ConfirmProvider";
import { Trash } from "./icons";
import { ApiError, createResume, deleteResume, listResumes, loadBilling, updateHosting } from "@/lib/api";
import { loginPath, publicResumePath, startPath } from "@/lib/paths";
import type { AccountState } from "@/lib/useAccount";
import type { Category, RatingSummary, ResumeData, ResumeRecord } from "@/lib/types";

const SLUG_MIN_LEN = 5;
const SLUG_MAX_LEN = 24;

function normalizeSlugDraft(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function suggestSlug(name: string) {
  return normalizeSlugDraft(name).slice(0, SLUG_MAX_LEN);
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
  backHref,
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
  /** When set, top back link returns to this CV step instead of the start flow. */
  backHref?: string;
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
  const downloadsOn = account.entitlement.canDownload;
  const freeCvLimit = 2;

  const [draft, setDraft] = useState(slug || suggestSlug(name) || "");
  const [hosting, setHosting] = useState(isPublic);
  const [hostCvId, setHostCvId] = useState<string | null>(resumeId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [orders, setOrders] = useState<{ id: string; plan: string; amount: number; status: string; createdAt: string }[]>([]);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const confirm = useConfirm();
  const router = useRouter();
  const atCvLimit = !downloadsOn && resumes.length >= freeCvLimit;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await account.logout();
      try {
        sessionStorage.removeItem("cv-matters-active");
      } catch {
        /* ignore storage errors */
      }
      router.push("/");
    } finally {
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!ownerKey) return;
    let cancelled = false;
    listResumes(ownerKey)
      .then((rows) => {
        if (cancelled) return;
        setResumes(rows);
        const linked = rows.find((item) => item.isPublic && item.slug) || rows.find((item) => item.slug) || rows.find((item) => item.id === resumeId);
        setHostCvId(linked?.id || resumeId);
        setDraft(linked?.slug || slug || "");
        setHosting(Boolean(linked?.isPublic ?? isPublic));
      })
      .catch(() => {
        if (!cancelled) {
          setResumes([]);
          setHostCvId(resumeId);
          setDraft(slug || "");
          setHosting(isPublic);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ownerKey, resumeId, slug, isPublic, account.user?.id]);

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

  const accountSlug =
    resumes.find((item) => item.isPublic && item.slug)?.slug ||
    resumes.find((item) => item.slug)?.slug ||
    slug ||
    "";
  const liveSlug = accountSlug.trim();
  const publicPath = liveSlug ? publicResumePath(liveSlug) : null;
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const publicUrl = publicPath ? `${origin || ""}${publicPath}` : "";
  const savedPublic = Boolean(
    resumes.find((item) => item.id === hostCvId)?.isPublic ?? (hostCvId === resumeId ? isPublic : false),
  );

  const previewSlug = useMemo(() => {
    return draft.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "your-name";
  }, [draft]);
  const previewUrl = `${origin}/${previewSlug}`;

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

  const selectHostCv = (id: string) => {
    if (!resumes.some((item) => item.id === id)) return;
    setHostCvId(id);
    setError("");
  };

  const saveHosting = async () => {
    const targetId = hostCvId || resumeId;
    if (!targetId || !ownerKey) {
      setError("Create a CV first, then come back to host it.");
      return;
    }
    if (!account.user) {
      setError("Sign in to host a public page.");
      return;
    }
    const slugDraft = normalizeSlugDraft(draft);
    if (slugDraft && slugDraft.length < SLUG_MIN_LEN) {
      setError("Unique id must be at least 5 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const saved = await updateHosting(targetId, {
        ownerKey,
        isPublic: hosting,
        slug: slugDraft || null,
      });
      const rows = await listResumes(ownerKey);
      setResumes(rows);
      const active = rows.find((item) => item.id === resumeId);
      onSaved({
        slug: active?.slug || (saved.id === resumeId ? saved.slug : null) || null,
        isPublic: active ? active.isPublic : saved.id === resumeId ? saved.isPublic : false,
      });
    } catch (reason) {
      if (reason instanceof ApiError) setError(reason.message);
      else setError(reason instanceof Error ? reason.message : "Couldn't save that.");
    } finally {
      setBusy(false);
    }
  };

  const goStartPage = () => {
    if (!downloadsOn && resumes.length >= freeCvLimit) {
      setError(`Free plan includes ${freeCvLimit} CVs. Upgrade to create more.`);
      onPlans();
      return;
    }
    router.push(startPath("choose"));
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

  const shareStatus = savedPublic && publicPath ? "Live" : hosting ? "Ready to publish" : "Private";

  return (
    <div className="prof">
      <div className="prof-top">
        <Link href={backHref || (resumeId ? "/cv/details" : startPath("choose"))} className="prof-back">
          {resumeId || backHref ? "← Back to CV" : "← Start a CV"}
        </Link>
        <div className="prof-top-acts">
          {!downloadsOn ? (
            <button type="button" className="prof-linkish" onClick={onPlans}>
              Upgrade plan
            </button>
          ) : null}
          {account.user ? (
            <button
              type="button"
              className="prof-linkish is-danger"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="prof-pagehead">
        <div className="prof-pagehead-copy">
          <h1 className="prof-page-title">
            Account
            <em className="prof-badge">You</em>
          </h1>
          <p className="prof-page-lead">Manage your CVs, public link, and plan in one place.</p>
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
          </div>
          <div className="prof-hero-actions prof-banner-actions">
            {account.user ? (
              <button type="button" className="prof-btn is-soft" onClick={onShare}>
                Sharing settings
              </button>
            ) : (
              <button type="button" className="prof-btn is-soft" onClick={() => router.push(loginPath("/profile"))}>
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
      </header>

      <div className="prof-manage">
        <section className="prof-card prof-card-block">
          <header className="prof-block-head">
            <div>
              <h2 className="prof-card-title">Your CVs</h2>
              {!downloadsOn ? <p>Free plan includes {freeCvLimit} CVs. Upgrade for unlimited resumes.</p> : null}
            </div>
            {atCvLimit ? (
              <button type="button" className="prof-btn is-primary" onClick={onPlans}>
                Upgrade for more
              </button>
            ) : (
              <button type="button" className="prof-btn is-primary" onClick={goStartPage}>
                New CV
              </button>
            )}
          </header>
          {error && (error.includes("CV") || error.includes("Upgrade") || error.includes("create")) ? (
            <p className="prof-error">{error}</p>
          ) : null}

          <ul className="prof-cvs">
            {!resumes.length ? (
              <li>
                <button type="button" className="prof-start" onClick={goStartPage}>
                  <span className="prof-start-icon" aria-hidden="true">
                    +
                  </span>
                  <span className="prof-start-copy">
                    <strong>Start a blank CV</strong>
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
                    <div className="prof-cv-head">
                      <strong>{rowTitle}</strong>
                      {current ? <em className="prof-cv-active">Active</em> : null}
                    </div>
                    <span>
                      {role}
                      {item.isPublic && item.slug ? (
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
                    <button type="button" className="prof-btn" onClick={() => onUse(item)}>
                      Open
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
        </section>

        <div className="prof-manage-split">
          <section className="prof-card prof-card-block" id="prof-public">
            <header className="prof-block-head">
              <div>
                <h2 className="prof-card-title">Public link</h2>
              </div>
              <em className={savedPublic && publicPath ? "prof-pill is-on" : "prof-pill"}>{shareStatus}</em>
            </header>

            <div className="prof-host-fields">
              <label className="prof-user">
                <span>Username</span>
                <input
                  className="prof-username"
                  value={draft}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  minLength={SLUG_MIN_LEN}
                  maxLength={SLUG_MAX_LEN}
                  placeholder="Enter unique id"
                  disabled={busy || !(hostCvId || resumeId)}
                  onChange={(event) => setDraft(event.target.value.toLowerCase())}
                />
                <span className="prof-field-hint">5–24 characters, letters and numbers</span>
              </label>
              <p className="prof-url">
                <a href={previewUrl} target="_blank" rel="noreferrer noopener">
                  {previewUrl.replace(/^https?:\/\//, "")}
                </a>
              </p>
              {resumes.length > 1 ? (
                <label className="prof-user">
                  <span>CV to show on this link</span>
                  <select
                    className="prof-select"
                    value={hostCvId || ""}
                    disabled={busy}
                    onChange={(event) => selectHostCv(event.target.value)}
                  >
                    {resumes.map((item) => {
                      const rowTitle = item.data.personal.fullName.trim() || "Untitled";
                      const role = item.data.personal.title.trim() || "No job title";
                      return (
                        <option key={item.id} value={item.id}>
                          {rowTitle} — {role}
                          {item.id === resumeId ? " (active)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </label>
              ) : null}
              <CheckRow
                className="prof-host-check"
                label="Make this link public — anyone with it can view and rate the CV"
                checked={hosting}
                disabled={busy || !(hostCvId || resumeId)}
                onChange={setHosting}
              />
            </div>

            {!account.user ? (
              <p className="rate-gate">
                Sign in to publish a public page.{" "}
                <button type="button" onClick={() => router.push(loginPath("/profile"))}>
                  Sign in
                </button>
              </p>
            ) : error ? (
              <p className="prof-error">{error}</p>
            ) : null}

            <div className="prof-host-acts">
              <button
                type="button"
                className="prof-btn is-primary"
                disabled={busy || !(hostCvId || resumeId)}
                onClick={() => void saveHosting()}
              >
                {busy ? "Saving…" : "Save link"}
              </button>
              {savedPublic && publicPath ? (
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
                <div className="prof-inline-cta">
                  <button type="button" className="prof-btn is-primary" onClick={onPlans}>
                    See plans
                  </button>
                </div>
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
