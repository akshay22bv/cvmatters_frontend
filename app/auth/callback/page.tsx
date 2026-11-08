"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadScreen } from "@/components/LoadScreen";
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

  return <LoadScreen message="Signing you in…" variant="standalone" />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadScreen message="Signing you in…" variant="standalone" />}>
      <FinishAuth />
    </Suspense>
  );
}
