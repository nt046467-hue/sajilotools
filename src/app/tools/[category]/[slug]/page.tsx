import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
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
  Clock,
  Wand2,
  Crop,
  ArrowRight,
  CheckCircle2,
  ListOrdered,
  Sparkles,
  Percent,
  Cake,
  GraduationCap,
  Activity,
  Tag,
  ArrowLeftRight,
} from "lucide-react";
import { getToolBySlug, getCategoryBySlug, getToolsByCategory } from "@/lib/tools-registry";
import { getToolAccentStyle } from "@/lib/theme-utils";
import { getToolContent } from "@/lib/tool-content";
import ToolPageClient from "@/components/ToolPageClient";
import AdUnit from "@/components/AdUnit";
import ToolFaqAccordion from "@/components/ToolFaqAccordion";

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
  Clock,
  Wand2,
  Crop,
  Sparkles,
  Percent,
  Cake,
  GraduationCap,
  Activity,
  Tag,
  ArrowLeftRight,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? Braces;
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};

  const title = `${tool.name} – Free Online Tool | SajiloTools`;
  const description = `${tool.desc} Free, fast, private — works instantly in your browser, no sign-up needed. Built for Nepal.`;
  const url = `https://sajilotools.vercel.app/tools/${tool.categorySlug}/${tool.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [tool.name, tool.category, "Nepal online tool", "free utility", "SajiloTools", tool.slug],
    openGraph: {
      title,
      description,
      url,
      siteName: "SajiloTools",
      images: [{ url: "/images/og-default.png", width: 1200, height: 630, alt: `${tool.name} on SajiloTools` }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-default.png"],
    },
  };
}

import NotFoundView from "@/components/NotFoundView";

export default function ToolPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const tool = getToolBySlug(params?.slug || "");
  const category = getCategoryBySlug(params?.category || "");

  if (!tool || !category) {
    return (
      <NotFoundView
        title="Tool Not Found"
        message={`We couldn't find a tool matching "${params?.slug}". It might have been moved or renamed.`}
      />
    );
  }

  const Icon = getIcon(tool.icon);
  const relatedTools = getToolsByCategory(category.slug)
    .filter((t) => t.slug !== tool.slug)
    .slice(0, 3);

  const toolContent = getToolContent(tool.slug, tool.name);

  // Structured data (BreadcrumbList + SoftwareApplication + FAQPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://sajilotools.vercel.app",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": "https://sajilotools.vercel.app/tools",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": category.name,
            "item": `https://sajilotools.vercel.app/tools/${category.slug}`,
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": tool.name,
            "item": `https://sajilotools.vercel.app/tools/${tool.categorySlug}/${tool.slug}`,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        "name": tool.name,
        "description": tool.desc,
        "url": `https://sajilotools.vercel.app/tools/${tool.categorySlug}/${tool.slug}`,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any (Web-based)",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "publisher": {
          "@type": "Organization",
          "name": "SajiloTools",
          "url": "https://sajilotools.vercel.app",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": toolContent.faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E] transition-colors duration-300">
      {/* JSON-LD Rich Snippet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <nav className="flex items-center gap-1.5 text-sm text-[#A1A1AA]">
          <Link
            href="/tools"
            className="hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
          >
            Tools
          </Link>
          <ChevronRight size={14} />
          <Link
            href={`/tools/${category.slug}`}
            className="hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
          >
            {category.name}
          </Link>
          <ChevronRight size={14} />
          <span className="text-[#18181B] dark:text-[#F4F4F5] font-medium">
            {tool.name}
          </span>
        </nav>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center tool-accent-bg tool-accent-text"
            style={getToolAccentStyle(tool.color, tool.darkColor)}
          >
            <Icon size={26} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-[#F4F4F5]"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {tool.name}
              </h1>
              <span
                className="inline-block text-[10px] font-semibold px-2 py-[3px] rounded-full tracking-wide leading-none tool-accent-bg tool-accent-text"
                style={getToolAccentStyle(tool.color, tool.darkColor)}
              >
                {tool.badge}
              </span>
            </div>
            <p className="text-[#71717A] dark:text-[#A1A1AA]">{tool.desc}</p>
          </div>
        </div>
        {tool.isClientSide && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Runs entirely in your browser — no data sent to servers
          </div>
        )}

        {/* AdSense In-Article Ad Slot */}
        <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT || "auto"} minHeight="90px" />
      </div>

      {/* Main Tool Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8">
        <div className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-4 sm:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-none">
          <ToolPageClient tool={tool} category={category} />
        </div>
      </div>

      {/* SEO On-Page Guide & FAQs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Detailed Unique Description */}
          <div className="lg:col-span-2 bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-6 sm:p-8 space-y-6">
            <div>
              <h2
                className="text-xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-4"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                About {tool.name}
              </h2>
              {toolContent.aboutParagraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="text-sm text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-3 last:mb-0"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* How To Steps if available */}
            {toolContent.howToSteps && toolContent.howToSteps.length > 0 && (
              <div className="pt-4 border-t border-[#E4E0D8] dark:border-[#1E2338]">
                <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-3 flex items-center gap-2">
                  <ListOrdered size={16} className="text-[#22C55E]" /> How to Use {tool.name}
                </h3>
                <ol className="text-xs text-[#52525B] dark:text-[#A1A1AA] space-y-2 list-decimal list-inside font-medium">
                  {toolContent.howToSteps.map((step, sIdx) => (
                    <li key={sIdx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="pt-4 border-t border-[#E4E0D8] dark:border-[#1E2338]">
              <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Key Features
              </h3>
              <ul className="text-xs text-[#52525B] dark:text-[#A1A1AA] space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F2544] dark:bg-[#F5A623]" />
                  100% Free &amp; No Sign-Up Needed
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F2544] dark:bg-[#F5A623]" />
                  Browser-based client-side processing for high speed &amp; total data privacy
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F2544] dark:bg-[#F5A623]" />
                  Optimized responsive layout for mobile, tablet, and desktop screens
                </li>
              </ul>
            </div>

            {/* Unique Tool FAQ Accordion */}
            <ToolFaqAccordion faqs={toolContent.faqs} />
          </div>

          {/* Related Tools Internal Links */}
          <div className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-6 sm:p-8 h-fit">
            <h3
              className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5] mb-4"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Related {category.name} Tools
            </h3>
            <div className="space-y-3">
              {relatedTools.map((rel) => {
                const RelIcon = getIcon(rel.icon);
                return (
                  <Link
                    key={rel.slug}
                    href={`/tools/${rel.categorySlug}/${rel.slug}`}
                    className="group flex items-center justify-between p-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] hover:bg-[#F7F5F0] dark:hover:bg-[#1A1F36] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 tool-accent-bg tool-accent-text"
                        style={getToolAccentStyle(rel.color, rel.darkColor)}
                      >
                        <RelIcon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                          {rel.name}
                        </div>
                        <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] line-clamp-1">
                          {rel.desc}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-[#A1A1AA] group-hover:text-[#18181B] dark:group-hover:text-[#F5A623] transition-colors shrink-0 ml-2"
                    />
                  </Link>
                );
              })}
            </div>
            <Link
              href={`/tools/${category.slug}`}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F2544] dark:text-[#F5A623] hover:underline"
            >
              View all {category.name} tools →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
