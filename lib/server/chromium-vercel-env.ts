/**
 * Sparticuz only unpacks AL2023 shared libs when it detects Lambda Node 20+.
 * Vercel Fluid Compute omits AWS_* vars — set this before @sparticuz/chromium loads.
 */
if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) {
  process.env.AWS_LAMBDA_JS_RUNTIME ??= "nodejs22.x";
}
