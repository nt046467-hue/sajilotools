import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ShieldCheck, Heart, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | SajiloTools",
  description:
    "Learn about SajiloTools — fast, privacy-respecting, free digital utilities built for Nepal and the world.",
  alternates: {
    canonical: "https://sajilotools.vercel.app/about",
  },
  openGraph: {
    title: "About Us | SajiloTools",
    description:
      "Learn about SajiloTools — fast, privacy-respecting, free digital utilities built for Nepal and the world.",
    url: "https://sajilotools.vercel.app/about",
    siteName: "SajiloTools",
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | SajiloTools",
    description:
      "Learn about SajiloTools — fast, privacy-respecting, free digital utilities built for Nepal and the world.",
    images: ["/images/og-default.png"],
  },
};

export default function AboutPage() {
  return (
    <div className="text-[#18181B] dark:text-[#F4F4F5] px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs font-semibold text-[#F5A623]">
            <Info size={14} /> ABOUT SAJILOTOOLS
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Easy Tools, Made Local.
          </h1>
          <p className="text-lg text-[#71717A] dark:text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            SajiloTools is a privacy-first collection of free, high-speed digital utilities designed to make everyday digital tasks seamless.
          </p>
        </div>

        {/* Mission */}
        <div className="p-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-4 shadow-sm">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            We built SajiloTools because everyday online tools shouldn&apos;t force you to watch 30-second ad videos, sign up for accounts, or upload sensitive documents to unverified cloud servers. Every tool on SajiloTools operates directly in your browser with zero data tracking.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-[#F5A623]">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-lg">Instant & Free</h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              No registration, no subscriptions, no bloatware. Tools load in under a second.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-lg">Privacy First</h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              Your inputs, texts, and files are processed strictly in your local browser memory.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
              <Heart size={20} />
            </div>
            <h3 className="font-bold text-lg">Made for Nepal</h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              Custom-built tools for Nepal including Land Unit Converters, Tax Calculators, and NRs exchange.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center pt-8">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Explore All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
