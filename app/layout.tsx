import type { Metadata, Viewport } from "next";
import { DEFAULT_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, siteUrl } from "@/lib/site";
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
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-roboto", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const poppins = Poppins({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-poppins", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });
const libre = Libre_Baskerville({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-libre", display: "swap" });
const merriweather = Merriweather({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-merriweather", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

/** Keyboard overlays the page instead of resizing it — stops mobile field shake. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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