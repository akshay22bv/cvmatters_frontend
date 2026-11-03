"use client";

import { useEffect, useState } from "react";
import { Dialog } from "./Dialog";
import { Field } from "./Field";
import { IconLock, IconUser } from "./icons";
import { ApiError } from "@/lib/api";
import type { AccountState } from "@/lib/useAccount";
import type { Entitlement } from "@/lib/types";

type Mode = "signup" | "signin";
type Step = "choose" | "email";
type ProviderId = "google" | "facebook" | "apple";

const PROVIDERS: { id: ProviderId; label: string }[] = [
  { id: "google", label: "Continue with Google" },
  { id: "facebook", label: "Continue with Facebook" },
  { id: "apple", label: "Continue with Apple" },
];

function emailProblem(value: string) {
  if (!value.trim()) return "Enter your email.";
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim())) return "That doesn't look like an email address.";
  return "";
}

function passwordProblem(value: string) {
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[a-z]/i.test(value)) return "Include at least one letter.";
  if (!/\d/.test(value)) return "Include at least one number.";
  return "";
}

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

function FacebookMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z" />
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
  if (id === "google") return <GoogleMark />;
  if (id === "facebook") return <FacebookMark />;
  return <AppleMark />;
}

/** Signup and sign-in share one panel; `reason` says why we interrupted. */
export function AuthDialog({
  open,
  account,
  reason,
  onClose,
  onDone,
}: {
  open: boolean;
  account: AccountState;
  reason?: string;
  onClose: () => void;
  onDone?: (entitlement: Entitlement) => void;
}) {
  const [mode, setMode] = useState<Mode>("signup");
  const [step, setStep] = useState<Step>("choose");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [badField, setBadField] = useState("");
  const [notice, setNotice] = useState("");

  const signingUp = mode === "signup";
  const choosing = step === "choose";
  const nameError = signingUp && touched.name && !name.trim() ? "Tell us what to call you." : "";
  const emailError = (touched.email && emailProblem(email)) || (badField === "email" ? failure : "");
  const passwordError =
    (signingUp && touched.password && passwordProblem(password)) || (badField === "password" ? failure : "");

  useEffect(() => {
    if (!open) return;
    const startAsSignIn = /^sign in/i.test(reason || "");
    setMode(startAsSignIn ? "signin" : "signup");
    setStep("choose");
    setName("");
    setEmail("");
    setPassword("");
    setTouched({});
    setFailure("");
    setBadField("");
    setNotice("");
    setBusy(false);
  }, [open, reason]);

  const resetProblems = () => {
    setTouched({});
    setFailure("");
    setBadField("");
    setNotice("");
  };

  const swapMode = () => {
    setMode(signingUp ? "signin" : "signup");
    setStep("choose");
    resetProblems();
  };

  const continueWithEmail = () => {
    if (emailProblem(email)) {
      setTouched((current) => ({ ...current, email: true }));
      return;
    }
    setNotice("");
    setStep("email");
  };

  const submit = async () => {
    const problems = signingUp
      ? { name: !name.trim(), email: !!emailProblem(email), password: !!passwordProblem(password) }
      : { email: !!emailProblem(email), password: !password };
    if (Object.values(problems).some(Boolean)) {
      setTouched({ name: true, email: true, password: true });
      return;
    }

    setBusy(true);
    setFailure("");
    setBadField("");
    try {
      const entitlement = signingUp
        ? await account.register({ name: name.trim(), email: email.trim(), password })
        : await account.login({ email: email.trim(), password });
      onDone?.(entitlement);
    } catch (reason_) {
      const error = reason_ as ApiError;
      setFailure(error?.message || "That didn't work. Try again.");
      setBadField(error instanceof ApiError ? error.field : "");
    } finally {
      setBusy(false);
    }
  };

  const title = choosing
    ? signingUp
      ? "Get started with CV Matters"
      : "Welcome back"
    : signingUp
      ? "Continue with email"
      : "Enter your password";

  const openedAsSignIn = /^sign in/i.test(reason || "");
  const fallback = signingUp
    ? "Create an account to save your resume."
    : "Sign in to pick up where you left off.";
  const subtitle = choosing
    ? signingUp !== openedAsSignIn && reason
      ? reason
      : fallback
    : email.trim();

  return (
    <Dialog open={open} onClose={onClose} width={440} className="auth-modal" title={title} subtitle={subtitle}>
      <form
        className="modal-body auth-body"
        onSubmit={(event) => {
          event.preventDefault();
          if (choosing) continueWithEmail();
          else void submit();
        }}
      >
        {choosing ? (
          <>
            <p className="auth-switch">
              {signingUp ? "Already have an account?" : "New here?"}{" "}
              <button type="button" onClick={swapMode}>
                {signingUp ? "Log in" : "Create an account"}
              </button>
            </p>

            <div className="auth-providers">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  className="auth-provider"
                  onClick={() =>
                    setNotice(`${provider.label.replace("Continue with ", "")} sign-in isn't connected yet. Continue with email.`)
                  }
                >
                  <span className="auth-mark">
                    <ProviderMark id={provider.id} />
                  </span>
                  {provider.label}
                </button>
              ))}
            </div>

            {notice ? <p className="auth-note">{notice}</p> : null}

            <p className="auth-or">or</p>

            <div className={emailError ? "auth-email-wrap is-bad" : "auth-email-wrap"}>
              <input
                className="auth-email"
                type="email"
                value={email}
                autoComplete="email"
                placeholder="Email"
                aria-label="Email"
                aria-invalid={emailError ? true : undefined}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (badField === "email") setBadField("");
                }}
              />
              {emailError ? <p className="auth-error">{emailError}</p> : null}
            </div>

            <button type="submit" className="btn-cta">
              Continue with Email
            </button>

            <p className="auth-legal">
              {signingUp
                ? "By continuing, you create a CV Matters account."
                : "By continuing, you sign in to your CV Matters account."}
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              className="auth-back"
              onClick={() => {
                setStep("choose");
                resetProblems();
              }}
            >
              All sign-in options
            </button>

            {signingUp ? (
              <Field
                label="Your name"
                value={name}
                icon={<IconUser />}
                autoComplete="name"
                placeholder="Alex Rivera"
                error={nameError}
                onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                onChange={setName}
              />
            ) : null}

            <Field
              label="Password"
              type="password"
              value={password}
              icon={<IconLock />}
              autoComplete={signingUp ? "new-password" : "current-password"}
              placeholder={signingUp ? "At least 8 characters" : "Your password"}
              hint={signingUp ? "Letters and numbers, 8 or more." : undefined}
              error={passwordError}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              onChange={(value) => {
                setPassword(value);
                if (badField === "password") setBadField("");
              }}
            />

            {failure && !badField ? <p className="form-alert">{failure}</p> : null}

            <button type="submit" className="btn-cta" disabled={busy}>
              {busy ? "One moment…" : signingUp ? "Create account" : "Sign in"}
            </button>

            <p className="auth-switch">
              {signingUp ? "Already have an account?" : "New here?"}{" "}
              <button type="button" onClick={swapMode}>
                {signingUp ? "Log in" : "Create an account"}
              </button>
            </p>
          </>
        )}
      </form>
    </Dialog>
  );
}
