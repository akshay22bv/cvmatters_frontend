"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiError, confirmPhonePeOrder } from "@/lib/api";
import { useAccount } from "@/lib/useAccount";
import { IconCheck, IconLock } from "@/components/icons";
import { LoadScreen } from "@/components/LoadScreen";

type Phase = "loading" | "done" | "pending" | "failed" | "signin";

function BillingReturnInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "";
  const owner = useRef("");
  const account = useAccount(() => owner.current);
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState("");

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
    (async () => {
      try {
        const result = await confirmPhonePeOrder(orderId);
        if (cancelled) return;
        account.setEntitlement({ canDownload: true, subscription: result.subscription });
        setPhase("done");
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 202) {
          setPhase("pending");
          setMessage(error.message);
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
        {phase === "loading" ? <p className="billing-return-lead">Confirming your payment…</p> : null}
        {phase === "signin" ? (
          <>
            <p className="billing-return-lead">Sign in to finish activating your plan.</p>
            <Link className="btn-cta" href="/cv/compare">
              Open CV editor
            </Link>
          </>
        ) : null}
        {phase === "pending" ? (
          <>
            <p className="billing-return-lead">{message || "Payment is still processing."}</p>
            <p className="modal-fine">
              <IconLock />
              <span>This page will update if you refresh in a minute, or your plan activates from the webhook.</span>
            </p>
            <button type="button" className="btn-cta" onClick={() => window.location.reload()}>
              Check again
            </button>
          </>
        ) : null}
        {phase === "failed" ? (
          <>
            <p className="form-alert">{message || "Something went wrong."}</p>
            <Link className="btn-cta" href="/cv/compare">
              Back to downloads
            </Link>
          </>
        ) : null}
        {phase === "done" ? (
          <>
            <div className="paid-mark" aria-hidden="true">
              <IconCheck />
            </div>
            <p className="billing-return-lead">You&apos;re all set — PDF downloads are unlocked.</p>
            <Link className="btn-cta" href="/cv/compare">
              Download my PDF
            </Link>
          </>
        ) : null}
      </div>
    </main>
  );
}

/** Land here after PhonePe redirects the user (Standard Checkout redirectUrl). */
export default function BillingReturnPage() {
  return (
    <Suspense fallback={<LoadScreen message="Confirming your payment…" variant="standalone" />}>
      <BillingReturnInner />
    </Suspense>
  );
}
