"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Dialog } from "./Dialog";
import { IconEye, IconEyeOff } from "./icons";
import {
  ApiError,
  loadAuthConfig,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  verifyPasswordResetOtp,
} from "@/lib/api";

type AuthMode = "signup" | "login" | "forgot" | "otp" | "reset";

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

/** Google OAuth, email sign-up/sign-in, and OTP password reset. */
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
  const [notice, setNotice] = useState("");
  const [devPreviewUrl, setDevPreviewUrl] = useState("");
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const openedAsSignIn = /^sign in/i.test(reason || "");
  const [mode, setMode] = useState<AuthMode>(openedAsSignIn ? "login" : "signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const title =
    mode === "forgot"
      ? "Reset password"
      : mode === "otp"
        ? "Check your email"
        : mode === "reset"
          ? "Set a new password"
          : mode === "login"
            ? "Welcome back"
            : openedAsSignIn
              ? "Welcome back"
              : "Get started with CV Matters";

  const subtitle =
    mode === "forgot"
      ? "Enter your account email and we'll send you a 6-digit verification code."
      : mode === "otp"
        ? `Enter the 6-digit code sent to ${email.trim()}.`
        : mode === "reset"
          ? `Choose a new password for ${email.trim()}.`
          : mode === "login"
            ? reason && !/^sign in/i.test(reason)
              ? reason
              : "Sign in with email or Google."
            : reason && !openedAsSignIn
              ? reason
              : "Create an account with email or Google.";

  useEffect(() => {
    if (!open) return;
    setFailure("");
    setNotice("");
    setDevPreviewUrl("");
    setEmail("");
    setName("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setResetToken("");
    setResendIn(0);
    setShowPassword(false);
    setShowConfirm(false);
    setMode(openedAsSignIn ? "login" : "signup");
    loadAuthConfig()
      .then((config) => setGoogleReady(config.google))
      .catch(() => setGoogleReady(false));
  }, [open, openedAsSignIn]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const switchMode = (next: AuthMode) => {
    setFailure("");
    setNotice("");
    if (next !== "otp") setDevPreviewUrl("");
    setMode(next);
  };

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
    setNotice("");
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

  const sendOtp = async (event?: FormEvent) => {
    event?.preventDefault();
    setFailure("");
    setNotice("");
    setDevPreviewUrl("");
    setBusy(true);
    try {
      const result = await requestPasswordResetOtp(email.trim());
      setOtp("");
      setResetToken("");
      setResendIn(30);
      setNotice(result.message || "We sent a 6-digit code to your email.");
      if (result.devPreviewUrl) setDevPreviewUrl(result.devPreviewUrl);
      setMode("otp");
    } catch (reason) {
      if (reason instanceof ApiError) setFailure(reason.message);
      else setFailure("Couldn't send the code. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (event: FormEvent) => {
    event.preventDefault();
    setFailure("");
    setNotice("");
    setBusy(true);
    try {
      const result = await verifyPasswordResetOtp(email.trim(), otp);
      setResetToken(result.resetToken);
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirm(false);
      setDevPreviewUrl("");
      setMode("reset");
    } catch (reason) {
      if (reason instanceof ApiError) setFailure(reason.message);
      else setFailure("Couldn't verify that code. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (event: FormEvent) => {
    event.preventDefault();
    setFailure("");
    setNotice("");
    if (password !== confirmPassword) {
      setFailure("Those passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await resetPasswordWithOtp({ email: email.trim(), resetToken, password });
      try {
        await onLogin({ email: email.trim(), password });
        onAuthenticated?.();
        onClose();
      } catch {
        setPassword("");
        setConfirmPassword("");
        setNotice("Password updated. Sign in with your new password.");
        setMode("login");
      }
    } catch (reason) {
      if (reason instanceof ApiError) setFailure(reason.message);
      else setFailure("Couldn't update your password. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const isResetFlow = mode === "forgot" || mode === "otp" || mode === "reset";

  return (
    <Dialog open={open} onClose={onClose} width={440} className="auth-modal" title={title} subtitle={subtitle}>
      <div className="modal-body auth-body">
        {!isResetFlow ? (
          <>
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
              <div className="auth-field">
                <div className="auth-field-head">
                  <label htmlFor="auth-password-input">Password</label>
                  {mode === "login" ? (
                    <button
                      type="button"
                      className="auth-forgot"
                      disabled={busy}
                      onClick={() => switchMode("forgot")}
                    >
                      Forgot password?
                    </button>
                  ) : null}
                </div>
                <div className="auth-pass-wrap">
                  <input
                    id="auth-password-input"
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
              </div>
              <button type="submit" className="btn-cta" disabled={busy || !email.trim() || !password || (mode === "signup" && !name.trim())}>
                {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="auth-switch">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("login")}>
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New here?{" "}
                  <button type="button" onClick={() => switchMode("signup")}>
                    Create an account
                  </button>
                </>
              )}
            </p>
          </>
        ) : null}

        {mode === "forgot" ? (
          <form className="auth-email-form" onSubmit={(event) => void sendOtp(event)}>
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
            <button type="submit" className="btn-cta" disabled={busy || !email.trim()}>
              {busy ? "Sending code…" : "Send verification code"}
            </button>
            <p className="auth-switch">
              Remembered it?{" "}
              <button type="button" onClick={() => switchMode("login")}>
                Back to sign in
              </button>
            </p>
          </form>
        ) : null}

        {mode === "otp" ? (
          <form className="auth-email-form" onSubmit={(event) => void submitOtp(event)}>
            <label className="auth-field">
              <span>6-digit verification code</span>
              <input
                className="auth-input auth-otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={otp}
                disabled={busy}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </label>
            <button type="submit" className="btn-cta" disabled={busy || otp.length !== 6}>
              {busy ? "Verifying…" : "Verify code"}
            </button>
            <div className="auth-resend-row">
              <button
                type="button"
                className="auth-forgot"
                disabled={busy || resendIn > 0}
                onClick={() => void sendOtp()}
              >
                {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
              </button>
              <button type="button" className="auth-forgot" disabled={busy} onClick={() => switchMode("forgot")}>
                Change email
              </button>
            </div>
          </form>
        ) : null}

        {mode === "reset" ? (
          <form className="auth-email-form" onSubmit={(event) => void submitReset(event)}>
            <label className="auth-field">
              <span>New password</span>
              <div className="auth-pass-wrap">
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters, letter & number"
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
            <label className="auth-field">
              <span>Confirm new password</span>
              <div className="auth-pass-wrap">
                <input
                  className="auth-input"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  disabled={busy}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  disabled={busy}
                  onClick={() => setShowConfirm((on) => !on)}
                >
                  {showConfirm ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </label>
            <button type="submit" className="btn-cta" disabled={busy || !password || !confirmPassword}>
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        ) : null}

        {notice ? (
          <p className="auth-notice" role="status">
            {notice}
            {devPreviewUrl ? (
              <>
                {" "}
                <a href={devPreviewUrl} target="_blank" rel="noreferrer">
                  Open dev email preview
                </a>
              </>
            ) : null}
          </p>
        ) : null}
        {failure ? <p className="form-alert">{failure}</p> : null}

        {!isResetFlow ? <p className="auth-legal">By continuing, you create or sign in to your CV Matters account.</p> : null}
      </div>
    </Dialog>
  );
}
