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
  ListChecks,
  Globe2,
  Info,
  Boxes,
  Wrench,
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
  Boxes,
  Wrench,
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

import { SITE_CONFIG, SITE_URL, getCanonicalUrl } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};

  // Prefer custom SEO title/description from registry; fall back to generated defaults
  const isNepalTool = tool.category === "Nepal Tools" || tool.categorySlug === "nepal";
  const fallbackDescription = `${tool.desc} Free, fast, private — works instantly in your browser, no sign-up needed.${isNepalTool ? " Built for Nepal." : ""}`;

  const rawTitle = tool.seoTitle || `${tool.name} – Free Online Tool`;
  const cleanTitle = rawTitle.replace(/\s*\|\s*SajiloTools/gi, "").trim();
  const description = tool.seoDescription ?? fallbackDescription;
  const url = getCanonicalUrl(`/tools/${tool.categorySlug}/${tool.slug}`);

  return {
    title: cleanTitle,
    description,
    alternates: { canonical: url },
    keywords: [
      tool.name,
      tool.category,
      ...(isNepalTool ? ["Nepal online tool", "Nepal utility"] : ["online tool", "free utility"]),
      "SajiloTools",
      tool.slug,
    ],
    openGraph: {
      title: cleanTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [{ url: "/images/og-default.png", width: 1200, height: 630, alt: `${tool.name} on SajiloTools` }],
      locale: SITE_CONFIG.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description,
      images: ["/images/og-default.png"],
    },
  };
}

import { redirect } from "next/navigation";
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

  // Redirect mismatched category URLs (e.g. /tools/text/tax-calculator) to their canonical route (/tools/finance/tax-calculator)
  if (params.category !== tool.categorySlug) {
    redirect(`/tools/${tool.categorySlug}/${tool.slug}`);
  }

  const Icon = getIcon(tool.icon);
  const toolContent = getToolContent(tool.slug, tool.name);

  // Compute related tools: prefer explicit cross-category relatedToolSlugs, then fill from category
  const mappedExplicit = (toolContent.relatedToolSlugs || [])
    .map((s) => getToolBySlug(s))
    .filter((t): t is NonNullable<typeof t> => t !== undefined && t.slug !== tool.slug);

  const fallbackCategoryTools = getToolsByCategory(category.slug).filter(
    (t) => t.slug !== tool.slug && !mappedExplicit.some((m) => m.slug === t.slug)
  );

  const relatedTools = [...mappedExplicit, ...fallbackCategoryTools].slice(0, 4);

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
            "item": SITE_URL,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": getCanonicalUrl("/tools"),
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": category.name,
            "item": getCanonicalUrl(`/tools/${category.slug}`),
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": tool.name,
            "item": getCanonicalUrl(`/tools/${tool.categorySlug}/${tool.slug}`),
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        "name": tool.name,
        "description": tool.desc,
        "url": getCanonicalUrl(`/tools/${tool.categorySlug}/${tool.slug}`),
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any (Web-based)",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "publisher": {
          "@type": "Organization",
          "name": SITE_CONFIG.name,
          "url": SITE_URL,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6">
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
            <p className="text-[#71717A] dark:text-[#A1A1AA] text-sm sm:text-base">{tool.desc}</p>
          </div>
        </div>
        {tool.isClientSide ? (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Runs entirely in your browser — no data sent to servers
          </div>
        ) : (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            Fetches live reference data securely via API
          </div>
        )}
      </div>

      {/* Main Tool Container (Interactive Workstation) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-4 sm:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-none">
          <ToolPageClient tool={tool} category={category} />
        </div>
      </div>

      {/* Safe Ad Placement Below Main Tool (collapses to 0 height when unfilled) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdUnit
          slot={process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT || "auto"}
          placement="article-bottom"
        />
      </div>

      {/* SEO On-Page Guide & FAQs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Detailed Unique Content Card */}
          <div className="lg:col-span-2 bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-6 sm:p-8 space-y-6">
            {/* About Paragraphs */}
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

            {/* Practical Use Cases */}
            {toolContent.useCases && toolContent.useCases.length > 0 && (
              <div className="pt-4 border-t border-[#E4E0D8] dark:border-[#1E2338]">
                <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-3 flex items-center gap-2">
                  <ListChecks size={16} className="text-[#F5A623]" /> Common Use Cases
                </h3>
                <ul className="text-xs text-[#52525B] dark:text-[#A1A1AA] space-y-2">
                  {toolContent.useCases.map((useCase, uIdx) => (
                    <li key={uIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F2544] dark:bg-[#F5A623] mt-1 shrink-0" />
                      <span className="leading-relaxed">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* How To Steps */}
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

            {/* Practical Input/Output Examples */}
            {toolContent.examples && toolContent.examples.length > 0 && (
              <div className="pt-4 border-t border-[#E4E0D8] dark:border-[#1E2338]">
                <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-3 flex items-center gap-2">
                  <Globe2 size={16} className="text-purple-500" /> Real-World Examples
                </h3>
                <div className="space-y-3">
                  {toolContent.examples.map((ex, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-3.5 bg-[#FAFAF8] dark:bg-[#1E2338]/60 border border-[#E4E0D8] dark:border-[#2A2F48] rounded-xl space-y-2 text-xs"
                    >
                      <div className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                        {ex.title}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">
                            Input
                          </span>
                          <code className="block p-2 bg-white dark:bg-[#141829] rounded border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] font-mono overflow-x-auto whitespace-pre-wrap">
                            {ex.input}
                          </code>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#A1A1AA] block mb-1">
                            Output
                          </span>
                          <code className="block p-2 bg-white dark:bg-[#141829] rounded border border-[#E4E0D8] dark:border-[#2A2F48] text-[#22C55E] font-mono overflow-x-auto whitespace-pre-wrap">
                            {ex.output}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Limitations & Notes */}
            {toolContent.limitations && toolContent.limitations.length > 0 && (
              <div className="pt-4 border-t border-[#E4E0D8] dark:border-[#1E2338]">
                <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-3 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" /> Important Notes &amp; Limitations
                </h3>
                <ul className="text-xs text-[#52525B] dark:text-[#A1A1AA] space-y-2">
                  {toolContent.limitations.map((lim, lIdx) => (
                    <li key={lIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <span className="leading-relaxed">{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Privacy Explanation */}
            <div className="pt-4 border-t border-[#E4E0D8] dark:border-[#1E2338]">
              <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" /> Privacy &amp; Data Security
              </h3>
              <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
                {toolContent.privacyNote ||
                  (tool.isClientSide
                    ? `${tool.name} processes all operations 100% locally in your web browser memory. Your files, text snippets, and generated outputs are never stored, logged, or uploaded to any remote server.`
                    : `${tool.name} securely fetches live reference data via lightweight API queries. Your request input is never retained or shared with third parties.`)}
              </p>
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
              Complementary &amp; Related Tools
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
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 tool-accent-bg tool-accent-text"
                        style={getToolAccentStyle(rel.color, rel.darkColor)}
                      >
                        <RelIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] truncate">
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
