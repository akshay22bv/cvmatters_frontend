import type { Metadata, Viewport } from "next";
import "../embed.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Fixed A4 layout width — parent iframe handles display size without scaling fonts. */
export const viewport: Viewport = {
  width: 794,
  initialScale: 1,
  maximumScale: 10,
  userScalable: true,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function EmbedResumeLayout({ children }: { children: React.ReactNode }) {
  return <div className="embed-resume-root">{children}</div>;
}