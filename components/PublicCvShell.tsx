"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlanDialog } from "./PlanDialog";
import { PublicCvPage } from "./PublicCvPage";
import { loginPath } from "@/lib/paths";
import { downloadPublicResumePdf, downloadResumePdf } from "@/lib/pdf";
import { useAccount } from "@/lib/useAccount";
import type { ResumeRecord } from "@/lib/types";

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
  const router = useRouter();
  const owner = useRef("");
  const account = useAccount(() => owner.current);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [record, setRecord] = useState<(ResumeRecord & { isMine?: boolean }) | null>(initialRecord || null);
  const [planOpen, setPlanOpen] = useState(false);

  useEffect(() => {
    owner.current = readOwnerKey();
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("is-public-cv-view");
    return () => document.documentElement.classList.remove("is-public-cv-view");
  }, []);

  const returnPath = `/${id}`;

  const requestDownload = (name: string) => {
    setDownloadError("");
    const mine = Boolean(record?.isMine);

    if (mine) {
      if (!account.user) {
        router.push(loginPath(returnPath));
        return;
      }
      if (!account.entitlement.canDownload) {
        setPlanOpen(true);
        return;
      }
      setDownloading(true);
      void downloadResumePdf(name, { entitled: true })
        .catch((error) => {
          setDownloadError(error instanceof Error ? error.message : "Couldn't download the PDF.");
        })
        .finally(() => {
          setDownloading(false);
        });
      return;
    }

    setDownloading(true);
    void downloadPublicResumePdf(name, id)
      .catch((error) => {
        const status = error && typeof error === "object" && "status" in error ? Number(error.status) : 0;
        if (status === 402) {
          setPlanOpen(true);
          return;
        }
        setDownloadError(error instanceof Error ? error.message : "Couldn't download the PDF.");
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  return (
    <div className="app-frame is-public">
      <PublicCvPage
        id={id}
        initialRecord={initialRecord}
        signedIn={!!account.user}
        downloading={downloading}
        downloadError={downloadError}
        onSignIn={() => router.push(loginPath(returnPath))}
        onDownload={requestDownload}
        onRecord={setRecord}
      />
      <PlanDialog
        open={planOpen}
        account={account}
        reason="Unlock PDF downloads on your account."
        onClose={() => setPlanOpen(false)}
        onSignIn={() => router.push(loginPath(returnPath))}
        onPaid={() => {
          setPlanOpen(false);
          const name = record?.data.personal.fullName.trim() || "CV";
          if (!account.entitlement.canDownload) return;
          setDownloading(true);
          void downloadResumePdf(name, { entitled: true })
            .catch((error) => {
              setDownloadError(error instanceof Error ? error.message : "Couldn't download the PDF.");
            })
            .finally(() => setDownloading(false));
        }}
      />
    </div>
  );
}