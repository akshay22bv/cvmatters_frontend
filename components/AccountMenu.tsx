"use client";

import { useEffect, useRef, useState } from "react";
import { Monogram } from "./Monogram";
import { IconCrown, IconSignOut, IconUser } from "./icons";
import type { AccountState } from "@/lib/useAccount";

/** The avatar and its menu, moved out of the old top nav. */
export function AccountMenu({
  account,
  photoUrl,
  onSignIn,
  onPlans,
  onProfile,
}: {
  account: AccountState;
  photoUrl: string;
  onSignIn: () => void;
  onPlans: () => void;
  onProfile: () => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pro = account.entitlement.canDownload;

  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    window.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  if (!account.user) return null;

  return (
    <div className="mn-account" ref={root}>
      <button
        type="button"
        className={open ? "mn-avatar is-open" : "mn-avatar"}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account"
        onClick={() => setOpen((current) => !current)}
      >
        <Monogram name={account.user.name} photoUrl={photoUrl} size={32} />
        {pro ? <i className="mn-pro-dot" aria-hidden="true" /> : null}
      </button>

      {open ? (
        <div className="mn-account-pop" role="menu">
          <div className="mn-who">
            <strong>{account.user.name}</strong>
            <small>{account.user.email}</small>
          </div>

          <div className={pro ? "mn-plan is-pro" : "mn-plan"}>
            <IconCrown />
            <span>
              <strong>{pro ? `${account.entitlement.subscription?.planName} plan` : "No plan yet"}</strong>
              <small>
                {pro
                  ? `Renews ${new Date(account.entitlement.subscription!.expiresAt).toLocaleDateString()}`
                  : "Downloads need a subscription"}
              </small>
            </span>
          </div>

          <button
            type="button"
            role="menuitem"
            className="mn-account-row"
            onClick={() => {
              setOpen(false);
              onProfile();
            }}
          >
            <IconUser />
            Profile and sharing
          </button>
          <button
            type="button"
            role="menuitem"
            className="mn-account-row"
            onClick={() => {
              setOpen(false);
              onPlans();
            }}
          >
            {pro ? "Change or extend plan" : "See plans"}
          </button>
          <button
            type="button"
            role="menuitem"
            className="mn-account-row"
            onClick={() => {
              setOpen(false);
              void account.logout();
            }}
          >
            <IconSignOut />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
