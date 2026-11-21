import { renderHtmlToPdf } from "@/lib/server/renderPdf";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function apiOrigin() {
  return (process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000").replace(/\/$/, "");
}

/** Public profile PDF — no account or subscription; resume must be shared. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const key = String(id || "").trim();
    if (!key) {
      return Response.json({ error: "That resume isn't shared." }, { status: 404 });
    }

    const origin = apiOrigin();
    const publicRes = await fetch(`${origin}/api/resumes/${encodeURIComponent(key)}/public`, {
      cache: "no-store",
    });
    if (!publicRes.ok) {
      return Response.json({ error: "That resume isn't shared." }, { status: 404 });
    }

    let body: { html?: string };
    try {
      body = (await req.json()) as { html?: string };
    } catch {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    const html = typeof body.html === "string" ? body.html : "";
    if (html.length < 40 || html.length > 8_000_000) {
      return Response.json({ error: "That resume could not be prepared for download." }, { status: 400 });
    }

    const pdf = await renderHtmlToPdf(html);
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
        "X-Pdf-Engine": "chromium",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not build PDF on the server.";
    console.error("Public PDF route error:", error);
    return Response.json({ error: message }, { status: 503 });
  }
}