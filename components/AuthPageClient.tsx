"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconEye, IconEyeOff, Logo } from "./icons";
import {
  ApiError,
  loadAuthConfig,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  verifyPasswordResetOtp,
} from "@/lib/api";
import { safeNextPath } from "@/lib/paths";
import { useAccount } from "@/lib/useAccount";
import { SITE_NAME } from "@/lib/site";

function readOwnerKey(): string {
  try {
    const existing = localStorage.getItem("cv-matters-owner");
    if (existing && existing.length >= 8) return existing;
    const fresh = crypto.randomUUID ? crypto.randomUUID() : `owner-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("cv-matters-owner", fresh);
    return fresh;
  } catch {
    return "";
  }
}

type Mode = "login" | "signup" | "forgot" | "otp" | "reset";

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

export function AuthPageClient({ initialMode }: { initialMode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"), "/profile");
  const owner = useRef("");
  const account = useAccount(() => owner.current);

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    owner.current = readOwnerKey();
    loadAuthConfig()
      .then((cfg) => setGoogleReady(Boolean(cfg.google)))
      .catch(() => setGoogleReady(false));
  }, []);

  const switchMode = (next: Mode) => {
    setMode(next);
    setFailure("");
    setNotice("");
  };

  const googleStart = () => {
    const params = new URLSearchParams({
      ownerKey: owner.current || "",
      returnTo: nextPath,
    });
    window.location.href = `/backend/api/auth/google?${params.toString()}`;
  };

  const onEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFailure("");
    setNotice("");
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFailure("Enter your email address.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setFailure("Enter your name.");
      return;
    }
    if (password.length < 8) {
      setFailure("Password needs at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await account.register({ email: cleanEmail, name: name.trim(), password });
      } else {
        await account.login({ email: cleanEmail, password });
      }
      router.push(nextPath);
    } catch (reason) {
      setFailure(reason instanceof ApiError ? reason.message : "Couldn't sign in right now. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const onForgotSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFailure("");
    setNotice("");
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFailure("Enter the email you signed up with.");
      return;
    }
    setBusy(true);
    try {
      const res = await requestPasswordResetOtp(cleanEmail);
      setNotice(res.message || "If an account exists for that email, we sent a 6-digit code.");
      setOtp("");
      setMode("otp");
    } catch (reason) {
      setFailure(reason instanceof Error ? reason.message : "Couldn't send reset code.");
    } finally {
      setBusy(false);
    }
  };

  const onOtpSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFailure("");
    const code = otp.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) {
      setFailure("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    try {
      const res = await verifyPasswordResetOtp(email.trim(), code);
      setResetToken(res.resetToken);
      setNotice("Code verified. Choose a new password.");
      setMode("reset");
    } catch (reason) {
      setFailure(reason instanceof Error ? reason.message : "Invalid or expired code.");
    } finally {
      setBusy(false);
    }
  };

  const onResetSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFailure("");
    if (newPassword.length < 8) {
      setFailure("Password needs at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFailure("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await resetPasswordWithOtp({ email: email.trim(), resetToken, password: newPassword });
      setPassword("");
      setNotice("Password updated. You can sign in now.");
      setMode("login");
    } catch (reason) {
      setFailure(reason instanceof Error ? reason.message : "Couldn't reset your password.");
    } finally {
      setBusy(false);
    }
  };

  if (account.ready && account.user) {
    return (
      <main className="billing-return">
        <div className="billing-return-card auth-page-card">
          <Link href="/" className="billing-return-brand" aria-label={`${SITE_NAME} home`}>
            <Logo />
            <span>
              <b>CV</b> Matters
            </span>
          </Link>
          <h1 className="billing-return-title">You&apos;re signed in</h1>
          <p className="billing-return-lead">
            Signed in as <strong>{account.user.email}</strong>.
          </p>
          <Link className="btn-cta" href={nextPath}>
            Continue to your account
          </Link>
          <Link className="btn-quiet" href="/cv/details">
            Open CV editor
          </Link>
        </div>
      </main>
    );
  }

  const heading =
    mode === "signup"
      ? "Create your account"
      : mode === "forgot"
        ? "Reset your password"
        : mode === "otp"
          ? "Enter your 6-digit code"
          : mode === "reset"
            ? "Choose a new password"
            : "Welcome back";

  const lead =
    mode === "signup"
      ? "Save your resumes, publish a public link, and unlock PDF exports when you need them."
      : mode === "forgot"
        ? "Enter your email and we'll send a 6-digit verification code."
        : mode === "otp"
          ? `We sent a 6-digit code to ${email}.`
          : mode === "reset"
            ? "Pick a strong password with at least 8 characters."
            : "Sign in to access your saved resumes and public link.";

  return (
    <main className="billing-return auth-page-wrap">
      <div className="billing-return-card auth-page-card">
        <Link href="/" className="billing-return-brand" aria-label={`${SITE_NAME} home`}>
          <Logo />
          <span>
            <b>CV</b> Matters
          </span>
        </Link>

        <h1 className="billing-return-title">{heading}</h1>
        <p className="billing-return-lead">{lead}</p>

        {failure ? (
          <p className="auth-page-error" role="alert">
            {failure}
          </p>
        ) : null}
        {notice ? (
          <p className="auth-page-notice" role="status">
            {notice}
          </p>
        ) : null}

        {mode === "login" || mode === "signup" ? (
          <>
            {googleReady ? (
              <>
                <button type="button" className="auth-provider" onClick={googleStart} disabled={busy}>
                  <span className="auth-mark">
                    <GoogleMark />
                  </span>
                  <span>Continue with Google</span>
                </button>
                <div className="auth-or">
                  <span>or</span>
                </div>
              </>
            ) : null}

            <form className="auth-page-form" onSubmit={onEmailSubmit}>
              {mode === "signup" ? (
                <label className="auth-page-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </label>
              ) : null}

              <label className="auth-page-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="auth-page-field">
                <span>Password</span>
                <span className="auth-pass-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="auth-pass-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </span>
                {mode === "login" ? (
                  <button type="button" className="auth-forgot auth-forgot-below" onClick={() => switchMode("forgot")}>
                    Forgot password?
                  </button>
                ) : null}
              </label>

              <button type="submit" className="btn-cta auth-page-submit" disabled={busy}>
                {busy ? "Please wait…" : mode === "signup" ? "Create free account" : "Sign in"}
              </button>
            </form>

            <div className="auth-page-switch">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <Link href={`/login${nextPath !== "/profile" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New to {SITE_NAME}?{" "}
                  <Link href={`/signup${nextPath !== "/profile" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>
                    Create an account
                  </Link>
                </>
              )}
            </div>
          </>
        ) : null}

        {mode === "forgot" ? (
          <form className="auth-page-form" onSubmit={onForgotSubmit}>
            <label className="auth-page-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <button type="submit" className="btn-cta auth-page-submit" disabled={busy}>
              {busy ? "Sending…" : "Send 6-digit code"}
            </button>
            <button type="button" className="btn-quiet auth-page-submit" onClick={() => switchMode("login")}>
              Back to sign in
            </button>
          </form>
        ) : null}

        {mode === "otp" ? (
          <form className="auth-page-form" onSubmit={onOtpSubmit}>
            <label className="auth-page-field">
              <span>Verification code</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="auth-otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
              />
            </label>
            <button type="submit" className="btn-cta auth-page-submit" disabled={busy}>
              {busy ? "Verifying…" : "Verify code"}
            </button>
            <button type="button" className="btn-quiet auth-page-submit" onClick={() => switchMode("forgot")}>
              Resend code
            </button>
          </form>
        ) : null}

        {mode === "reset" ? (
          <form className="auth-page-form" onSubmit={onResetSubmit}>
            <label className="auth-page-field">
              <span>New password</span>
              <span className="auth-pass-wrap">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowNewPassword((v) => !v)}
                >
                  {showNewPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </span>
            </label>
            <label className="auth-page-field">
              <span>Confirm password</span>
              <input
                type={showNewPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <button type="submit" className="btn-cta auth-page-submit" disabled={busy}>
              {busy ? "Updating…" : "Update password"}
            </button>
            <button type="button" className="btn-quiet auth-page-submit" onClick={() => switchMode("login")}>
              Back to sign in
            </button>
          </form>
        ) : null}

        <div className="auth-page-foot">
          <Link href="/start">Start drafting without an account →</Link>
        </div>
      </div>
    </main>
  );
}
