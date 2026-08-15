import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ShieldCheck, Heart, Info, Code2, MapPin, Lock, Cpu } from "lucide-react";

import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";
import { TOOLS } from "@/lib/tools-registry";

export const metadata: Metadata = {
  title: "About Us – Platform & Mission",
  description:
    `Discover SajiloTools — a privacy-first web utility suite providing ${TOOLS.length}+ free tools for developers, finance, PDF processing, and Nepal-specific localization.`,
  alternates: {
    canonical: getCanonicalUrl("/about"),
  },
  openGraph: {
    title: "About Us – Platform & Mission",
    description:
      `Learn about SajiloTools — fast, privacy-respecting, free digital utilities built for Nepal and global users with ${TOOLS.length}+ tools.`,
    url: getCanonicalUrl("/about"),
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: SITE_CONFIG.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us – Platform & Mission",
    description:
      `Learn about SajiloTools — fast, privacy-respecting, free digital utilities built for Nepal and global users with ${TOOLS.length}+ tools.`,
    images: ["/images/og-default.png"],
  },
};

export default function AboutPage() {
  return (
    <div className="text-[#18181B] dark:text-[#F4F4F5] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs font-semibold text-[#F5A623]">
            <Info size={14} /> ABOUT SAJILOTOOLS
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight font-sora">
            Empowering Users with Fast, Private Digital Utilities
          </h1>
          <p className="text-base sm:text-lg text-[#71717A] dark:text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            SajiloTools is an independent, free web utility platform designed to solve daily digital tasks — from document processing and developer tools to specialized Nepalese financial and administrative calculations.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="p-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-4 shadow-sm">
          <h2 className="text-2xl font-bold font-sora">Our Mission & Purpose</h2>
          <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            Everyday web utilities should be simple, instantaneous, and trustworthy. Too often, online converters and calculators force users through intrusive sign-up walls, mandatory software downloads, hidden fees, or unnecessary document uploads to unverified cloud servers.
          </p>
          <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            SajiloTools was created to provide a clean, high-performance alternative. Our core focus is <strong>in-browser processing</strong>, ensuring that your raw data, images, text, and documents remain securely on your local device whenever technically feasible.
          </p>
        </div>

        {/* Technical Architecture & Privacy Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-7 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Cpu size={20} />
            </div>
            <h3 className="font-bold text-lg font-sora">Client-Side Architecture</h3>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              We leverage modern browser capabilities including HTML5 Canvas, WebAssembly (WASM), Web Crypto API, and client-side JavaScript. PDF merging, image compression, token generation, and hash calculations run 100% locally inside your web browser sandbox.
            </p>
          </div>

          <div className="p-7 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold text-lg font-sora">Built for Nepal & Global Use</h3>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              While our developer and text tools serve a global audience, SajiloTools offers dedicated localization for Nepal — including Bikram Sambat (BS) date conversion, Ropani/Bigha land measurement, NRs currency rates, provincial vehicle road tax, and local IRD income tax calculators.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-[#F5A623]">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-base font-sora">Instant & Free</h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              Zero registration, no credit cards, no mandatory logins. Every utility is ready to use the moment the page loads.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-base font-sora">Data Privacy Boundaries</h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              We clearly disclose when a tool runs strictly in browser memory versus when external API reference data is retrieved (e.g. live NRB currency rates).
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Code2 size={20} />
            </div>
            <h3 className="font-bold text-base font-sora">Mobile Optimized</h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              Designed from the ground up to be responsive, lightweight, and efficient across mobile, tablet, and desktop devices.
            </p>
          </div>
        </div>

        {/* Transparency Note */}
        <div className="p-8 bg-[#FAFAF8] dark:bg-[#141829]/60 border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-3">
          <h2 className="text-xl font-bold font-sora">Questions or Feedback?</h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            SajiloTools is continuously evolving based on user suggestions and technical improvements. If you notice a calculation discrepancy, need a new tool feature, or want to share feedback, reach out to us at{" "}
            <a href="mailto:sajilotool@gmail.com" className="text-[#1F2544] dark:text-[#F5A623] font-semibold underline">
              sajilotool@gmail.com
            </a>{" "}
            or visit our <Link href="/contact" className="text-[#1F2544] dark:text-[#F5A623] font-semibold underline">Contact Page</Link>.
          </p>
        </div>

        {/* Footer CTA */}
        <div className="text-center pt-4">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Explore All {TOOLS.length}+ Tools →
          </Link>
        </div>
      </div>
    </div>
  );
}
