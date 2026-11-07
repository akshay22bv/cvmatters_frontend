"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconDownload, IconEye, IconLayers, IconMenu, IconPalette, IconUser } from "./icons";
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
          <img src="/icon.png" alt="" />
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
}: {
  panel: PanelId | null;
  downloading?: boolean;
  onPreview: () => void;
  onDownload: () => void;
  onOpenDesign: () => void;
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
          <img src="/icon.png" alt="" />
        </Link>
        <span className="slice-mobile-title">{current?.title ?? "My CV"}</span>
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
                <IconEye />
                Preview
              </button>
              <button
                type="button"
                className="slice-sheet-action"
                disabled={downloading}
                onClick={() => {
                  setOpen(false);
                  onDownload();
                }}
              >
                <IconDownload />
                {downloading ? "Building…" : "Download"}
              </button>
              <button
                type="button"
                className="slice-sheet-action"
                onClick={() => {
                  setOpen(false);
                  onOpenDesign();
                }}
              >
                <IconPalette />
                Edit template
              </button>
            </div>
            <p className="slice-sheet-label">Account</p>
            <Link href="/profile" className="slice-sheet-link" onClick={() => setOpen(false)}>
              <IconUser />
              Profile
            </Link>
            <Link href="/examples" className="slice-sheet-link" onClick={() => setOpen(false)}>
              <IconLayers />
              Compare CVs
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

export function SliceContinue({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="slice-continue" disabled={disabled} onClick={onClick}>
      <span>{label}</span>
      <span className="slice-continue-arrow" aria-hidden="true">
        <IconChevronRight />
      </span>
    </button>
  );
}

/** Mobile step footer: preview + design — same pill pattern as Continue. */
export function SliceViewCv({ onPreview, onDesign }: { onPreview: () => void; onDesign: () => void }) {
  return (
    <div className="slice-bar-acts" role="group" aria-label="Preview and edit template">
      <button type="button" className="slice-pill" onClick={onPreview}>
        <span className="slice-pill-mark" aria-hidden="true">
          <IconEye />
        </span>
        <span className="slice-pill-text">Preview</span>
      </button>
      <button type="button" className="slice-pill" onClick={onDesign}>
        <span className="slice-pill-mark" aria-hidden="true">
          <IconPalette />
        </span>
        <span className="slice-pill-text">Design</span>
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
