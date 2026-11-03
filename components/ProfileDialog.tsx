"use client";

import { Dialog } from "./Dialog";
import { SearchSelect } from "./Field";
import { CATEGORIES, type Category, type ResumeData } from "@/lib/types";
import type { AccountState } from "@/lib/useAccount";

/**
 * Everything about how this person appears to others: the account they are
 * signed in as, whether their resume is listed for other people to read, and
 * which contact details that listed copy carries.
 */
export function ProfileDialog({
  open,
  account,
  data,
  category,
  isPublic,
  busy,
  onClose,
  onData,
  onCategory,
  onPublic,
}: {
  open: boolean;
  account: AccountState;
  data: ResumeData;
  category: Category;
  isPublic: boolean;
  busy: boolean;
  onClose: () => void;
  onData: (data: ResumeData) => void;
  onCategory: (category: Category) => void;
  onPublic: (value: boolean) => void;
}) {
  const share = data.share || { email: false, phone: false };
  const setShare = (patch: Partial<typeof share>) => onData({ ...data, share: { ...share, ...patch } });

  const row = (
    id: string,
    checked: boolean,
    title: string,
    note: string,
    onToggle: (value: boolean) => void,
    disabled = false,
  ) => (
    <label className={disabled ? "share-box is-off" : "share-box"} key={id}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        className={checked ? "switch on" : "switch"}
        disabled={disabled || busy}
        onClick={() => onToggle(!checked)}
      >
        <span />
      </button>
      <span className="share-copy">
        <strong>{title}</strong>
        <small>{note}</small>
      </span>
    </label>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      width={480}
      title="Your profile"
      subtitle={account.user ? account.user.email : "Not signed in"}
    >
      <div className="modal-body">
        <SearchSelect
          label="Field"
          value={category}
          options={CATEGORIES.map((item) => ({ id: item, name: item }))}
          hint="Where your resume is listed, and what you browse in Reference CVs."
          onChange={(id) => onCategory(id as Category)}
        />

        <div className="fld">
          <div className="fld-top">
            <span className="fld-label">Sharing</span>
          </div>
          <div className="share-stack">
            {row(
              "listed",
              isPublic,
              `List my CV in ${category}`,
              "Other people can read it and rate it. Take it off the list any time.",
              onPublic,
            )}
            {row(
              "email",
              share.email,
              "Show my email on the listed copy",
              "Off by default. Your own downloaded PDF always has it.",
              (value) => setShare({ email: value }),
              !isPublic,
            )}
            {row(
              "phone",
              share.phone,
              "Show my phone on the listed copy",
              "Off by default. Your own downloaded PDF always has it.",
              (value) => setShare({ phone: value }),
              !isPublic,
            )}
          </div>
          {!isPublic ? <p className="fld-note">List your CV first to choose what it shows.</p> : null}
        </div>

        <button type="button" className="btn-cta" onClick={onClose}>
          Done
        </button>
      </div>
    </Dialog>
  );
}
