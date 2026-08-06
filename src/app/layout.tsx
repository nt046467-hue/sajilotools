import type { Metadata, Viewport } from "next";
import { Inter, Sora, Noto_Sans_Devanagari } from "next/font/google";
import "@/styles/index.css";
import { NextAuthProvider } from "./providers";

import PwaRegister from "@/components/PwaRegister";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://sajilotools.vercel.app"),
  applicationName: "SajiloTools",
  title: {
    default: "SajiloTools – 100+ Free Online Tools | PDF, Image, SEO & Calculator Tools",
    template: "%s | SajiloTools",
  },
  description:
    "SajiloTools is a free collection of online tools including PDF tools, image converters, QR generators, calculators, text utilities, SEO tools, developer tools and AI-powered utilities. Fast, secure and no signup required.",
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
  ],
  authors: [{ name: "SajiloTools" }],
  creator: "SajiloTools",
  publisher: "SajiloTools",
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
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
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
    siteName: "SajiloTools",
    title: "SajiloTools – 100+ Free Online Tools | PDF, Image, SEO & Calculator Tools",
    description:
      "SajiloTools is a free collection of online tools including PDF tools, image converters, QR generators, calculators, text utilities, SEO tools, developer tools and AI-powered utilities. Fast, secure and no signup required.",
    url: "https://sajilotools.vercel.app",
    images: [{ url: "/images/og-default.png", width: 1200, height: 630, alt: "SajiloTools – Free Online Tools" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SajiloTools – 100+ Free Online Tools | PDF, Image, SEO & Calculator Tools",
    description:
      "SajiloTools is a free collection of online tools including PDF tools, image converters, QR generators, calculators, text utilities, SEO tools, developer tools and AI-powered utilities. Fast, secure and no signup required.",
    images: ["/images/og-default.png"],
    creator: "@sajilotools",
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
        "@id": "https://sajilotools.vercel.app/#organization",
        "name": "SajiloTools",
        "url": "https://sajilotools.vercel.app/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://sajilotools.vercel.app/android-chrome-512x512.png",
          "width": 512,
          "height": 512
        },
        "description": "100+ free online tools for PDF, image, text, developer, finance, and Nepal-specific utilities.",
        "sameAs": [
          "https://github.com/sajilotools",
          "https://linkedin.com/company/sajilotools",
          "https://twitter.com/sajilotools",
          "https://facebook.com/sajilotools",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://sajilotools.vercel.app/#website",
        "url": "https://sajilotools.vercel.app/",
        "name": "SajiloTools",
        "alternateName": ["Sajilo Tools", "SajiloTools.app", "Sajilo Tools Nepal"],
        "description": "Free collection of 100+ online tools including PDF tools, image converters, QR generators, calculators, text utilities, SEO tools, developer tools and AI-powered utilities.",
        "publisher": {
          "@id": "https://sajilotools.vercel.app/#organization",
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://sajilotools.vercel.app/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "CollectionPage",
        "@id": "https://sajilotools.vercel.app/#collectionpage",
        "url": "https://sajilotools.vercel.app/",
        "name": "SajiloTools – All Free Online Tools",
        "description": "Browse 100+ free online tools organized by category: PDF, Image, Text, Developer, Finance, and Nepal Tools.",
        "isPartOf": {
          "@id": "https://sajilotools.vercel.app/#website",
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
      <head>
        <meta name="google-adsense-account" content="ca-pub-3896962422851508" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {adsenseClientId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={inter.className}>
        <NextAuthProvider>{children}</NextAuthProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
