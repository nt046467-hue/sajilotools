"use client";

import Link from "next/link";
import {
  ArrowRight,
  Braces,
  AlignLeft,
  FileText,
  Image as ImageIcon,
  Calculator,
  MapPin,
  Code2,
  Link2,
  Hash,
  Palette,
  ShieldCheck,
  QrCode,
  Search,
  Ruler,
  Languages,
  Maximize2,
  RefreshCw,
  TrendingUp,
  Vault,
  Receipt,
  Calendar,
  Keyboard,
  ChevronRight,
  Boxes,
  Wrench,
  ArrowLeftRight,
  Percent,
  GraduationCap,
  Activity,
  Tag,
} from "lucide-react";
import type { CategoryDef, ToolDef } from "@/lib/tools-registry";
import { getToolAccentStyle } from "@/lib/theme-utils";

const ICON_MAP: Record<string, any> = {
  Braces,
  AlignLeft,
  FileText,
  Image: ImageIcon,
  Calculator,
  MapPin,
  Code2,
  Link2,
  Hash,
  Palette,
  ShieldCheck,
  QrCode,
  Search,
  Ruler,
  Languages,
  Maximize2,
  RefreshCw,
  TrendingUp,
  Vault,
  Receipt,
  Calendar,
  Keyboard,
  Boxes,
  Wrench,
  ArrowLeftRight,
  Percent,
  GraduationCap,
  Activity,
  Tag,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? Braces;
}

import NotFoundView from "@/components/NotFoundView";

const CATEGORY_OVERVIEWS: Record<string, { summary: string; features: string[] }> = {
  developer: {
    summary:
      "A complete collection of developer utilities for formatting, encoding, hashing, testing, and decoding data structures. Every developer tool runs 100% locally inside your web browser sandbox using modern client JavaScript and Web Crypto APIs.",
    features: [
      "Zero server payload transmission — private API keys and tokens stay on your machine",
      "Real-time syntax validation, JSON formatting, and Base64 conversion",
      "One-click copying and file export capabilities"
    ]
  },
  text: {
    summary:
      "Essential text processing, diff checking, and editing tools for writers, students, SEO copywriters, and developers. Analyze text metrics, format cases, and clean up text strings live in your browser.",
    features: [
      "Live word, character, sentence, and reading time counters",
      "Side-by-side text diff comparison with syntax highlighting",
      "Multilingual support including English and Nepali Devanagari"
    ]
  },
  pdf: {
    summary:
      "Comprehensive PDF document processing tools to merge, split, extract, compress, and watermark PDF files. All PDF manipulations run locally in browser memory without sending documents to cloud servers.",
    features: [
      "Client-side PDF page merging and range extraction",
      "Lossless compression for meeting upload size restrictions",
      "No watermarks or subscription fees added"
    ]
  },
  image: {
    summary:
      "High-speed image processing utilities for web developers, designers, and photographers. Compress, resize, crop, convert, and watermark images with full privacy.",
    features: [
      "In-browser AI background removal using WebAssembly",
      "Batch image compression saving up to 80% file size",
      "Favicon bundle generator for web apps and PWAs"
    ]
  },
  finance: {
    summary:
      "Financial calculators and salary TDS tools built for Nepal and global users. Calculate EMI loan schedules, IRD salary TDS tax slabs, EPF/SSF retirement projections, and live NRs exchange rates.",
    features: [
      "Updated according to Inland Revenue Department (IRD) Nepal tax slabs",
      "Daily foreign exchange rates powered by Nepal Rastra Bank (NRB)",
      "Interactive loan amortization tables and SIP return charts"
    ]
  },
  nepal: {
    summary:
      "Specialized tools localized for administrative, financial, and cultural tasks in Nepal. Convert land units across Ropani and Bigha systems, Bikram Sambat (BS) date conversion, and Devanagari text helpers.",
    features: [
      "Panchang-accurate Bikram Sambat (BS) to Gregorian AD converter",
      "Dual land conversion between Ropani (Hilly) and Bigha (Terai) systems",
      "Official 753 ward and municipality directory search"
    ]
  },
  everyday: {
    summary:
      "Everyday calculation and conversion utilities designed for fast daily use. Calculate exact age breakdowns, body mass index (BMI), academic GPA percentages, and universal measurement units.",
    features: [
      "Clinical WHO reference BMI health classification",
      "NEB standard GPA to percentage academic conversion",
      "Universal measurement converter with configurable decimal precision"
    ]
  }
};

