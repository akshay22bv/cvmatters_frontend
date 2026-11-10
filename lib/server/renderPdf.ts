import fs from "fs";
import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

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
    const packUrl = process.env.CHROMIUM_PACK_URL?.trim();
    const executablePath = packUrl
      ? await chromium.executablePath(packUrl)
      : await chromium.executablePath();
    return puppeteer.launch({
      args: [...chromium.args, ...extraArgs],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
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
      await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 55_000 });
      await page.evaluate(async () => {
        const fontsReady = Promise.all([...document.fonts].map((face) => face.load().catch(() => {})));
        const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 2500));
        await Promise.race([fontsReady.then(() => document.fonts.ready), timeout]);
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
