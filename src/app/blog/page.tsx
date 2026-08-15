import type { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";

import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Guides & Articles",
  description:
    "Practical guides on Nepal income tax, land measurement, Bikram Sambat calendar, and more — with direct links to free online tools.",
  alternates: {
    canonical: getCanonicalUrl("/blog"),
  },
  openGraph: {
    title: "Guides & Articles",
    description:
      "Practical guides on Nepal income tax, land measurement, Bikram Sambat calendar, and more.",
    url: getCanonicalUrl("/blog"),
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: SITE_CONFIG.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guides & Articles",
    description:
      "Practical guides on Nepal income tax, land measurement, Bikram Sambat calendar, and more.",
    images: ["/images/og-default.png"],
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
