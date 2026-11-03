"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useFinePointer, useReducedMotion } from "./useMotionPrefs";

/**
 * Leans a card toward the cursor in 3D and slides a glare band over it.
 * Transform is set on the node directly and eased back on leave.
 */
export function Tilt({
  children,
  className = "",
  max = 9,
  lift = 6,
  glare = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  lift?: number;
  glare?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const active = fine && !reduced;

  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node || !active) return;
    const box = node.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    node.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
    node.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    node.style.setProperty("--tz", `${lift}px`);
    node.style.setProperty("--gx", `${px * 100}%`);
    node.style.setProperty("--gy", `${py * 100}%`);
    node.style.setProperty("--lit", "1");
    node.style.setProperty("--settle", "0s");
  };

  const leave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--settle", "0.5s");
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--tz", "0px");
    node.style.setProperty("--lit", "0");
  };

  return (
    <div ref={ref} className={`tilt ${className}`.trim()} onPointerMove={track} onPointerLeave={leave} style={style}>
      <div className="tilt-inner">
        {children}
        {glare && active ? <span className="tilt-glare" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
