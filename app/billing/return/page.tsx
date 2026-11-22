"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { confirmCashfreeWithRetry } from "@/lib/billingConfirm";
import { loginPath } from "@/lib/paths";
import { ApiError, type Receipt } from "@/lib/api";
import { useAccount } from "@/lib/useAccount";
import { markEntitlementRefresh } from "@/lib/session";
import { IconCheck, IconLock, Logo } from "@/components/icons";
import { LoadScreen } from "@/components/LoadScreen";
import type { Subscription } from "@/lib/types";

type Phase = "loading" | "done" | "pending" | "failed" | "signin";

function BillingReturnInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "";
  const owner = useRef("");
  const account = useAccount(() => owner.current);
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!orderId) {
      setPhase("failed");
      setMessage("Missing order id.");
      return;
    }
    if (!account.ready) return;
    if (!account.user) {
      setPhase("signin");
      return;
    }

    let cancelled = false;
    setPhase("loading");
    (async () => {
      try {
        const result = await confirmCashfreeWithRetry(orderId);
        if (cancelled) return;
        account.setEntitlement({ canDownload: true, subscription: result.subscription });
        markEntitlementRefresh();
        setReceipt(result.receipt || null);
        setSubscription(result.subscription || null);
        setPhase("done");
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 202) {
          setPhase("pending");
          setMessage(error.message || "Payment is still processing.");
          return;
        }
        setPhase("failed");
        setMessage(error instanceof Error ? error.message : "Payment could not be confirmed.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, account.ready, account.user, account.setEntitlement]);

  return (
    <main className="billing-return">
      <div className="billing-return-card">
        <Link href="/" className="billing-return-brand" aria-label="CV Matters home">
          <Logo />
          <span>
            <b>CV</b> Matters
          </span>
        </Link>

        {phase === "loading" ? (
          <>
            <div className="billing-return-pulse" aria-hidden="true" />
            <h1 className="billing-return-title">Confirming payment</h1>
            <p className="billing-return-lead">Hang on — we&apos;re unlocking your plan.</p>
          </>
        ) : null}

        {phase === "signin" ? (
          <>
            <div className="paid-mark is-soft" aria-hidden="true">
              <IconLock />
            </div>
            <h1 className="billing-return-title">Sign in to finish</h1>
            <p className="billing-return-lead">Payment went through. Sign in with the same account to activate your plan.</p>
            <Link
              className="btn-cta"
              href={
                orderId
                  ? loginPath(`/billing/return?orderId=${encodeURIComponent(orderId)}`)
                  : loginPath("/billing/return")
              }
            >
              Sign in
            </Link>
            <Link className="btn-quiet" href="/">
              Back to home
            </Link>
          </>
        ) : null}

        {phase === "pending" ? (
          <>
            <div className="billing-return-pulse" aria-hidden="true" />
            <h1 className="billing-return-title">Almost there</h1>
            <p className="billing-return-lead">{message || "Payment is still processing."}</p>
            <p className="modal-fine">
              <IconLock />
              <span>Refresh in a minute, or your plan will activate once the bank confirms.</span>
            </p>
            <button type="button" className="btn-cta" onClick={() => window.location.reload()}>
              Check again
            </button>
          </>
        ) : null}

        {phase === "failed" ? (
          <>
            <h1 className="billing-return-title">Payment not confirmed</h1>
            <p className="form-alert">{message || "Something went wrong."}</p>
            <Link className="btn-cta" href="/cv/compare">
              Back to downloads
            </Link>
            <Link className="btn-quiet" href="/">
              Home
            </Link>
          </>
        ) : null}

        {phase === "done" ? (
          <>
            <div className="paid-mark" aria-hidden="true">
              <IconCheck />
            </div>
            <p className="billing-return-kicker">All set</p>
            <h1 className="billing-return-title">Payment successful</h1>
            <p className="billing-return-lead">Your plan is active. PDF downloads are unlocked on this account.</p>
            {(receipt || subscription) && (
              <dl className="receipt">
                {receipt?.plan || subscription?.planName ? (
                  <div>
                    <dt>Plan</dt>
                    <dd>{receipt?.plan || subscription?.planName}</dd>
                  </div>
                ) : null}
                {receipt?.price ? (
                  <div>
                    <dt>Paid</dt>
                    <dd>{receipt.price}</dd>
                  </div>
                ) : null}
                {subscription?.expiresAt ? (
                  <div>
                    <dt>Renews</dt>
                    <dd>{new Date(subscription.expiresAt).toLocaleDateString()}</dd>
                  </div>
                ) : null}
                {orderId ? (
                  <div>
                    <dt>Order</dt>
                    <dd className="billing-return-order">{orderId.slice(0, 8)}…</dd>
                  </div>
                ) : null}
              </dl>
            )}
            <a
              className="btn-cta"
              href="/cv/compare"
              onClick={() => {
                markEntitlementRefresh();
              }}
            >
              Download my PDF
            </a>
            <Link className="btn-quiet" href="/profile">
              Go to profile
            </Link>
          </>
        ) : null}
      </div>

    </main>
  );
}

/** Land here after Cashfree checkout (return_url). */
export default function BillingReturnPage() {
  return (
    <Suspense fallback={<LoadScreen message="Confirming your payment…" variant="standalone" />}>
      <BillingReturnInner />
    </Suspense>
  );
}
