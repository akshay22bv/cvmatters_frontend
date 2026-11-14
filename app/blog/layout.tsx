import type { Metadata } from "next";
import { BlogChrome } from "@/components/BlogChrome";
import { SITE_NAME } from "@/lib/site";
import "../blog.css";

export const metadata: Metadata = {
  title: {
    default: `Career blog · ${SITE_NAME}`,
    template: `%s · ${SITE_NAME}`,
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <BlogChrome>{children}</BlogChrome>;
}
