/**
 * Download prefers the server Chrome print path when it is available.
 * On hosts without Chrome (common on Vercel), it falls back to painting
 * each A4 page in the browser with html2canvas + jsPDF so mobile still works.
 *
 * `printResume` opens the browser print sheet for anyone who wants to save
 * the file themselves.
 */

import { readToken } from "./session";

function fileName(name: string) {
  const clean = name.replace(/[^\w\s-]+/g, "").trim().replace(/\s+/g, "-");
  return `${clean || "CV"}.pdf`;
}

function pages() {
  const root = document.querySelector(".print-root");
  return [...(root?.querySelectorAll(":scope > div > .paper") || [])] as HTMLElement[];
}

function stylesheetText() {
  const parts: string[] = [];
  for (const sheet of document.styleSheets) {
    try {
      parts.push([...sheet.cssRules].map((rule) => rule.cssText).join("\n"));
    } catch {
      // a sheet the page cannot read is skipped; the rest still travel with the file
    }
  }
  return parts.join("\n").replace(/<\/style/gi, "<\\/style");
}

const GENERIC_FAMILIES = new Set(["sans-serif", "serif", "monospace", "cursive", "fantasy", "system-ui", "emoji", "math", "fangsong", "ui-sans-serif", "ui-serif", "ui-monospace"]);

/** Family names actually painted on the resume, so the file carries those fonts and not a fallback. */
function usedFontFamilies() {
  const names = new Set<string>();
  const root = document.querySelector(".print-root");
  if (!root) return names;
  for (const node of [root, ...root.querySelectorAll("*")]) {
    const family = getComputedStyle(node).fontFamily;
    for (const part of family.split(",")) {
      const name = part.trim().replace(/^['"]|['"]$/g, "");
      if (!name || GENERIC_FAMILIES.has(name.toLowerCase()) || name.endsWith("Fallback")) continue;
      names.add(name);
    }
  }
  return names;
}

function faceFamily(block: string) {
  const match = block.match(/font-family:\s*([^;]+);/i);
  if (!match) return "";
  return match[1].trim().replace(/^['"]|['"]$/g, "");
}

/** Drop webfonts the page never uses, and keep the ones it does inside the file. */
async function embedUsedFonts(css: string) {
  const families = usedFontFamilies();
  const kept = css.replace(/@font-face\s*\{[^}]*\}/g, (block) => {
    const family = faceFamily(block);
    if (!family) return block;
    if (families.has(family) || family.endsWith("Fallback") || !/url\(/.test(block)) return block;
    return "";
  });
  const urls = new Set<string>();
  for (const match of kept.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
    const url = match[2].trim();
    if (!url.startsWith("data:") && /\.(?:woff2?|ttf|otf)(?:\?|$)/i.test(url)) urls.add(url);
  }
  const replacements = new Map<string, string>();
  await Promise.all(
    [...urls].map(async (url) => {
      try {
        const response = await fetch(new URL(url, location.origin).href);
        if (!response.ok) return;
        const bytes = new Uint8Array(await response.arrayBuffer());
        let binary = "";
        for (let index = 0; index < bytes.length; index += 0x8000) {
          binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
        }
        const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
        const type = ext === "woff2" ? "font/woff2" : ext === "woff" ? "font/woff" : ext === "otf" ? "font/otf" : "font/ttf";
        replacements.set(url, `data:${type};base64,${btoa(binary)}`);
      } catch {
        // a face that cannot be read stays as an address; the others still match the page
      }
    }),
  );
  return kept
    .replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote: string, raw: string) => {
      const data = replacements.get(raw.trim());
      return data ? `url(${quote}${data}${quote})` : match;
    })
    .replace(/font-display:\s*swap/gi, "font-display:block");
}

function attr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/** The pages, plus the CSS and the same font files the preview uses, as one document. */
async function printDocument() {
  const root = document.querySelector(".print-root");
  if (!root || !pages().length) throw new Error("Nothing to download");
  const markup = root.outerHTML.replace(/<script[\s\S]*?<\/script>/gi, "");
  const css = await embedUsedFonts(stylesheetText());
  return `<!doctype html>
<html class="${attr(document.documentElement.className)}">
<head>
<meta charset="utf-8">
<base href="${location.origin}/">
<style>${css}</style>
<style>
  @page { size: A4; margin: 0; }
  html, body {
    height: auto !important;
    min-height: 0 !important;
    margin: 0;
    padding: 0;
    overflow: visible !important;
    background: #fff !important;
  }
  .print-root {
    display: block !important;
    position: static !important;
    left: auto !important;
    top: auto !important;
    width: auto !important;
    transform: none !important;
  }
  .print-root,
  .print-root > div,
  .print-root .paper,
  .print-root .paper::before,
  .print-root .paper::after,
  .print-root .page-slot {
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  .print-root .paper {
    overflow: hidden !important;
    width: 794px !important;
    height: 1123px !important;
    max-width: none !important;
    transform: none !important;
    zoom: 1 !important;
  }
  .continued { display: none !important; }
</style>
</head>
<body class="${attr(document.body.className)}">${markup}</body>
</html>`;
}

function isIos() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function cssForCanvas(value: string) {
  if (!/color-mix|color\s*\(/i.test(value)) return value;
  return value
    .replace(/color-mix\([^;{}]*\)/g, "transparent")
    .replace(/color\([^;{}]*\)/g, "transparent");
}

/** html2canvas cannot parse `color-mix()` / `color()` in stylesheets — inline what the browser already computed. */
function mirrorComputedStyles(live: Element, clone: HTMLElement) {
  const computed = getComputedStyle(live);
  for (let index = 0; index < computed.length; index += 1) {
    const prop = computed.item(index);
    clone.style.setProperty(prop, cssForCanvas(computed.getPropertyValue(prop)), computed.getPropertyPriority(prop));
  }
  const liveKids = live.children;
  const cloneKids = clone.children;
  for (let index = 0; index < liveKids.length; index += 1) {
    const liveKid = liveKids[index];
    const cloneKid = cloneKids[index];
    if (liveKid && cloneKid) mirrorComputedStyles(liveKid, cloneKid as HTMLElement);
  }
}

function prepareCloneForCanvas(clonedDoc: Document, liveRoot: HTMLElement, clonedRoot: HTMLElement) {
  clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
    if (node instanceof HTMLStyleElement) {
      node.textContent =
        node.textContent?.replace(/color-mix\([^;{}]*\)/g, "transparent").replace(/color\([^;{}]*\)/g, "transparent") ?? "";
    } else {
      node.remove();
    }
  });
  mirrorComputedStyles(liveRoot, clonedRoot);
}

async function saveBlob(blob: Blob, name: string) {
  const out = fileName(name);
  const file = new File([blob], out, { type: "application/pdf" });
  if (isIos() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: out });
      return;
    } catch (reason) {
      if (reason instanceof Error && reason.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = out;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function freezeSheetLayout(node: HTMLElement) {
  const saved = {
    transform: node.style.transform,
    width: node.style.width,
    height: node.style.height,
    maxWidth: node.style.maxWidth,
  };
  node.style.transform = "none";
  node.style.width = "794px";
  node.style.height = "1123px";
  node.style.maxWidth = "none";
  return () => {
    node.style.transform = saved.transform;
    node.style.width = saved.width;
    node.style.height = saved.height;
    node.style.maxWidth = saved.maxWidth;
  };
}

/** Client-side A4 export when the API has no Chromium (always raster — zoom will pixelate). */
async function downloadClientPdf(name: string) {
  const sheets = pages();
  if (!sheets.length) throw new Error("Nothing to download");

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: false });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  // ~192 DPI on A4 (794 CSS px × 2.5)
  const rasterScale = 2.5;

  for (let index = 0; index < sheets.length; index += 1) {
    const node = sheets[index];
    const restore = freezeSheetLayout(node);
    try {
      const canvas = await html2canvas(node, {
        scale: rasterScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        onclone: (clonedDoc, clonedNode) => prepareCloneForCanvas(clonedDoc, node, clonedNode),
      });
      const image = canvas.toDataURL("image/jpeg", 0.96);
      if (index > 0) pdf.addPage();
      const aspect = canvas.height / canvas.width;
      const drawH = pageW * aspect;
      pdf.addImage(image, "JPEG", 0, 0, pageW, drawH, undefined, "FAST");
    } finally {
      restore();
    }
  }

  const blob = pdf.output("blob");
  saveBlob(blob, name);
}

