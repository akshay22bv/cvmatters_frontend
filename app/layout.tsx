import type { Metadata, Viewport } from "next";
import { DEFAULT_DESCRIPTION, OG_IMAGE_PATH, SITE_KEYWORDS, SITE_NAME, siteUrl } from "@/lib/site";
import {
  DM_Sans,
  Inter,
  Libre_Baskerville,
  Lora,
  Merriweather,
  Montserrat,
  Outfit,
  Playfair_Display,
  Poppins,
  Roboto,
  Source_Serif_4,
} from "next/font/google";
import localFont from "next/font/local";
import { AppShell } from "@/components/AppShell";
import "./theme.css";
import "./globals.css";
import "./templates.css";
import "./motion.css";
import "./shell.css";
import "./forms.css";
import "./landing.css";

const googleSans = localFont({
  src: [
    { path: "./fonts/GoogleSans.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/GoogleSans-Italic.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-google-sans",
  display: "swap",
  preload: false,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});
// Resume-only typefaces load on demand instead of preloading ~15 font files on every page.
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap", preload: false });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });
const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-roboto", display: "swap", preload: false });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap", preload: false });
const poppins = Poppins({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-poppins", display: "swap", preload: false });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap", preload: false });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap", preload: false });
const libre = Libre_Baskerville({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-libre", display: "swap", preload: false });
const merriweather = Merriweather({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-merriweather", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl("/")),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  category: "business",
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, telephone: false },
  alternates: { canonical: "/" },
  // Square icons only — Google Search drops non-1:1 favicons (old logo was 512×341).
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { "max-image-preview": "large", "max-snippet": -1 },
  },
};

/** Keyboard overlays the page instead of resizing it — stops mobile field shake. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
};

const fontVars = [
  outfit.variable,
  googleSans.variable,
  dmSans.variable,
  inter.variable,
  roboto.variable,
  montserrat.variable,
  poppins.variable,
  sourceSerif.variable,
  lora.variable,
  libre.variable,
  merriweather.variable,
  playfair.variable,
].join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body className={outfit.className}>
        <AppShell />
        {children}
      </body>
    </html>
  );
}

//