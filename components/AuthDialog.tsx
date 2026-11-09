"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Dialog } from "./Dialog";
import { IconEye, IconEyeOff } from "./icons";
import { ApiError, loadAuthConfig } from "@/lib/api";

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

/** Google OAuth plus email sign-up and sign-in. */
export function AuthDialog({
  open,
  ownerKey,
  reason,
  onClose,
  onRegister,
  onLogin,
  onAuthenticated,
}: {
  open: boolean;
  ownerKey: string;
  reason?: string;
  onClose: () => void;
  onRegister: (input: { email: string; name: string; password: string }) => Promise<unknown>;
  onLogin: (input: { email: string; password: string }) => Promise<unknown>;
  onAuthenticated?: () => void;
}) {
  const [failure, setFailure] = useState("");
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const openedAsSignIn = /^sign in/i.test(reason || "");
  const [mode, setMode] = useState<"signup" | "login">(openedAsSignIn ? "login" : "signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const title =
    mode === "login"
      ? "Welcome back"
      : openedAsSignIn
        ? "Welcome back"
        : "Get started with CV Matters";

  const subtitle =
    mode === "login"
      ? reason && !/^sign in/i.test(reason)
        ? reason
        : "Sign in with email or Google."
      : reason && !openedAsSignIn
        ? reason
        : "Create an account with email or Google.";

  useEffect(() => {
    if (!open) return;
    setFailure("");
    setEmail("");
    setName("");
    setPassword("");
    setMode(openedAsSignIn ? "login" : "signup");
    loadAuthConfig()
      .then((config) => setGoogleReady(config.google))
      .catch(() => setGoogleReady(false));
  }, [open, openedAsSignIn]);

  const startGoogle = () => {
    if (!googleReady) {
      setFailure("Google sign-in is not configured on this server yet.");
      return;
    }
    const query = ownerKey ? `?ownerKey=${encodeURIComponent(ownerKey)}` : "";
    window.location.assign(`/backend/api/auth/google${query}`);
  };

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    setFailure("");
    setBusy(true);
    try {
      if (mode === "signup") {
        await onRegister({ email: email.trim(), name: name.trim(), password });
      } else {
        await onLogin({ email: email.trim(), password });
      }
      onAuthenticated?.();
      onClose();
    } catch (reason) {
      if (reason instanceof ApiError) setFailure(reason.message);
      else setFailure("Couldn't complete that. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} width={440} className="auth-modal" title={title} subtitle={subtitle}>
      <div className="modal-body auth-body">
        <div className="auth-providers">
          <button
            type="button"
            className="auth-provider"
            disabled={googleReady !== null && !googleReady}
            onClick={startGoogle}
          >
            <span className="auth-mark">
              <GoogleMark />
            </span>
            Continue with Google
          </button>
        </div>

        <p className="auth-or" aria-hidden="true">
          or
        </p>

        <form className="auth-email-form" onSubmit={(event) => void submitEmail(event)}>
          {mode === "signup" ? (
            <label className="auth-field">
              <span>Name</span>
              <input
                className="auth-input"
                type="text"
                autoComplete="name"
                placeholder="How should we address you?"
                value={name}
                disabled={busy}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          ) : null}
          <label className="auth-field">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              disabled={busy}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <div className="auth-pass-wrap">
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                value={password}
                disabled={busy}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="auth-pass-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={busy}
                onClick={() => setShowPassword((on) => !on)}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </label>
          <button type="submit" className="btn-cta" disabled={busy || !email.trim() || !password || (mode === "signup" && !name.trim())}>
            {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")}>
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button type="button" onClick={() => setMode("signup")}>
                Create an account
              </button>
            </>
          )}
        </p>

        {failure ? <p className="form-alert">{failure}</p> : null}

        <p className="auth-legal">By continuing, you create or sign in to your CV Matters account.</p>
      </div>
    </Dialog>
  );
}
