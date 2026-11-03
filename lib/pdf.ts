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

function attr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/** The pages, plus the CSS and font classes that dress them, as one document. */
function printDocument() {
  const root = document.querySelector(".print-root");
  if (!root || !pages().length) throw new Error("Nothing to download");
  const markup = root.outerHTML.replace(/<script[\s\S]*?<\/script>/gi, "");
  return `<!doctype html>
<html class="${attr(document.documentElement.className)}">
<head>
<meta charset="utf-8">
<base href="${location.origin}/">
<style>${stylesheetText()}</style>
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
  }
  .continued { display: none !important; }
</style>
</head>
<body class="${attr(document.body.className)}">${markup}</body>
</html>`;
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName(name);
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // iOS Safari often needs the blob tab kept briefly.
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Client-side A4 export used when the server has no Chrome. */
async function downloadClientPdf(name: string) {
  const sheets = pages();
  if (!sheets.length) throw new Error("Nothing to download");

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let index = 0; index < sheets.length; index += 1) {
    const node = sheets[index];
    const canvas = await html2canvas(node, {
      scale: Math.min(2, window.devicePixelRatio || 1.5),
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 794,
      windowHeight: 1123,
    });
    const image = canvas.toDataURL("image/jpeg", 0.92);
    if (index > 0) pdf.addPage();
    pdf.addImage(image, "JPEG", 0, 0, pageW, pageH, undefined, "FAST");
  }

  const blob = pdf.output("blob");
  saveBlob(blob, name);
}

async function downloadServerPdf(name: string) {
  const token = readToken();
  const response = await fetch("/backend/api/resumes/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ html: printDocument() }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error || "Couldn't download the PDF.") as Error & { status?: number; code?: string };
    error.status = response.status;
    error.code = body.code;
    throw error;
  }
  saveBlob(await response.blob(), name);
}

export async function downloadResumePdf(name: string) {
  try {
    await downloadServerPdf(name);
  } catch (reason) {
    const status = reason && typeof reason === "object" && "status" in reason ? Number(reason.status) : 0;
    // Auth / paywall must stay visible; everything else falls back to the browser.
    if (status === 401 || status === 402) throw reason;
    await downloadClientPdf(name);
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
