export function Logo() {
  return <img className="brand-logo" src="/logo.png" alt="" width={563} height={355} />;
}

export function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.4 4.2 6 7.8l3.6-3.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight() {
  return (
    <svg className="choice-chevron" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M7 4.5 12.5 9 7 13.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCreate() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M12.2 4.4 17.6 9.8 8.4 19H3v-5.4L12.2 4.4Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10.8 5.8 16.2 11.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconUpload() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M11 13.5V4.8M7.5 8 11 4.5 14.5 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 13.5v3.2A1.8 1.8 0 0 0 6.3 18.5h9.4a1.8 1.8 0 0 0 1.8-1.8v-3.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconDrop() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M14 4.5v12M9.5 12.5 14 17l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 19.5v2.2A1.8 1.8 0 0 0 7.3 23.5h13.4a1.8 1.8 0 0 0 1.8-1.8v-2.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconLinkedin() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="currentColor" d="M4.2 6.4h2.2v7.4H4.2V6.4Zm1.1-3.5A1.3 1.3 0 1 1 4 4.2a1.3 1.3 0 0 1 1.3-1.3ZM8 6.4h2.1v1h.1a2.3 2.3 0 0 1 2.1-1.1c2.2 0 2.6 1.5 2.6 3.4v4.1h-2.2V10c0-.9 0-2-1.3-2s-1.4 1-1.4 1.9v3.5H8V6.4Z" />
    </svg>
  );
}

export function Spark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 1.2 8.1 5 12 6.2 8.1 7.4 7 11.2 5.9 7.4 2 6.2 5.9 5 7 1.2Z" fill="currentColor" />
    </svg>
  );
}

export function Pencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M9.2 3.2 12.8 6.8 5.5 14.1 2 14.9 2.8 11.4 9.2 3.2Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.2 4.2 11.8 7.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Trash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 4.5h9M6.2 4.4V3.2h3.6v1.2M4.6 4.5l.5 8.2h5.8l.5-8.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/* --- section + nav glyphs: one 22px grid, 1.6 stroke, so they sit evenly --- */

export function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M3.6 10.2 11 4.2l7.4 6V18a1.4 1.4 0 0 1-1.4 1.4H5A1.4 1.4 0 0 1 3.6 18v-7.8Z" />
      <path d="M8.6 19.4v-6h4.8v6" />
    </svg>
  );
}

export function IconPage() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M7 3.6h5.4L17.2 8.4V18A1.4 1.4 0 0 1 15.8 19.4H7A1.4 1.4 0 0 1 5.6 18V5A1.4 1.4 0 0 1 7 3.6Z" />
      <path d="M12.4 3.6V8.4h4.8" />
    </svg>
  );
}

export function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="11" cy="7.4" r="3.4" />
      <path d="M4.4 18.4c0-3.2 3-5.2 6.6-5.2s6.6 2 6.6 5.2" />
    </svg>
  );
}

export function IconBio() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4.6 5.6h12.8M4.6 9.6h12.8M4.6 13.6h9.4M4.6 17.4h5.6" />
    </svg>
  );
}

export function IconWork() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="3.2" y="7" width="15.6" height="11" rx="2.2" />
      <path d="M8.4 7V5.6a1.4 1.4 0 0 1 1.4-1.4h2.4a1.4 1.4 0 0 1 1.4 1.4V7M3.2 11.6h15.6" />
    </svg>
  );
}

export function IconSchool() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M11 4 20 8.2 11 12.4 2 8.2 11 4Z" />
      <path d="M5.6 10.2v4.4c0 1.6 2.4 2.9 5.4 2.9s5.4-1.3 5.4-2.9v-4.4" />
    </svg>
  );
}

export function IconSkills() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M8.6 3.4 10.4 7.8l4.6.4-3.5 3 1.1 4.5-4-2.4-4 2.4 1.1-4.5-3.5-3 4.6-.4 1.8-4.4Z" />
      <path d="M16 13.6l.8 2 2.1.2-1.6 1.4.5 2-1.8-1.1-1.8 1.1.5-2-1.6-1.4 2.1-.2.8-2Z" />
    </svg>
  );
}

export function IconScan() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7.2V5.2A1.6 1.6 0 0 1 5.6 3.6h2.2M14.2 3.6h2.2A1.6 1.6 0 0 1 18 5.2v2M18 14.8v2a1.6 1.6 0 0 1-1.6 1.6h-2.2M7.8 18.4H5.6A1.6 1.6 0 0 1 4 16.8v-2" />
      <path d="M3.6 11h14.8" />
    </svg>
  );
}

export function IconTarget() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="11" cy="11" r="7.4" />
      <circle cx="11" cy="11" r="3.6" />
      <path d="M11 1.8v2.6M11 17.6v2.6M1.8 11h2.6M17.6 11h2.6" />
    </svg>
  );
}