async function downloadServerPdf(name: string) {
  const token = readToken();
  const response = await fetch("/api/resumes/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ html: await printDocument() }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error || "Couldn't download the PDF.") as Error & { status?: number; code?: string };
    error.status = response.status;
    error.code = body.code;
    throw error;
  }
  const engine = response.headers.get("X-Pdf-Engine");
  if (!engine) {
    console.warn("PDF response missing X-Pdf-Engine — file may be a low-quality fallback path.");
  }
  saveBlob(await response.blob(), name);
}

export async function downloadResumePdf(name: string) {
  let serverError: unknown = null;
  try {
    await downloadServerPdf(name);
    return;
  } catch (reason) {
    serverError = reason;
    const status = reason && typeof reason === "object" && "status" in reason ? Number(reason.status) : 0;
    // Auth / paywall must stay visible.
    if (status === 401 || status === 402) throw reason;
  }

  // On production prefer a clear error over a blurry screenshot PDF.
  const onLive =
    typeof location !== "undefined" &&
    !/localhost|127\.0\.0\.1/.test(location.hostname);
  if (onLive) {
    const message =
      serverError instanceof Error ? serverError.message : "Couldn't build a sharp PDF on the server.";
    throw new Error(`${message} Try again in a moment or use Print → Save as PDF.`);
  }

  try {
    await downloadClientPdf(name);
  } catch (fallback) {
    const primary = serverError instanceof Error ? serverError.message : "Couldn't build a sharp PDF on the server.";
    if (fallback instanceof Error) throw new Error(fallback.message || primary);
    throw new Error(primary);
  }
}

/**
 * Opens the browser's print sheet on the resume alone. Choose "Save as PDF"
 * there for the same sharp file. Margins must stay at none and headers off,
 * which the print stylesheet sets up.
 */
export function printResume(name: string) {
  if (!pages().length) throw new Error("Nothing to print");
  const title = document.title;
  document.title = fileName(name).replace(/\.pdf$/, "");
  const restore = () => {
    document.title = title;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
  window.setTimeout(restore, 4000);
}
