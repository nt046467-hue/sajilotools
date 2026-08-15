// ─── CENTRAL SITE CONFIGURATION ─────────────────────────────────────────────
// Single source of truth for canonical domains, brand metadata, and SEO constants.

import { TOOLS } from "./tools-registry";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://sajilotools.vercel.app";

// Ensure no trailing slash for consistent URL composition
export const SITE_URL = rawSiteUrl.trim().replace(/\/+$/, "");

export const SITE_CONFIG = {
  name: "SajiloTools",
  brandName: "SajiloTools",
  tagline: "Free Online Tools Made Simple for Nepal",
  description:
    "SajiloTools is a free collection of fast, private online tools including Nepali date conversion, translation, PDF utilities, image converters, calculators, and developer tools. No signup required.",
  url: SITE_URL,
  locale: "en_US",
  language: "en",
  defaultOgImage: "/images/og-default.png",
  twitterHandle: "@sajilotools",
  authors: [{ name: "SajiloTools", url: SITE_URL }],
  creator: "SajiloTools",
  publisher: "SajiloTools",
  get toolCount(): number {
    return TOOLS.length;
  },
  get toolCountDisplay(): string {
    return `${TOOLS.length}+`;
  },
};

/**
 * Generate a canonical absolute URL from a given path.
 * Handles leading/trailing slashes reliably.
 */
export function getCanonicalUrl(path: string = ""): string {
  if (!path || path === "/") return SITE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}
