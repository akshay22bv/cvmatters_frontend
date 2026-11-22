import { renderHtmlToPdf } from "@/lib/server/renderPdf";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function apiOrigin() {
  return (process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000").replace(/\/$/, "");
}

/** Visitor PDF on shared profiles; owners need a subscription when signed in. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const key = String(id || "").trim();
    if (!key) {
      return Response.json({ error: "That resume isn't shared." }, { status: 404 });
    }

    const origin = apiOrigin();
    const auth = req.headers.get("authorization") || "";
    const publicRes = await fetch(`${origin}/api/resumes/${encodeURIComponent(key)}/public`, {
      cache: "no-store",
      headers: auth ? { Authorization: auth } : {},
    });
    if (!publicRes.ok) {
      return Response.json({ error: "That resume isn't shared." }, { status: 404 });
    }

    if (auth) {
      const publicRecord = (await publicRes.clone().json()) as { isMine?: boolean };
      const meRes = await fetch(`${origin}/api/auth/me`, {
        headers: { Authorization: auth },
        cache: "no-store",
      });
      if (meRes.ok) {
        const me = (await meRes.json()) as { entitlement?: { canDownload?: boolean } };
        if (publicRecord.isMine && !me.entitlement?.canDownload) {
          return Response.json(
            { error: "Downloads come with a subscription.", code: "upgrade" },
            { status: 402 },
          );
        }
      }
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