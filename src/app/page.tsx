import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import SearchBar from "@/components/SearchBar";
import { getToolAccentStyle } from "@/lib/theme-utils";
import {
  BadgeCheck,
  TrendingUp,
  ArrowRight,
  Zap,
  ShieldCheck,
  MapPin,
  Heart,
  FileText,
  Braces,
} from "lucide-react";
import {
  TOOLS as REGISTERED_TOOLS,
  CATEGORIES as REGISTERED_CATEGORIES,
  type ToolDef,
} from "@/lib/tools-registry";
import { ICON_MAP } from "@/components/home/home-constants";
import { ToolCardClient, NewsletterClient } from "@/components/home/HomePageClient";

import { SITE_CONFIG, SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    absolute: "SajiloTools – Free Online Tools Made Simple for Nepal",
  },
  description:
    `Calculate, convert, translate, compress and simplify everyday digital tasks with ${REGISTERED_TOOLS.length}+ fast, free online tools. Built for Nepal — no sign-up needed.`,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "SajiloTools – Free Online Tools Made Simple for Nepal",
    description:
      `Calculate, convert, translate, compress and simplify everyday digital tasks with ${REGISTERED_TOOLS.length}+ fast, free online tools. Built for Nepal.`,
    url: SITE_URL,
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/og-default.png", width: 1200, height: 630, alt: "SajiloTools" }],
    locale: SITE_CONFIG.locale,
    type: "website",
  },
};

const FEATURED_TOOLS = REGISTERED_TOOLS.filter((t) => t.featured);
const TRENDING_TOOLS = REGISTERED_TOOLS.filter((t) => t.trending);
const LATEST_TOOLS = REGISTERED_TOOLS.filter((t) => t.isLatest);

const CATEGORIES = REGISTERED_CATEGORIES.map((cat) => ({
  ...cat,
  Icon: ICON_MAP[cat.icon] || FileText,
}));

const STATS = [
  { value: `${REGISTERED_TOOLS.length}+`, label: "Free Tools" },
  { value: "Privacy", label: "Focused Architecture" },
  { value: "No", label: "Sign-up Required" },
  { value: "Instant", label: "In-Browser Speed" },
];

const WHY_ITEMS = [
  {
    Icon: Zap,
    title: "Blazing Fast",
    desc: "Every tool loads instantly in your browser without bloat or unnecessary waiting.",
  },
  {
    Icon: ShieldCheck,
    title: "Privacy First",
    desc: "Browser-based client processing ensures sensitive data and files stay on your device.",
  },
  {
    Icon: MapPin,
    title: "Built for Nepal",
    desc: "NRs currency, BS date conversion, vehicle tax, land units, and Devanagari typography.",
  },
  {
    Icon: BadgeCheck,
    title: "No Sign-up Ever",
    desc: "Open any tool and start working immediately. No accounts or mandatory logins.",
  },
  {
    Icon: Heart,
    title: "Always Free",
    desc: "No subscriptions, no paywalls, no hidden usage fees. 100% free access for everyone.",
  },
  {
    Icon: Braces,
    title: "Transparent & Independent",
    desc: "Built with modern web standards, lightweight code, and user privacy in mind.",
  },
];