export function IconLayers() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M11 3.2 19 7.4 11 11.6 3 7.4 11 3.2Z" />
      <path d="M3 11.8 11 16l8-4.2M3 15.6 11 19.8l8-4.2" />
    </svg>
  );
}

export function IconPalette() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round">
      <path d="M11 3.2a7.8 7.8 0 0 0 0 15.6c1.3 0 1.9-.8 1.9-1.7 0-1.6-1.5-1.8-1.5-3 0-.9.7-1.6 1.7-1.6h1.6a3.9 3.9 0 0 0 3.9-3.9C18.6 5.4 15.3 3.2 11 3.2Z" />
      <circle cx="7.6" cy="8.4" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="6.6" cy="12.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M1.9 11S5 5.6 11 5.6 20.1 11 20.1 11 17 16.4 11 16.4 1.9 11 1.9 11Z" />
      <circle cx="11" cy="11" r="2.6" />
    </svg>
  );
}

export function IconDownload() {
  return (
    <svg width="17" height="17" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 3.4v9.8M7 9.6l4 4 4-4" />
      <path d="M4 16.2v1.4a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8v-1.4" />
    </svg>
  );
}

export function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.6 7.4 5.6 10.4 11.4 4" />
    </svg>
  );
}

export function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3.6 6.8h14.8M3.6 11h14.8M3.6 15.2h9.6" />
    </svg>
  );
}

/* --- form, account and billing glyphs --- */

export function IconAlert() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.2" />
      <path d="M8 4.8v3.8M8 11.1v.1" />
    </svg>
  );
}

export function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M4.2 7.4C2.8 8.8 1.9 11 1.9 11s3.1 5.4 9.1 5.4c1.3 0 2.5-.25 3.5-.66M8.6 5.9A8.6 8.6 0 0 1 11 5.6c6 0 9.1 5.4 9.1 5.4a15 15 0 0 1-2.6 3.2" />
      <path d="M9.2 9.2a2.6 2.6 0 0 0 3.6 3.6M3.4 3.4l15.2 15.2" />
    </svg>
  );
}

export function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="7.8" cy="7.8" r="4.8" />
      <path d="M11.4 11.4 15 15" />
    </svg>
  );
}

export function IconMail() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="2.6" y="4.4" width="14.8" height="11.2" rx="2.2" />
      <path d="m3.4 6 6.6 4.6L16.6 6" />
    </svg>
  );
}

export function IconLock() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="4" y="8.6" width="12" height="8.4" rx="2.2" />
      <path d="M6.8 8.6V6.4a3.2 3.2 0 0 1 6.4 0v2.2" />
    </svg>
  );
}

export function IconCard() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="2.2" y="4.6" width="15.6" height="10.8" rx="2.4" />
      <path d="M2.2 8.4h15.6M5.2 12.4h3" />
    </svg>
  );
}

export function IconStar({ filled = false, half = false }: { filled?: boolean; half?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      {half ? (
        <defs>
          <linearGradient id="half-star">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        d="M10 2.4l2.3 4.9 5.3.7-3.9 3.7 1 5.3L10 14.4 5.3 17l1-5.3L2.4 8l5.3-.7L10 2.4Z"
        fill={half ? "url(#half-star)" : filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCrown() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M3 14.4 2 5.8l4.3 3L10 3.4l3.7 5.4L18 5.8l-1 8.6H3Z" />
      <path d="M3 16.6h14" />
    </svg>
  );
}

export function IconSignOut() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 17H4.6A1.6 1.6 0 0 1 3 15.4V4.6A1.6 1.6 0 0 1 4.6 3H8" />
      <path d="m12.6 13.4 3.4-3.4-3.4-3.4M16 10H7.4" />
    </svg>
  );
}

export function IconPrint() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M6 7.4V3.2h8v4.2" />
      <rect x="2.8" y="7.4" width="14.4" height="6.4" rx="1.8" />
      <path d="M6 11.6h8v5.2H6z" />
    </svg>
  );
}

export function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M4 4l6 6M10 4l-6 6" />
    </svg>
  );
}

export function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.2 4.2 6.4 9l4.8 4.8" />
    </svg>
  );
}

export function IconChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.8 4.2 11.6 9l-4.8 4.8" />
    </svg>
  );
}

export function IconLayers2() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="2.6" y="3.4" width="7" height="15.2" rx="1.6" />
      <rect x="12.4" y="3.4" width="7" height="15.2" rx="1.6" />
      <path d="M4.8 7.4h2.6M4.8 10.4h2.6M14.6 7.4h2.6M14.6 10.4h2.6M14.6 13.4h2.6" />
    </svg>
  );
}
