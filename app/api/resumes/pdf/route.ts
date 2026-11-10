import { renderHtmlToPdf } from "@/lib/server/renderPdf";

export const runtime = "nodejs";
/** Hobby plan allows up to 10s; raise on Pro if PDF times out. */
export const maxDuration = 10;
export const dynamic = "force-dynamic";

function apiOrigin() {
  return (process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000").replace(/\/$/, "");
}

/** Sharp PDF on Vercel (not proxied to Express — path is outside /backend rewrite). */
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const meRes = await fetch(`${apiOrigin()}/api/auth/me`, {
      headers: auth ? { Authorization: auth } : {},
      cache: "no-store",
    });
    if (!meRes.ok) {
      return Response.json({ error: "Sign in to download." }, { status: 401 });
    }
    const me = (await meRes.json()) as { entitlement?: { canDownload?: boolean } };
    if (!me.entitlement?.canDownload) {
      return Response.json({ error: "Downloads come with a subscription.", code: "upgrade" }, { status: 402 });
    }

    let body: { html?: string };
    try {
      body = await req.json();
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
    console.error("PDF route error:", error);
    return Response.json({ error: message }, { status: 503 });
  }
}
