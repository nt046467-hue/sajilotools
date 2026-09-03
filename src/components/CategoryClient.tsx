"use client";

import Link from "next/link";
import ToolCard from "@/components/tools/shared/ToolCard";
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

import DeveloperSuiteIcon from "@/components/shared/DeveloperSuiteIcon";

const ICON_MAP: Record<string, any> = {
  Braces: DeveloperSuiteIcon,
  Developer: DeveloperSuiteIcon,
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
  if (name === "Braces" || name === "Developer") return DeveloperSuiteIcon;
  return ICON_MAP[name] ?? DeveloperSuiteIcon;
}

import CategoryIntro from "@/components/tools/shared/CategoryIntro";

import NotFoundView from "@/components/NotFoundView";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
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
              {category.name}{category.name.endsWith("Tools") ? "" : " Tools"}
            </h1>
            <p className="text-[#71717A] dark:text-[#A1A1AA] mt-1">
              {category.desc} Free, fast, 100% private in-browser utilities.
            </p>
          </div>
        </div>
        <p className="text-sm text-[#A1A1AA] mt-2 mb-6">
          {tools.length} tool{tools.length !== 1 ? "s" : ""} available in this category
        </p>

        {/* Data-Driven Category Introduction Card */}
        <CategoryIntro category={category} totalTools={tools.length} />
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
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} showCategory={false} />
            ))}
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
