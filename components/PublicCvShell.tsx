"use client";

import { useEffect, useRef, useState } from "react";
import { AuthDialog } from "./AuthDialog";
import { PlanDialog } from "./PlanDialog";
import { PublicCvPage } from "./PublicCvPage";
import { downloadResumePdf } from "@/lib/pdf";
import { useAccount } from "@/lib/useAccount";
import type { Entitlement, ResumeRecord } from "@/lib/types";

function readOwnerKey(): string {
  try {
    const existing = localStorage.getItem("cv-matters-owner");
    if (existing && existing.length >= 8) return existing;
    const fresh = crypto.randomUUID ? crypto.randomUUID() : `owner-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("cv-matters-owner", fresh);
    return fresh;
  } catch {
    return "";
  }
}

export function PublicCvShell({
  id,
  initialRecord,
}: {
  id: string;
  initialRecord?: (ResumeRecord & { isMine?: boolean }) | null;
}) {
  const owner = useRef("");
  const account = useAccount(() => owner.current);
  const [gate, setGate] = useState<null | "auth" | "plan">(null);
  const [gateReason, setGateReason] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const pendingDownload = useRef<string | null>(null);
  const latestEntitlement = useRef<Entitlement | null>(null);

  useEffect(() => {
    owner.current = readOwnerKey();
  }, []);

  const runDownload = async (name: string) => {
    setDownloading(true);
    setDownloadError("");
    try {
      await downloadResumePdf(name);
    } catch (error) {
      const status = error && typeof error === "object" && "status" in error ? Number(error.status) : 0;
      if (status === 401) {
        pendingDownload.current = name;
        setGateReason("Sign in to download this resume.");
        setGate("auth");
      } else if (status === 402) {
        pendingDownload.current = name;
        setGateReason("");
        setGate("plan");
      } else {
        setDownloadError(error instanceof Error ? error.message : "Couldn't download the PDF.");
      }
    } finally {
      setDownloading(false);
    }
  };

  const requestDownload = (name: string) => {
    setDownloadError("");
    if (!account.user) {
      pendingDownload.current = name;
      setGateReason("Sign in to download this resume.");
      setGate("auth");
      return;
    }
    if (!account.entitlement.canDownload) {
      pendingDownload.current = name;
      setGateReason("");
      setGate("plan");
      return;
    }
    void runDownload(name);
  };

  const handleRegister = async (input: { email: string; name: string; password: string }) => {
    const ent = await account.register(input);
    latestEntitlement.current = ent;
    return ent;
  };

  const handleLogin = async (input: { email: string; password: string }) => {
    const ent = await account.login(input);
    latestEntitlement.current = ent;
    return ent;
  };

  return (
    <div className="app-frame is-public">
      <PublicCvPage
        id={id}
        initialRecord={initialRecord}
        signedIn={!!account.user}
        downloading={downloading}
        downloadError={downloadError}
        onSignIn={() => {
          pendingDownload.current = null;
          setGateReason("Sign in to rate this resume.");
          setGate("auth");
        }}
        onDownload={requestDownload}
      />

      <AuthDialog
        open={gate === "auth"}
        reason={gateReason}
        ownerKey={owner.current}
        onRegister={handleRegister}
        onLogin={handleLogin}
        onAuthenticated={() => {
          const wanted = pendingDownload.current;
          const canDownload = latestEntitlement.current?.canDownload ?? account.entitlement.canDownload;
          latestEntitlement.current = null;
          if (!wanted) {
            setGate(null);
            return;
          }
          if (canDownload) {
            pendingDownload.current = null;
            setGate(null);
            void runDownload(wanted);
          } else {
            setGateReason("");
            setGate("plan");
          }
        }}
        onClose={() => {
          pendingDownload.current = null;
          setGate(null);
        }}
      />

      <PlanDialog
        open={gate === "plan"}
        account={account}
        reason={gateReason}
        onClose={() => {
          pendingDownload.current = null;
          setGate(null);
        }}
        onSignIn={() => {
          setGateReason("Sign in to subscribe and download.");
          setGate("auth");
        }}
        onPaid={() => {
          const wanted = pendingDownload.current;
          pendingDownload.current = null;
          setGate(null);
          if (wanted) void runDownload(wanted);
        }}
      />
    </div>
  );
}
