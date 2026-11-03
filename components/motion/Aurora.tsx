"use client";

/**
 * The page's backdrop: three drifting colour fields, a pair of light rays, a dot
 * grid and a film grain. All CSS — no canvas, no scroll listeners — so it costs
 * nothing while you type. `tone="deep"` is the dark variant used behind the hero.
 */
export function Aurora({ tone = "light", rays = true, grid = true }: { tone?: "light" | "deep"; rays?: boolean; grid?: boolean }) {
  return (
    <div className={`ambient tone-${tone}`} aria-hidden="true">
      <span className="ambient-blob b1" />
      <span className="ambient-blob b2" />
      <span className="ambient-blob b3" />
      {rays ? (
        <>
          <span className="ambient-ray r1" />
          <span className="ambient-ray r2" />
        </>
      ) : null}
      {grid ? <span className="ambient-grid" /> : null}
      <span className="ambient-grain" />
    </div>
  );
}
