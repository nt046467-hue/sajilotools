import type { Metadata } from "next";
import ToolsCatalogClient from "@/components/ToolsCatalogClient";

import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "All Free Online Tools",
  description:
    `Explore our complete directory of ${SITE_CONFIG.toolCountDisplay} free online tools — EMI calculator, BS to AD date converter, land converter, PDF utilities, tax calculator, JSON formatters, and more. Fast, private, no sign-up.`,
  alternates: {
    canonical: getCanonicalUrl("/tools"),
  },
  openGraph: {
    title: "All Free Online Tools",
    description:
      `Explore ${SITE_CONFIG.toolCountDisplay} free online tools for Nepal — calculators, date converters, PDF tools, image utilities, developer tools, and text helpers.`,
    url: getCanonicalUrl("/tools"),
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: SITE_CONFIG.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Free Online Tools",
    description:
      `Explore ${SITE_CONFIG.toolCountDisplay} free online tools for Nepal — calculators, date converters, PDF tools, image utilities, developer tools, and text helpers.`,
    images: ["/images/og-default.png"],
  },
};

export default function ToolsPage() {
  return <ToolsCatalogClient />;
}
