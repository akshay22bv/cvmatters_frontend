"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconAiDots, IconChevronLeft, IconChevronRight, IconCreate, IconDownload, IconLayers, IconMenu, IconOpenBook, IconPalette, IconSpinner, IconUser, Logo } from "./icons";
import { SECTIONS, sectionFilled } from "./SideNav";
import type { PanelId, ResumeData } from "@/lib/types";

export function CvSectionRail({
  panel,
  data,
  jobDescription = "",
  onPanel,
  examplesActive = false,
}: {
  panel: PanelId | null;
  data: ResumeData;
  jobDescription?: string;
  onPanel: (id: PanelId) => void;
  /** True on /examples — CV step icons stay neutral; examples link is highlighted. */
  examplesActive?: boolean;
}) {
  const filled = new Set(SECTIONS.filter((item) => sectionFilled(item.id, data, jobDescription)).map((item) => item.id));
  const pathname = usePathname();
  const onProfile = pathname.startsWith("/profile");

  return (
    <aside className="slice-rail" aria-label="CV sections">
      <div className="slice-rail-top">
        <Link href="/" className="slice-rail-logo" aria-label="CV Matters home">
          <Logo />
        </Link>
      </div>
      <nav className="slice-rail-nav">
        {SECTIONS.map((item) => {
          const on = !examplesActive && panel === item.id;
          const done = filled.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`slice-rail-icon${on ? " is-on" : ""}${done ? " is-done" : ""}`}
              aria-label={item.title}
              aria-current={on ? "step" : undefined}
              title={item.title}
              onClick={() => onPanel(item.id)}
            >
              <item.Icon />
            </button>
          );
        })}
      </nav>
      <div className="slice-rail-foot">
        <Link
          href="/examples"
          className={`slice-rail-examples${examplesActive ? " is-on" : ""}`}
          aria-label="CV examples in your field"
          title="CV examples"
        >
          <IconLayers />
        </Link>
        <Link
          href="/profile"
          className={`slice-rail-profile${onProfile ? " is-on" : ""}`}
          aria-label="Profile and sharing"
          title="Profile and sharing"
        >
          <IconUser />
        </Link>
      </div>
    </aside>
  );
}

export function CvMobileChrome({
  panel,
  downloading = false,
  onPreview,
  onDownload,
  /** Opens design / template picker (palette icon). Pass from CV builder and examples. */
  onOpenDesign,
  onAskAi,
}: {
  panel: PanelId | null;
  downloading?: boolean;
  onPreview: () => void;
  onDownload: () => void;
  onOpenDesign: () => void;
  onAskAi?: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [panel]);

  const current = SECTIONS.find((item) => item.id === panel);

  return (
    <>
      <header className="slice-mobile-head">
        <button type="button" className="slice-mobile-menu" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <IconMenu />
        </button>
        <Link href="/" className="slice-mobile-logo" aria-label="CV Matters home">
          <Logo />
        </Link>
        <span className="slice-mobile-title">{current?.title ?? "My CV"}</span>
        {onAskAi ? (
          <button type="button" className="slice-mobile-ai" onClick={onAskAi} aria-label="Ask AI">
            <IconAiDots size={15} />
            <span>Ask AI</span>
          </button>
        ) : null}
      </header>

      <div className={`slice-sheet${open ? " is-open" : ""}`} role="presentation">
        <button type="button" className="slice-sheet-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />
        <div className="slice-sheet-panel" role="dialog" aria-label="Navigation">
          <div className="slice-sheet-grab" aria-hidden="true" />
          <nav className="slice-sheet-nav" aria-label="Menu">
            <p className="slice-sheet-label">Resume</p>
            <div className="slice-sheet-actions">
              <button
                type="button"
                className="slice-sheet-action"
                onClick={() => {
                  setOpen(false);
                  onPreview();
                }}
              >
                <span className="slice-sheet-action-ico" aria-hidden="true">
                  <IconOpenBook />
                </span>
                Preview
              </button>
              <button
                type="button"
                className="slice-sheet-action"
                disabled={downloading}
                aria-busy={downloading || undefined}
                onClick={() => {
                  setOpen(false);
                  onDownload();
                }}
              >
                <span className="slice-sheet-action-ico" aria-hidden="true">
                  {downloading ? <IconSpinner /> : <IconDownload />}
                </span>
                {downloading ? "Wait…" : "Download"}
              </button>
              <button
                type="button"
                className="slice-sheet-action"
                onClick={() => {
                  setOpen(false);
                  onOpenDesign();
                }}
              >
                <span className="slice-sheet-action-ico" aria-hidden="true">
                  <IconPalette />
                </span>
                Template
              </button>
            </div>
            <p className="slice-sheet-label">Account</p>
            <div className="slice-sheet-actions is-account">
              <Link href="/profile" className="slice-sheet-action" onClick={() => setOpen(false)}>
                <span className="slice-sheet-action-ico" aria-hidden="true">
                  <IconUser />
                </span>
                Profile
              </Link>
              <Link href="/examples" className="slice-sheet-action" onClick={() => setOpen(false)}>
                <span className="slice-sheet-action-ico" aria-hidden="true">
                  <IconLayers />
                </span>
                Examples
              </Link>
              <Link href="/start" className="slice-sheet-action" onClick={() => setOpen(false)}>
                <span className="slice-sheet-action-ico" aria-hidden="true">
                  <IconCreate />
                </span>
                New CV
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

export function SliceContinue({
  label,
  disabled,
  busy = false,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`slice-continue${busy ? " is-busy" : ""}`}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      onClick={onClick}
    >
      {busy ? <IconSpinner size={16} /> : null}
      <span>{busy ? "Building…" : label}</span>
      {!busy ? (
        <span className="slice-continue-arrow" aria-hidden="true">
          <IconChevronRight />
        </span>
      ) : null}
    </button>
  );
}

/** Mobile step footer: preview + design — same pill pattern as Continue. */
export function SliceViewCv({ onPreview, onDesign }: { onPreview: () => void; onDesign: () => void }) {
  return (
    <div className="slice-bar-acts" role="group" aria-label="Preview and edit template">
      <button type="button" className="slice-round" aria-label="Preview resume" onClick={onPreview}>
        <IconOpenBook />
      </button>
      <button type="button" className="slice-round" aria-label="Edit design" onClick={onDesign}>
        <IconPalette />
      </button>
    </div>
  );
}

export function SliceBack({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="slice-back" aria-label="Back" disabled={disabled} onClick={onClick}>
      <IconChevronLeft />
    </button>
  );
}
