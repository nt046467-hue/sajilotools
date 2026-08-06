import type { Metadata } from "next";
import ToolsCatalogClient from "@/components/ToolsCatalogClient";

export const metadata: Metadata = {
  title: "All Free Online Tools | SajiloTools",
  description:
    "Explore our complete directory of free online tools — EMI calculator, BS to AD date converter, land converter, PDF utilities, tax calculator, JSON formatters, and more. Fast, private, no sign-up.",
  alternates: {
    canonical: "https://sajilotools.vercel.app/tools",
  },
  openGraph: {
    title: "All Free Online Tools | SajiloTools",
    description:
      "Explore 100+ free online tools for Nepal — calculators, date converters, PDF tools, image utilities, developer tools, and text helpers.",
    url: "https://sajilotools.vercel.app/tools",
    siteName: "SajiloTools",
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Free Online Tools | SajiloTools",
    description:
      "Explore 100+ free online tools for Nepal — calculators, date converters, PDF tools, image utilities, developer tools, and text helpers.",
    images: ["/images/og-default.png"],
  },
};

export default function ToolsPage() {
  return <ToolsCatalogClient />;
}