function Marquee({ items }: { items: ToolDef[] }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div className="st-marquee-track flex py-1" style={{ width: "max-content" }}>
        {doubled.map((tool, i) => {
          const Icon = ICON_MAP[tool.icon] || FileText;
          return (
            <Link
              key={i}
              href={`/tools/${tool.categorySlug}/${tool.slug}`}
              className="flex items-center gap-2 px-4 py-2 mx-1.5 rounded-full border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[13px] font-medium text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:border-[#1F2544] dark:hover:border-[#F5A623] hover:bg-[#FAFAF8] dark:hover:bg-[#1A1F35] transition-all duration-150 whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <Icon size={12} strokeWidth={2} className="flex-shrink-0 opacity-70" />
              {tool.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen relative bg-[#F7F5F0] dark:bg-[#0C0F1E]">
      <div className="fixed inset-0 pointer-events-none z-0 st-grid" aria-hidden />
      <div className="fixed inset-0 pointer-events-none z-0 st-glow" aria-hidden />

      <div className="relative z-10">
        <SiteHeader />

        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E4E0D8] dark:border-[#1E2338] bg-white/80 dark:bg-[#141829]/80 backdrop-blur-sm mb-8 text-sm text-[#71717A] dark:text-[#A1A1AA] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <BadgeCheck size={14} strokeWidth={2} style={{ color: "#F5A623" }} />
            {REGISTERED_TOOLS.length}+ free online tools made simple for Nepal
          </div>

          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#18181B] dark:text-[#F4F4F5] leading-[1.08] tracking-tight mb-6"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Find the right tool
            <br />
            <span style={{ color: "#F5A623" }}>instantly.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#71717A] dark:text-[#9CA3AF] max-w-lg mx-auto mb-10 leading-relaxed">
            Calculate, convert, translate, compress and simplify everyday digital tasks with fast, free online tools. Built for Nepal.
          </p>

          <div className="max-w-xl mx-auto mb-12">
            <SearchBar
              large
              placeholder="What do you want to do? e.g. compress PDF, calculate VAT, convert image..."
            />
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp size={12} strokeWidth={2} className="text-[#A1A1AA]" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#A1A1AA]">
              Trending Tools
            </p>
          </div>
          <Marquee items={TRENDING_TOOLS} />
        </section>

        {/* ── POPULAR TOOLS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2
                className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-1"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Popular Tools
              </h2>
              <p className="text-sm text-[#71717A] dark:text-[#9CA3AF]">
                Most-used utilities by the SajiloTools community in Nepal
              </p>
            </div>
            <Link
              href="/tools"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#1F2544] dark:text-[#F5A623] hover:opacity-75 transition-opacity"
            >
              View all <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_TOOLS.map((tool) => (
              <ToolCardClient key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="bg-white/60 dark:bg-[#0C0F1E]/60 backdrop-blur-sm border-y border-[#E4E0D8] dark:border-[#1E2338] py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2
                className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Browse by Category
              </h2>
              <p className="text-sm text-[#71717A] dark:text-[#9CA3AF]">
                Explore Nepal, Finance, Text, PDF, Image, Developer and Everyday calculators
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.Icon;
                const realCount = REGISTERED_TOOLS.filter(
                  (t) => t.categorySlug === cat.slug
                ).length;

                return (
                  <Link
                    key={cat.slug}
                    href={`/tools/${cat.slug}`}
                    className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none st-card-hover hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] text-center block"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.06] ${cat.bgClass}`}
                    >
                      <Icon
                        size={24}
                        strokeWidth={2}
                        className="tool-accent-text"
                        style={getToolAccentStyle(cat.color, cat.darkColor)}
                      />
                    </div>
                    <div>
                      <div
                        className="font-semibold text-[#18181B] dark:text-[#F4F4F5] text-sm mb-0.5"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-[#A1A1AA]">{realCount} tools</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#E4E0D8] dark:lg:divide-[#1E2338]">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <div
                  className="text-4xl sm:text-5xl font-bold text-[#1F2544] dark:text-[#F5A623] mb-2 tabular-nums"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-[#71717A] dark:text-[#9CA3AF]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY SAJILOTOOLS ── */}
        <section className="bg-[#F7F5F0] dark:bg-[#080B16] border-t border-b border-[#E4E0D8] dark:border-[#1A1F3A] py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mb-3 tracking-tight"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Why SajiloTools?
              </h2>
              <p className="text-[#71717A] dark:text-[#A1A1AA] max-w-sm mx-auto text-sm leading-relaxed">
                Free, fast, mobile-friendly tools built specifically for Nepalese users.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WHY_ITEMS.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-white/8 hover:border-[#F5A623]/50 dark:hover:border-white/16 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-150 cursor-default"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#F5A623]/10 dark:bg-[#F5A623]/14">
                    <Icon size={18} strokeWidth={2} style={{ color: "#F5A623" }} />
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-[#18181B] dark:text-white text-sm mb-1.5"
                      style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                      {title}
                    </h3>
                    <p className="text-[#71717A] dark:text-[#A1A1AA] text-xs leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LATEST TOOLS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2
                className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-1"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Latest Tools
              </h2>
              <p className="text-sm text-[#71717A] dark:text-[#9CA3AF]">
                Fresh additions to our growing collection
              </p>
            </div>
            <Link
              href="/tools"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#1F2544] dark:text-[#F5A623] hover:opacity-75 transition-opacity"
            >
              See all <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LATEST_TOOLS.map((tool) => {
              const Icon = ICON_MAP[tool.icon] || FileText;
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.categorySlug}/${tool.slug}`}
                  className="group flex items-center gap-4 p-4 bg-white dark:bg-[#141829] rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none st-card-hover hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F0EDE8] dark:bg-[#1E2338] flex items-center justify-center flex-shrink-0">
                    <Icon size={18} strokeWidth={2} className="text-[#71717A] dark:text-[#A1A1AA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span
                        className="font-semibold text-[#18181B] dark:text-[#F4F4F5] text-sm truncate"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        {tool.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#A1A1AA]">{tool.category}</div>
                  </div>
                  <ArrowRight
                    size={14}
                    strokeWidth={2}
                    className="text-[#D4D4D8] dark:text-[#374151] group-hover:text-[#71717A] dark:group-hover:text-[#A1A1AA] transition-colors flex-shrink-0"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── PLATFORM GUARANTEES ── */}
        <section className="bg-white/60 dark:bg-[#0C0F1E]/60 backdrop-blur-sm border-y border-[#E4E0D8] dark:border-[#1E2338] py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2
                className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Built for Speed, Privacy &amp; Trust
              </h2>
              <p className="text-sm text-[#71717A] dark:text-[#9CA3AF]">
                Our core commitments to every developer, designer, and student using SajiloTools
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-7 bg-[#FAFAF8] dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-bold text-base text-[#18181B] dark:text-[#F4F4F5]">
                  100% Client-Side Privacy
                </h3>
                <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                  Your files, PDFs, images, and text stay strictly on your device. Processing happens locally inside your web browser.
                </p>
              </div>

              <div className="p-7 bg-[#FAFAF8] dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
                  <Zap size={20} />
                </div>
                <h3 className="font-bold text-base text-[#18181B] dark:text-[#F4F4F5]">
                  Instant &amp; Lightweight
                </h3>
                <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                  Optimized to run seamlessly on mobile data networks and budget smartphones without bloated downloads or paywalls.
                </p>
              </div>

              <div className="p-7 bg-[#FAFAF8] dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <MapPin size={20} />
                </div>
                <h3 className="font-bold text-base text-[#18181B] dark:text-[#F4F4F5]">
                  Tailored for Nepal
                </h3>
                <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                  Dedicated utilities for Bikram Sambat dates, Ropani/Bigha land units, NRs currency conversion, and Devanagari typography.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── NEWSLETTER ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="relative max-w-2xl mx-auto rounded-3xl border border-border bg-card/70 shadow-sm backdrop-blur-sm px-4 py-10 sm:px-12 sm:py-16 text-center overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5 text-amber-500">
                <Heart size={20} strokeWidth={2} fill="currentColor" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight font-sora">
                Stay updated on new tools
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
                Get notified when new tools launch. No spam, ever. Unsubscribe anytime with one click.
              </p>
              <NewsletterClient />
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
