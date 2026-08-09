"use client";

import Link from "next/link";
import { Compass, Search, Home, ArrowLeft, ArrowRight, Sparkles, Calculator, FileText, Image as ImageIcon, Braces, MapPin, Percent, ArrowLeftRight } from "lucide-react";
import { getToolAccentStyle } from "@/lib/theme-utils";
import SearchBar from "@/components/SearchBar";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

interface NotFoundViewProps {
  title?: string;
  message?: string;
  showLayout?: boolean; // If true, wraps with SiteHeader & SiteFooter
}

const POPULAR_TOOLS = [
  {
    name: "Universal Unit Converter",
    desc: "Convert length, weight, temp, data & more",
    href: "/tools/everyday/unit-converter",
    icon: ArrowLeftRight,
    color: "#0D9488",
    darkColor: "#2DD4BF",
    badge: "New",
  },
  {
    name: "Percentage Calculator",
    desc: "X% of Y, % difference & increase/decrease",
    href: "/tools/everyday/percentage-calculator",
    icon: Percent,
    color: "#0D9488",
    darkColor: "#2DD4BF",
    badge: "Popular",
  },
  {
    name: "NRs Currency Converter",
    desc: "Convert USD, EUR, INR, AUD to Nepali Rupees",
    href: "/tools/finance/nrs-converter",
    icon: Calculator,
    color: "#22C55E",
    darkColor: "#22C55E",
    badge: "Nepal",
  },
  {
    name: "PDF Merger",
    desc: "Combine multiple PDF files into one",
    href: "/tools/pdf/pdf-merger",
    icon: FileText,
    color: "#EF4444",
    darkColor: "#EF4444",
    badge: "Popular",
  },
  {
    name: "Image Compressor",
    desc: "Reduce image file size with local privacy",
    href: "/tools/image/image-compressor",
    icon: ImageIcon,
    color: "#7C3AED",
    darkColor: "#A78BFA",
    badge: "Fast",
  },
  {
    name: "JSON Formatter",
    desc: "Format, validate, and prettify raw JSON",
    href: "/tools/developer/json-formatter",
    icon: Braces,
    color: "#1F2544",
    darkColor: "#9AA3D6",
    badge: "Popular",
  },
];

export default function NotFoundView({
  title = "Tool or Page Not Found",
  message = "The page or tool you are looking for doesn't exist, may have moved, or is temporarily unavailable.",
  showLayout = false,
}: NotFoundViewProps) {
  const content = (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero Visual Card */}
      <div className="text-center space-y-6">
        {/* 404 Glowing Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0D9488]/30 via-[#F5A623]/30 to-[#DC2626]/30 blur-2xl opacity-60 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-xl flex flex-col items-center justify-center gap-1">
            <Compass size={40} className="text-[#0D9488] dark:text-[#F5A623] animate-spin-slow" />
            <span className="text-2xl sm:text-3xl font-extrabold text-[#18181B] dark:text-[#F4F4F5] tracking-tight font-mono">
              404
            </span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2 max-w-lg mx-auto">
          <h1
            className="text-2xl sm:text-4xl font-extrabold text-[#18181B] dark:text-[#F4F4F5] tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {title}
          </h1>
          <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Search Bar Block */}
        <div className="max-w-md mx-auto pt-2">
          <div className="p-1 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm">
            <SearchBar placeholder="Search 60+ tools (e.g. converter, pdf, vat)..." />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Sparkles size={16} /> Explore All Tools
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-sm font-bold hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] transition-colors"
          >
            <Home size={16} /> Back to Home
          </Link>
        </div>
      </div>

      {/* Popular Tools Quick Suggestion Grid */}
      <div className="mt-12 sm:mt-16 pt-8 border-t border-[#E4E0D8] dark:border-[#1E2338]">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-base sm:text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Looking for one of these popular tools?
          </h2>
          <Link
            href="/tools"
            className="text-xs font-bold text-[#0D9488] dark:text-[#F5A623] hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {POPULAR_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] hover:border-[#0D9488]/40 dark:hover:border-[#F5A623]/40 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-3.5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 tool-accent-bg tool-accent-text"
                  style={getToolAccentStyle(tool.color, tool.darkColor)}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] truncate group-hover:text-[#0D9488] dark:group-hover:text-[#F5A623] transition-colors">
                      {tool.name}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full tool-accent-bg tool-accent-text"
                      style={getToolAccentStyle(tool.color, tool.darkColor)}
                    >
                      {tool.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] line-clamp-1">
                    {tool.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (showLayout) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E] flex flex-col transition-colors duration-300">
        <SiteHeader />
        <main className="flex-1">{content}</main>
        <SiteFooter />
      </div>
    );
  }

  return content;
}
