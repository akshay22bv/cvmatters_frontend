import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageClient } from "@/components/AuthPageClient";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `Create an account · ${SITE_NAME}` },
  description: `Create a free ${SITE_NAME} account to save your CVs, publish a shareable resume link, and export PDFs.`,
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageClient initialMode="signup" />
    </Suspense>
  );
}
