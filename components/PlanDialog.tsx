"use client";

import { useEffect, useState } from "react";
import { Dialog } from "./Dialog";
import { Field } from "./Field";
import { IconCard, IconCheck, IconCrown, IconLock } from "./icons";
import { ApiError, loadPlans, payOrder, startCheckout, type Receipt } from "@/lib/api";
import type { AccountState } from "@/lib/useAccount";
import type { Plan } from "@/lib/types";

type Step = "plans" | "pay" | "done";

/** 4242424242424242 -> "4242 4242 4242 4242", as you type. */
function groupCard(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string, previous: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  // let a backspace through the slash instead of re-adding it
  if (previous.endsWith("/") && value.length < previous.length) return digits.slice(0, 2);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function PlanDialog({
  open,
  account,
  reason,
  onClose,
  onPaid,
  onSignIn,
}: {
  open: boolean;
  account: AccountState;
  reason?: string;
  onClose: () => void;
  onPaid?: () => void;
  onSignIn?: () => void;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [chosen, setChosen] = useState("yearly");
  const [step, setStep] = useState<Step>("plans");
  const [orderId, setOrderId] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [signInRequired, setSignInRequired] = useState(false);

  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("plans");
    setFailure("");
    setSignInRequired(false);
    loadPlans()
      .then((result) => setPlans(result.plans))
      .catch(() => setFailure("Couldn't load the plans just now."));
  }, [open]);

  useEffect(() => {
    if (open && account.user) setNameOnCard((current) => current || account.user?.name || "");
  }, [open, account.user]);

  const plan = plans.find((item) => item.id === chosen);

  const toPayment = async () => {
    setBusy(true);
    setFailure("");
    setSignInRequired(false);
    try {
      const result = await startCheckout(chosen);
      setOrderId(result.order.id);
      setStep("pay");
    } catch (error) {
      if (error instanceof ApiError && error.needsSignIn) {
        setSignInRequired(true);
        setFailure(error.message);
      } else {
        setFailure(error instanceof Error ? error.message : "Couldn't start that order.");
      }
    } finally {
      setBusy(false);
    }
  };

  const pay = async () => {
    setBusy(true);
    setFailure("");
    try {
      const result = await payOrder({ orderId, cardNumber, expiry, cvc, nameOnCard });
      setReceipt(result.receipt);
      account.setEntitlement({ canDownload: true, subscription: result.subscription });
      setStep("done");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "The payment didn't go through.");
    } finally {
      setBusy(false);
    }
  };

  const title = step === "plans" ? "Choose a plan" : step === "pay" ? "Payment details" : "You're all set";
  const subtitle =
    step === "plans"
      ? reason || "Downloads are part of a subscription. Cancel whenever you like."
      : step === "pay"
        ? `${plan?.name} · ${plan?.price} ${plan?.cadence}`
        : "The PDF is ready whenever you are.";

  return (
    <Dialog open={open} onClose={onClose} width={step === "plans" ? 620 : 460} className="plan-modal" title={title} subtitle={subtitle}>
      {step === "plans" ? (
        <div className="modal-body">
          <div className="plan-grid">
            {plans.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === chosen ? "plan-card is-picked" : "plan-card"}
                aria-pressed={item.id === chosen}
                onClick={() => setChosen(item.id)}
              >
                {item.best ? (
                  <span className="plan-flag">
                    <IconCrown />
                    Best value
                  </span>
                ) : null}
                <strong className="plan-name">{item.name}</strong>
                <span className="plan-price">
                  {item.price}
                  <small>{item.cadence}</small>
                </span>
                {item.savingsNote ? <em className="plan-save">{item.savingsNote}</em> : null}
                <p className="plan-blurb">{item.blurb}</p>
                <ul className="perk-list">
                  {item.perks.map((perk) => (
                    <li key={perk}>
                      <IconCheck />
                      {perk}
                    </li>
                  ))}
                </ul>
                <span className="plan-tick" aria-hidden="true">
                  <IconCheck />
                </span>
              </button>
            ))}
          </div>

          {signInRequired ? (
            <p className="rate-gate">
              {failure || "Sign in to continue."}{" "}
              <button
                type="button"
                onClick={() => {
                  onSignIn?.();
                }}
              >
                Sign in
              </button>
            </p>
          ) : failure ? (
            <p className="form-alert">{failure}</p>
          ) : null}

          <button type="button" className="btn-cta" disabled={busy || !plan} onClick={() => void toPayment()}>
            {busy ? "One moment…" : `Continue with ${plan?.name || "a plan"}`}
          </button>
          <p className="modal-fine">
            <IconLock />
            <span>
              Test gateway — no money moves. Card <b>4242 4242 4242 4242</b> succeeds, <b>4000 0000 0000 0002</b> is
              declined.
            </span>
          </p>
        </div>
      ) : null}

      {step === "pay" ? (
        <form
          className="modal-body"
          onSubmit={(event) => {
            event.preventDefault();
            void pay();
          }}
        >
          <Field label="Name on card" value={nameOnCard} placeholder="Alex Rivera" autoComplete="cc-name" onChange={setNameOnCard} />
          <Field
            label="Card number"
            value={cardNumber}
            icon={<IconCard />}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            autoComplete="cc-number"
            onChange={(value) => setCardNumber(groupCard(value))}
          />
          <div className="pair">
            <Field
              label="Expiry"
              value={expiry}
              placeholder="MM/YY"
              inputMode="numeric"
              autoComplete="cc-exp"
              onChange={(value) => setExpiry(formatExpiry(value, expiry))}
            />
            <Field
              label="Security code"
              value={cvc}
              placeholder="123"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              onChange={(value) => setCvc(value.replace(/\D/g, ""))}
            />
          </div>

          {failure ? <p className="form-alert">{failure}</p> : null}

          <button type="submit" className="btn-cta" disabled={busy}>
            {busy ? "Taking payment…" : `Pay ${plan?.price || ""}`}
          </button>
          <button type="button" className="btn-quiet" onClick={() => setStep("plans")}>
            ← Back to plans
          </button>
          <p className="modal-fine">
            <IconLock />
            <span>Nothing is charged in this demo, and no card details are stored.</span>
          </p>
        </form>
      ) : null}

      {step === "done" ? (
        <div className="modal-body">
          <div className="paid-mark" aria-hidden="true">
            <IconCheck />
          </div>
          <dl className="receipt">
            <div>
              <dt>Plan</dt>
              <dd>{receipt?.plan}</dd>
            </div>
            <div>
              <dt>Paid</dt>
              <dd>{receipt?.price}</dd>
            </div>
            <div>
              <dt>Card</dt>
              <dd>•••• {receipt?.last4}</dd>
            </div>
            <div>
              <dt>Renews</dt>
              <dd>
                {account.entitlement.subscription
                  ? new Date(account.entitlement.subscription.expiresAt).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            className="btn-cta"
            onClick={() => {
              onClose();
              onPaid?.();
            }}
          >
            Download my PDF
          </button>
          <button type="button" className="btn-quiet" onClick={onClose}>
            Back to the editor
          </button>
        </div>
      ) : null}
    </Dialog>
  );
}
