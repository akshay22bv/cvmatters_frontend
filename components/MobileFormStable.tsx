"use client";

import { useEffect } from "react";

/**
 * Stops the mobile “fields jump when I tap” loop:
 * - pin shell height to the visual viewport (keyboard overlays, layout stays put)
 * - scroll only `.work-scroll`, never the document
 * - keep the focused control clear of the keyboard inset
 *
 * Same approach as stable mobile web apps (Telegram Web, Linear, Notion).
 */
export function MobileFormStable() {
  useEffect(() => {
    const root = document.documentElement;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const narrow = () => window.matchMedia("(max-width: 860px)").matches;
    if (fine && !narrow()) return;

    const setFrame = () => {
      const view = window.visualViewport;
      const height = Math.round(view?.height || window.innerHeight);
      const top = Math.round(view?.offsetTop || 0);
      root.style.setProperty("--app-height", `${height}px`);
      root.style.setProperty("--vv-top", `${top}px`);
    };

    const scrollParent = (node: HTMLElement | null) => {
      let current: HTMLElement | null = node;
      while (current) {
        if (current.classList.contains("work-scroll")) return current;
        current = current.parentElement;
      }
      return null;
    };

    let focused: HTMLElement | null = null;

    const keepInView = (target: HTMLElement) => {
      const pane = scrollParent(target);
      if (!pane) return;
      const dock = pane.parentElement?.querySelector(".work-bar")?.getBoundingClientRect().height || 64;
      const paneBox = pane.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      const topLimit = paneBox.top + 8;
      const bottomLimit = paneBox.bottom - dock - 12;
      if (box.top >= topLimit && box.bottom <= bottomLimit) return;
      if (box.bottom > bottomLimit) pane.scrollTop += box.bottom - bottomLimit;
      else if (box.top < topLimit) pane.scrollTop -= topLimit - box.top;
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!narrow()) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches("input, textarea, select, [contenteditable='true']")) return;
      focused = target;
      window.setTimeout(() => {
        if (focused === target) keepInView(target);
      }, 280);
    };

    const onFocusOut = () => {
      focused = null;
    };

    const onViewport = () => {
      setFrame();
      if (focused) keepInView(focused);
    };

    setFrame();
    window.visualViewport?.addEventListener("resize", onViewport);
    window.visualViewport?.addEventListener("scroll", onViewport);
    window.addEventListener("resize", onViewport);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      window.visualViewport?.removeEventListener("resize", onViewport);
      window.visualViewport?.removeEventListener("scroll", onViewport);
      window.removeEventListener("resize", onViewport);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      root.style.removeProperty("--app-height");
      root.style.removeProperty("--vv-top");
    };
  }, []);

  return null;
}
