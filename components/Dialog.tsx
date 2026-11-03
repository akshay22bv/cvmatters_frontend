"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The shell every modal shares: dimmed backdrop, a panel that springs in,
 * Escape to close, focus moved inside on open and returned on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 440,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  width?: number;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const focusable = panel.current?.querySelector<HTMLElement>("input, button, select, textarea");
    requestAnimationFrame(() => focusable?.focus());
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      returnTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="modal-scrim" aria-label="Close" onClick={onClose} />
      <div className={`modal-panel ${className}`.trim()} style={{ width }} ref={panel}>
        <button type="button" className="modal-x" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <header className="modal-head">
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
        {children}
      </div>
    </div>
  );
}
