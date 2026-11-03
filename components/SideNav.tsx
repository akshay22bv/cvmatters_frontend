"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import {
  IconBio,
  IconDownload,
  IconEye,
  IconLayers,
  IconPage,
  IconSchool,
  IconSkills,
  IconTarget,
  IconUser,
  IconWork,
} from "./icons";
import { AccountMenu } from "./AccountMenu";
import type { AccountState } from "@/lib/useAccount";
import type { PanelId } from "@/lib/types";

const SECTIONS: {
  id: PanelId;
  title: string;
  body: string;
  label: string;
  Icon: () => ReactNode;
}[] = [
  { id: "details", title: "Details", body: "Name, photo, and how to reach you.", label: "Details", Icon: IconUser },
  { id: "bio", title: "Summary", body: "Two or three lines at the top of the page.", label: "Summary", Icon: IconBio },
  { id: "experience", title: "Experience", body: "Roles, companies, and what you did.", label: "Work", Icon: IconWork },
  { id: "education", title: "Education", body: "Schools, degrees, and years.", label: "School", Icon: IconSchool },
  { id: "skills", title: "Skills", body: "Tools and strengths for the role.", label: "Skills", Icon: IconSkills },
  { id: "extras", title: "Extra sections", body: "Projects, awards, languages, and more.", label: "Extra", Icon: IconPage },
  { id: "job", title: "Job post", body: "Paste the role you are aiming at.", label: "Job", Icon: IconTarget },
  { id: "compare", title: "Download", body: "Take a PDF when the page is ready.", label: "PDF", Icon: IconDownload },
  { id: "reference", title: "Your field", body: "See how strong CVs in your line look.", label: "Field", Icon: IconLayers },
];

/** Dock order — used when swiping the form sideways between sections. */
export const DOCK_ORDER: PanelId[] = SECTIONS.map((item) => item.id);

/**
 * Slice-style header on the left pane: title, eye, account.
 */
export function WorkHead({
  saveState,
  account,
  photoUrl,
  onPreview,
  onSignIn,
  onPlans,
  onProfile,
}: {
  saveState: "saved" | "saving" | "error" | "idle";
  account: AccountState;
  photoUrl: string;
  onPreview: () => void;
  onSignIn: () => void;
  onPlans: () => void;
  onProfile: () => void;
}) {
  return (
    <header className="work-top">
      <div className="work-top-title">
        <Link href="/" className="work-top-home">
          My CV
        </Link>
        <span className={`work-top-save is-${saveState}`}>
          {saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved" : "Saved"}
        </span>
      </div>
      <div className="work-top-acts">
        <button type="button" className="work-eye" aria-label="Preview CV" onClick={onPreview}>
          <IconEye />
        </button>
        <AccountMenu account={account} photoUrl={photoUrl} onSignIn={onSignIn} onPlans={onPlans} onProfile={onProfile} />
      </div>
    </header>
  );
}

/**
 * Picker strip: the white raised circle stays fixed in the middle.
 * Swipe the icons sideways so a different section lands in that circle.
 */
export function AppDock({
  panel,
  onPanel,
}: {
  panel: PanelId | null;
  onPanel: (id: PanelId) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ignoreScroll = useRef(false);
  const settleTimer = useRef<number | null>(null);

  const scrollItemToCenter = (index: number, smooth: boolean) => {
    const scroller = scrollerRef.current;
    const item = itemRefs.current[index];
    if (!scroller || !item) return;
    const left = item.offsetLeft - (scroller.clientWidth - item.offsetWidth) / 2;
    ignoreScroll.current = true;
    scroller.scrollTo({ left: Math.max(0, left), behavior: smooth ? "smooth" : "auto" });
    window.setTimeout(() => {
      ignoreScroll.current = false;
    }, smooth ? 380 : 40);
  };

  const nearestIndex = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return -1;
    const mid = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const center = item.offsetLeft + item.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    return best;
  };

  useEffect(() => {
    const index = panel ? SECTIONS.findIndex((item) => item.id === panel) : -1;
    if (index < 0) return;
    scrollItemToCenter(index, true);
  }, [panel]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const settle = () => {
      if (ignoreScroll.current) return;
      const index = nearestIndex();
      if (index < 0) return;
      const id = SECTIONS[index]?.id;
      if (!id) return;
      scrollItemToCenter(index, true);
      if (id !== panel) onPanel(id);
    };

    const onScroll = () => {
      if (ignoreScroll.current) return;
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(settle, 90);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("scrollend", settle);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("scrollend", settle);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
  }, [panel, onPanel]);

  return (
    <div className="dock-stage">
      <span className="dock-spot" aria-hidden="true" />
      <nav ref={scrollerRef} className="app-dock" aria-label="CV sections">
        {SECTIONS.map((item, index) => {
          const on = panel === item.id;
          return (
            <button
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              className={on ? "dock-item is-on" : "dock-item"}
              aria-label={item.title}
              aria-current={on ? "page" : undefined}
              onClick={() => {
                scrollItemToCenter(index, true);
                onPanel(item.id);
              }}
            >
              <span className="dock-btn">
                <item.Icon />
              </span>
              <span className="dock-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
