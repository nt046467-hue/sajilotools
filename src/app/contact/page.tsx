import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us | SajiloTools",
  description:
    "Get in touch with the SajiloTools team for support, feature requests, or feedback.",
  alternates: {
    canonical: "https://sajilotools.vercel.app/contact",
  },
  openGraph: {
    title: "Contact Us | SajiloTools",
    description:
      "Get in touch with the SajiloTools team for support, feature requests, or feedback.",
    url: "https://sajilotools.vercel.app/contact",
    siteName: "SajiloTools",
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | SajiloTools",
    description:
      "Get in touch with the SajiloTools team for support, feature requests, or feedback.",
    images: ["/images/og-default.png"],
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
