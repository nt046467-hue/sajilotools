import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Sora, Noto_Sans_Devanagari } from "next/font/google";
import "@/styles/index.css";
import { NextAuthProvider } from "./providers";

import PwaRegister from "@/components/PwaRegister";
import CookieConsent from "@/components/CookieConsent";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0F1E" },
  ],
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-sora",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-devanagari",
});

import { SITE_CONFIG, SITE_URL, getCanonicalUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_CONFIG.name,
  title: {
    default: "SajiloTools – Free Online Tools Made Simple for Nepal",
    template: "%s | SajiloTools",
  },
  description:
    `SajiloTools is a free collection of ${SITE_CONFIG.toolCountDisplay} fast, private online tools including Nepali date conversion, translation, PDF utilities, image converters, calculators, and developer tools. No signup required.`,
  generator: "Next.js",
  keywords: [
    "SajiloTools",
    "online tools",
    "PDF tools",
    "image converter",
    "QR generator",
    "calculator",
    "AI tools",
    "text tools",
    "SEO tools",
    "free utilities",
    "Nepal online tools",
    "Nepali translator",
    "Nepali date converter",
  ],
  authors: [{ name: SITE_CONFIG.name, url: SITE_URL }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  category: "Technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "mask-icon", url: "/mask-icon.svg", color: "#0D9488" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.name,
    title: "SajiloTools – Free Online Tools Made Simple for Nepal",
    description:
      `Calculate, convert, translate, compress and simplify everyday digital tasks with ${SITE_CONFIG.toolCountDisplay} fast, free online tools. Built for Nepal.`,
    url: SITE_URL,
    images: [{ url: "/images/og-default.png", width: 1200, height: 630, alt: "SajiloTools – Free Online Tools" }],
    locale: SITE_CONFIG.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: "SajiloTools – Free Online Tools Made Simple for Nepal",
    description:
      `Calculate, convert, translate, compress and simplify everyday digital tasks with ${SITE_CONFIG.toolCountDisplay} fast, free online tools. Built for Nepal.`,
    images: ["/images/og-default.png"],
    creator: SITE_CONFIG.twitterHandle,
  },
  other: {
    "google-adsense-account": "ca-pub-3896962422851508",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "I67sUfONhkQebjAhygVXf7dg-WkTRcxxeNUAaIGFjH0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": SITE_CONFIG.name,
        "url": `${SITE_URL}/`,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/android-chrome-512x512.png`,
          "width": 512,
          "height": 512
        },
        "description": `${SITE_CONFIG.toolCountDisplay} free online tools for PDF, image, text, developer, finance, and Nepal-specific utilities.`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": `${SITE_URL}/`,
        "name": SITE_CONFIG.name,
        "alternateName": ["Sajilo Tools", "SajiloTools Nepal"],
        "description": `Free collection of ${SITE_CONFIG.toolCountDisplay} online tools including PDF tools, image converters, calculators, text utilities, developer tools, and Nepal utilities.`,
        "publisher": {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/#collectionpage`,
        "url": `${SITE_URL}/`,
        "name": "SajiloTools – All Free Online Tools",
        "description": `Browse ${SITE_CONFIG.toolCountDisplay} free online tools organized by category: PDF, Image, Text, Developer, Finance, Nepal, and Everyday Tools.`,
        "isPartOf": {
          "@id": `${SITE_URL}/#website`,
        },
      },
    ],
  };

  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-3896962422851508";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable} ${devanagari.variable}`}
    >
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3896962422851508"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <NextAuthProvider>{children}</NextAuthProvider>
        <PwaRegister />
        <CookieConsent adsenseClientId={adsenseClientId} />
      </body>
    </html>
  );
}
