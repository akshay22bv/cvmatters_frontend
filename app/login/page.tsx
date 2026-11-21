import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageClient } from "@/components/AuthPageClient";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `Sign in · ${SITE_NAME}` },
  description: `Sign in to your ${SITE_NAME} account to manage your resumes, public link, and PDF exports.`,
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageClient initialMode="login" />
    </Suspense>
  );
}
