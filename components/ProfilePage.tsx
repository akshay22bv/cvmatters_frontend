"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Monogram } from "./Monogram";
import { Stars } from "./Stars";
import { ApiError, loadBilling, loadRatings, updateHosting } from "@/lib/api";
import { publicResumePath } from "@/lib/paths";
import type { AccountState } from "@/lib/useAccount";
import type { Category, RatingSummary, ResumeData } from "@/lib/types";

function suggestSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 24);
}

/**
 * Account hub styled like an OpenAI partner surface: quiet neutrals, green
 * accents, black CTAs. Users pick their own public username here.
 */
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

  useEffect(() => {
    setDraft(slug || suggestSlug(name) || "");
    setHosting(isPublic);
  }, [slug, isPublic, name]);

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
            Upgrade
          </button>
        ) : null}
      </div>

      <header className="prof-head">
        <Monogram name={name} photoUrl={data.personal.photoUrl} size={72} />
        <div className="prof-who">
          <p className="prof-kicker">Profile</p>
          <h1>{name}</h1>
          <p className="prof-title">{data.personal.title || "Add a job title on your CV"}</p>
          <p className="prof-meta">
            {[data.personal.location, category, hosting || isPublic ? "Public" : "Private"].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="prof-acts">
          <Link href="/cv/details" className="prof-btn is-primary">
            Edit CV
          </Link>
          {account.user ? (
            <button type="button" className="prof-btn" onClick={onShare}>
              Contact sharing
            </button>
          ) : null}
        </div>
      </header>

      <ul className="prof-stats">
        <li>
          <span>Plan</span>
          <strong>{planName ? planName.replace(/^\w/, (c) => c.toUpperCase()) : "Free"}</strong>
          <small>{account.entitlement.canDownload ? "Downloads unlocked" : "Upgrade to download PDFs"}</small>
        </li>
        <li>
          <span>Resumes</span>
          <strong>{resumeId ? "1" : "0"}</strong>
          <small>{resumeId ? "Current draft" : "Start from Home"}</small>
        </li>
        <li>
          <span>Rating</span>
          <strong>{average ? average.toFixed(1) : "—"}</strong>
          <Stars value={average} count={likes} size={13} />
        </li>
        <li>
          <span>Reviews</span>
          <strong>{likes}</strong>
          <small>{likes ? "From your public page" : "None yet"}</small>
        </li>
      </ul>

      <section className="prof-panel is-focus">
        <div className="prof-panel-copy">
          <h2>Your public link</h2>
          <p>Choose a short username. People open <code>yoursite.com/your-name</code> — not a long id.</p>
        </div>

        <label className="prof-slug">
          <span className="prof-slug-prefix">{origin}/</span>
          <input
            value={draft}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="your-name"
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
          <span>Make this page public so anyone with the link can view and rate it</span>
        </label>

        {error ? <p className="prof-error">{error}</p> : null}

        <div className="prof-host-acts">
          <button type="button" className="prof-btn is-primary" disabled={busy || !resumeId} onClick={() => void saveHosting()}>
            {busy ? "Saving…" : "Save username"}
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
        <section className="prof-panel">
          <div className="prof-panel-copy">
            <h2>Purchases</h2>
            <p>Plans on this account.</p>
          </div>
          <ul className="prof-orders">
            {orders.slice(0, 6).map((order) => (
              <li key={order.id}>
                <strong>{order.plan}</strong>
                <span>{order.status}</span>
                <small>{new Date(order.createdAt).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="prof-panel">
        <div className="prof-panel-copy">
          <h2>Reviews</h2>
          <p>What people wrote on your hosted resume.</p>
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
          <p className="prof-note">No written reviews yet.</p>
        )}
      </section>
    </div>
  );
}
