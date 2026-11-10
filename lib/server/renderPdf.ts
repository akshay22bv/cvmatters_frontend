import fs from "fs";
import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

/** Matched to @sparticuz/chromium@131 (Puppeteer v23). */
const CHROMIUM_PACK =
  process.env.CHROMIUM_PACK_URL ||
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.x64.tar";

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
].filter(Boolean);

function onVercel() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

function usePackagedChromium() {
  if (onVercel()) return true;
  if (process.env.USE_PACKAGED_CHROMIUM === "1") return true;
  return Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function localChromePath() {
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  return CHROME_CANDIDATES.find((candidate) => fs.existsSync(candidate)) || null;
}

async function launchBrowser(): Promise<Browser> {
  const extraArgs = ["--disable-dev-shm-usage", "--font-render-hinting=none", "--hide-scrollbars", "--no-sandbox"];

  if (usePackagedChromium()) {
    chromium.setGraphicsMode = false;
    const executablePath = await chromium.executablePath(CHROMIUM_PACK);
    return puppeteer.launch({
      args: [...chromium.args, ...extraArgs],
      defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 1 },
      executablePath,
      headless: true,
    });
  }

  const path = localChromePath();
  if (!path) {
    throw new Error("Google Chrome is needed to build a sharp PDF.");
  }

  return puppeteer.launch({
    executablePath: path,
    headless: true,
    args: extraArgs,
  });
}

/** Vector PDF via Chromium print (sharp at any zoom). One browser per request on serverless. */
export async function renderHtmlToPdf(html: string) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
      await page.emulateMediaType("print");
      await page.setContent(html, { waitUntil: "load", timeout: 45000 });
      await page.evaluate(async () => {
        await Promise.all([...document.fonts].map((face) => face.load().catch(() => {})));
        await document.fonts.ready;
      });
      const pdf = await page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });
      return Buffer.from(pdf);
    } finally {
      await page.close().catch(() => {});
    }
  } finally {
    await browser.close().catch(() => {});
  }
}
