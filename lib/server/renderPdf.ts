import "./chromium-vercel-env";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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
  // Never use host Chrome on Vercel — it is not in the container and breaks with libnss3 errors.
  if (onVercel()) return null;
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  return CHROME_CANDIDATES.find((candidate) => fs.existsSync(candidate)) || null;
}

function packagedChromiumBinDir(): string | null {
  try {
    const pkgRoot = path.dirname(fileURLToPath(import.meta.url));
    const fromRoute = path.join(pkgRoot, "..", "..", "node_modules", "@sparticuz", "chromium", "bin");
    if (fs.existsSync(fromRoute)) return fromRoute;
  } catch {
    // import.meta may be unavailable in some bundles
  }
  const fromCwd = path.join(process.cwd(), "node_modules", "@sparticuz", "chromium", "bin");
  return fs.existsSync(fromCwd) ? fromCwd : null;
}

/** Stale /tmp/chromium from a half-failed run blocks lib extraction and causes libnss3 errors. */
function resetStaleChromiumExtract() {
  if (!fs.existsSync("/tmp/chromium")) return;
  const libCandidates = ["/tmp/al2023/lib/libnss3.so", "/tmp/al2/lib/libnss3.so"];
  if (libCandidates.some((lib) => fs.existsSync(lib))) return;
  try {
    fs.unlinkSync("/tmp/chromium");
  } catch {
    // ignore
  }
}

async function launchBrowser(): Promise<Browser> {
  const extraArgs = ["--disable-dev-shm-usage", "--font-render-hinting=none", "--hide-scrollbars", "--no-sandbox"];

  if (usePackagedChromium()) {
    chromium.setGraphicsMode = false;
    resetStaleChromiumExtract();

    const packUrl = onVercel() ? "" : process.env.CHROMIUM_PACK_URL?.trim();
    const binDir = packagedChromiumBinDir();
    let executablePath: string;
    if (packUrl) {
      executablePath = await chromium.executablePath(packUrl);
    } else if (binDir) {
      executablePath = await chromium.executablePath(binDir);
    } else {
      executablePath = await chromium.executablePath();
    }
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
