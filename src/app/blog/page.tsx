import type { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Guides & Articles | SajiloTools",
  description:
    "Practical guides on Nepal income tax, land measurement, Bikram Sambat calendar, and more — with direct links to free online tools.",
  openGraph: {
    title: "Guides & Articles | SajiloTools",
    description:
      "Practical guides on Nepal income tax, land measurement, Bikram Sambat calendar, and more.",
    url: "https://sajilotools.vercel.app/blog",
    siteName: "SajiloTools",
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guides & Articles | SajiloTools",
    description:
      "Practical guides on Nepal income tax, land measurement, Bikram Sambat calendar, and more.",
    images: ["/images/og-default.png"],
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
