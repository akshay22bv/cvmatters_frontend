"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PublicCvPage } from "./PublicCvPage";
import { loginPath } from "@/lib/paths";
import { downloadPublicResumePdf } from "@/lib/pdf";
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

  useEffect(() => {
    owner.current = readOwnerKey();
  }, []);

  const requestDownload = (name: string) => {
    setDownloadError("");
    setDownloading(true);
    void downloadPublicResumePdf(name, id)
      .catch((error) => {
        setDownloadError(error instanceof Error ? error.message : "Couldn't download the PDF.");
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  const returnPath = `/${id}`;

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
      />
    </div>
  );
}