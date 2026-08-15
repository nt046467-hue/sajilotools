import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the SajiloTools team for support, feature requests, feedback, or inquiries.",
  alternates: {
    canonical: getCanonicalUrl("/contact"),
  },
  openGraph: {
    title: "Contact Us",
    description:
      "Get in touch with the SajiloTools team for support, feature requests, feedback, or inquiries.",
    url: getCanonicalUrl("/contact"),
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: SITE_CONFIG.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us",
    description:
      "Get in touch with the SajiloTools team for support, feature requests, feedback, or inquiries.",
    images: ["/images/og-default.png"],
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
