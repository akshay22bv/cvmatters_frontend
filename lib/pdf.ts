/**
 * Download paints the resume with Chrome's own print engine, the same way
 * resume sites that stay sharp under zoom do it. The letters in the file are
 * real text, so magnifying the PDF does not turn them into pixels.
 *
 * `printResume` opens that same print sheet in the browser, for anyone who
 * wants to pick a printer or save the file themselves.
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

export async function downloadResumePdf(name: string) {
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
    throw new Error(body.error || "Couldn't download the PDF.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName(name);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
