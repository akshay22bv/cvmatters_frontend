"use client";

import { useEffect, useState } from "react";
import { Dialog } from "./Dialog";
import { loadAuthConfig } from "@/lib/api";

type ProviderId = "google" | "apple";

const PROVIDERS: { id: ProviderId; label: string }[] = [
  { id: "google", label: "Continue with Google" },
  { id: "apple", label: "Continue with Apple" },
];

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.05 9.52c-.02-2.16 1.76-3.2 1.84-3.25-1-.47-2.04-.5-2.47-.51-1.05-.11-2.05.62-2.59.62-.53 0-1.36-.6-2.24-.59-1.15.02-2.21.67-2.8 1.7-1.2 2.08-.3 5.16.86 6.85.57.83 1.25 1.76 2.14 1.73.86-.03 1.18-.55 2.22-.55s1.33.55 2.24.53c.93-.02 1.51-.84 2.08-1.67.65-.96.92-1.89.94-1.94-.02-.01-1.8-.69-1.82-2.74ZM11.2 4.48c.47-.57.79-1.36.7-2.15-.68.03-1.5.45-1.98 1.02-.44.5-.82 1.31-.72 2.08.76.06 1.53-.39 2-.95Z"
      />
    </svg>
  );
}

function ProviderMark({ id }: { id: ProviderId }) {
  return id === "google" ? <GoogleMark /> : <AppleMark />;
}

/** Sign up and sign-in: Google and Apple only. */
export function AuthDialog({
  open,
  ownerKey,
  reason,
  onClose,
}: {
  open: boolean;
  ownerKey: string;
  reason?: string;
  onClose: () => void;
}) {
  const [failure, setFailure] = useState("");
  const [providers, setProviders] = useState<{ google: boolean; apple: boolean } | null>(null);

  const openedAsSignIn = /^sign in/i.test(reason || "");
  const title = openedAsSignIn ? "Welcome back" : "Get started with CV Matters";
  const subtitle = openedAsSignIn
    ? reason && !/^sign in/i.test(reason)
      ? reason
      : "Sign in to pick up where you left off."
    : reason && !openedAsSignIn
      ? reason
      : "Create an account to download your resume.";

  useEffect(() => {
    if (!open) return;
    setFailure("");
    loadAuthConfig()
      .then(setProviders)
      .catch(() => setProviders({ google: false, apple: false }));
  }, [open]);

  const start = (id: ProviderId) => {
    const ready = providers?.[id];
    if (!ready) {
      setFailure(`${id === "google" ? "Google" : "Apple"} sign-in is not configured on this server yet.`);
      return;
    }
    const query = ownerKey ? `?ownerKey=${encodeURIComponent(ownerKey)}` : "";
    window.location.assign(`/backend/api/auth/${id}${query}`);
  };

  return (
    <Dialog open={open} onClose={onClose} width={440} className="auth-modal" title={title} subtitle={subtitle}>
      <div className="modal-body auth-body">
        <div className="auth-providers">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className="auth-provider"
              disabled={providers !== null && !providers[provider.id]}
              onClick={() => start(provider.id)}
            >
              <span className="auth-mark">
                <ProviderMark id={provider.id} />
              </span>
              {provider.label}
            </button>
          ))}
        </div>

        {failure ? <p className="form-alert">{failure}</p> : null}

        <p className="auth-legal">By continuing, you create or sign in to your CV Matters account.</p>
      </div>
    </Dialog>
  );
}
