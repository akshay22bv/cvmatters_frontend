/** Placeholder while hero CV previews mount (client-only — avoids SSR font / scale mismatches). */
export function HeroResumePreviewSkeleton() {
  return (
    <div className="board-hero-stage" aria-busy="true" aria-label="Loading resume preview">
      <div className="board-hero-paper-fit board-hero-paper-fit--skeleton" />
    </div>
  );
}