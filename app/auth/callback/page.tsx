"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { writeToken } from "@/lib/session";

function FinishAuth() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");
    if (token) writeToken(token);
    const next = error ? `/?auth_error=${encodeURIComponent(error)}` : "/cv/details";
    // Full navigation so the root shell reloads the session from storage.
    window.location.replace(next);
  }, [params, router]);

  return <p className="auth-callback">Signing you in…</p>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="auth-callback">Signing you in…</p>}>
      <FinishAuth />
    </Suspense>
  );
}
