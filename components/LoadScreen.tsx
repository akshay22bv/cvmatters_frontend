/** Shared bouncing-bar loader (brand green), used on boot, home, and wait states. */
export function LoadScreen({
  message,
  variant = "page",
}: {
  message: string;
  variant?: "page" | "overlay" | "on-dark" | "standalone";
}) {
  const shell =
    variant === "overlay"
      ? "board-busy"
      : variant === "on-dark"
        ? "boot boot-on-dark"
        : variant === "standalone"
          ? "boot boot-standalone"
          : "boot";

  return (
    <div className={shell} role="status" aria-live="polite">
      <div className="load-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className={variant === "overlay" ? undefined : "boot-note"}>{message}</p>
    </div>
  );
}
