"use client";

import { useRef, useState } from "react";
import { AuthDialog } from "./AuthDialog";
import { PublicCvPage } from "./PublicCvPage";
import { useAccount } from "@/lib/useAccount";
import type { ResumeRecord } from "@/lib/types";

export function PublicCvShell({
  id,
  initialRecord,
}: {
  id: string;
  initialRecord?: (ResumeRecord & { isMine?: boolean }) | null;
}) {
  const owner = useRef("");
  const account = useAccount(() => owner.current);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="app-frame is-public">
      <PublicCvPage
        id={id}
        initialRecord={initialRecord}
        signedIn={!!account.user}
        onSignIn={() => setAuthOpen(true)}
      />
      <AuthDialog
        open={authOpen}
        reason="Sign in to rate this resume."
        ownerKey={owner.current}
        onRegister={account.register}
        onLogin={account.login}
        onAuthenticated={() => setAuthOpen(false)}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