export default function CategoryClient({
  category,
  tools,
  catSlug,
}: {
  category: CategoryDef | null;
  tools: ToolDef[];
  catSlug: string;
}) {
  if (!category) {
    return (
      <NotFoundView
        title="Category Not Found"
        message={`We couldn't find a tool category matching "${catSlug}".`}
      />
    );
  }

  const CatIcon = getIcon(category.icon);
  const overview = CATEGORY_OVERVIEWS[category.slug];
  
  // Cross-category links (all categories except current)
  const relatedCategories = [
    { slug: "developer", name: "Developer", desc: "Formatters, Encoders, Hashers" },
    { slug: "text", name: "Text", desc: "Word Counter, Diff, Translators" },
    { slug: "pdf", name: "PDF", desc: "Merge, Split, Compress, Convert" },
    { slug: "image", name: "Image", desc: "Compress, Resize, Convert, Watermark" },
    { slug: "finance", name: "Finance", desc: "EMI, Tax, SIP, Salary Calculators" },
    { slug: "nepal", name: "Nepal Tools", desc: "Land, Date, Currency, Calendar" },
    { slug: "everyday", name: "Everyday", desc: "BMI, Age, Unit Converters" },
  ].filter((c) => c.slug !== category.slug);

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E] transition-colors duration-300">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="flex items-center gap-1.5 text-sm text-[#A1A1AA]">
          <Link
            href="/tools"
            className="hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
          >
            Tools
          </Link>
          <ChevronRight size={14} />
          <span className="text-[#18181B] dark:text-[#F4F4F5] font-medium">
            {category.name}
          </span>
        </nav>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${category.bgClass}`}
          >
            <CatIcon
              size={26}
              strokeWidth={2}
              className="tool-accent-text"
              style={getToolAccentStyle(category.color, category.darkColor)}
            />
          </div>
          <div>
            <h1
              className="text-3xl font-bold text-[#18181B] dark:text-[#F4F4F5]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {category.name} Tools
            </h1>
            <p className="text-[#71717A] dark:text-[#A1A1AA] mt-1">
              {category.desc} Free, fast, 100% private in-browser utilities.
            </p>
          </div>
        </div>
        <p className="text-sm text-[#A1A1AA] mt-2">
          {tools.length} tool{tools.length !== 1 ? "s" : ""} available in this category
        </p>

        {/* Category Overview Card */}
        {overview && (
          <div className="mt-6 p-6 bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] space-y-3">
            <p className="text-sm text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
              {overview.summary}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E4E0D8]/60 dark:border-[#1E2338]/60">
              {overview.features.map((feat, fIdx) => (
                <div key={fIdx} className="flex items-center gap-2 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F2544] dark:bg-[#F5A623] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {tools.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338]">
            <p className="text-[#A1A1AA] text-lg mb-2">
              No tools in this category yet.
            </p>
            <p className="text-[#C4C0B8] text-sm">
              Tools are being added soon — stay tuned!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => {
              const Icon = getIcon(tool.icon);
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.categorySlug}/${tool.slug}`}
                  className="group relative bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center tool-accent-bg tool-accent-text"
                      style={getToolAccentStyle(tool.color, tool.darkColor)}
                    >
                      <Icon
                        size={20}
                        strokeWidth={2}
                      />
                    </div>
                    <span
                      className="inline-block text-[10px] font-semibold px-2 py-[3px] rounded-full tracking-wide leading-none tool-accent-bg tool-accent-text"
                      style={getToolAccentStyle(tool.color, tool.darkColor)}
                    >
                      {tool.badge}
                    </span>
                  </div>

                  <h2
                    className="font-semibold text-[#18181B] dark:text-[#F4F4F5] text-sm mb-1.5"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {tool.name}
                  </h2>
                  <p className="text-[#71717A] dark:text-[#A1A1AA] text-xs leading-relaxed mb-4">
                    {tool.desc}
                  </p>

                  <div className="flex items-center justify-end">
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#1F2544] dark:text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ArrowRight size={11} strokeWidth={2} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Cross-Category Internal Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="p-8 bg-white dark:bg-[#141829] rounded-3xl border border-[#E4E0D8] dark:border-[#1E2338] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#18181B] dark:text-[#F4F4F5]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Explore Other Categories
            </h2>
            <Link href="/tools" className="text-xs font-semibold text-[#1F2544] dark:text-[#F5A623] flex items-center gap-1 hover:underline">
              View All Tools <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {relatedCategories.map((relCat) => (
              <Link
                key={relCat.slug}
                href={`/tools/${relCat.slug}`}
                className="p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] hover:border-[#1F2544] dark:hover:border-[#F5A623] transition-all group text-left"
              >
                <div className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] group-hover:text-[#1F2544] dark:group-hover:text-[#F5A623] flex items-center justify-between">
                  <span>{relCat.name}</span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] mt-1 line-clamp-1">
                  {relCat.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
