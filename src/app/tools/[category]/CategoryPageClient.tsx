"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { searchTools } from "@/lib/search-engine";
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
  Heart,
  Crop,
  LayoutGrid,
  RotateCw,
  Trash2,
  GripVertical,
  Stamp,
  FileImage,
  Minimize2,
  Percent,
  Landmark,
  Gem,
  Fingerprint,
  KeySquare,
  Clock4,
  FileArchive,
  Squircle,
  FlipHorizontal,
  CalendarDays,
  Scale,
  Car,
  Building2,
  Wand2,
  Clock,
  Boxes,
  Wrench,
} from "lucide-react";
import type { ToolDef, CategoryDef } from "@/lib/tools-registry";
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
  Crop,
  LayoutGrid,
  RotateCw,
  Trash2,
  GripVertical,
  Stamp,
  FileImage,
  Minimize2,
  Percent,
  Landmark,
  Gem,
  Fingerprint,
  KeySquare,
  Clock4,
  FileArchive,
  Squircle,
  FlipHorizontal,
  CalendarDays,
  Scale,
  Car,
  Building2,
  Wand2,
  Clock,
  Boxes,
  Wrench,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? Braces;
}

export default function CategoryPageClient({
  category,
  tools,
}: {
  category: CategoryDef | null;
  tools: ToolDef[];
}) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");

  const syncFavorites = () => {
    try {
      const stored = localStorage.getItem("sajilo_favorites");
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      } else {
        setFavorites(new Set());
      }
    } catch {
      setFavorites(new Set());
    }
  };

  useEffect(() => {
    syncFavorites();
  }, [category]);

  const toggleFav = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      try {
        localStorage.setItem("sajilo_favorites", JSON.stringify(Array.from(next)));
      } catch { }
      return next;
    });
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E] flex items-center justify-center">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Category Not Found
          </h1>
          <p className="text-[#71717A] dark:text-[#A1A1AA] mb-6 text-sm">
            The category you are looking for does not exist.
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] text-sm font-semibold"
          >
            ← Back to All Tools
          </Link>
        </div>
      </div>
    );
  }

  const HeaderIcon = getIcon(category.icon);

  const filteredTools = useMemo(() => {
    const baseTools = query.trim()
      ? searchTools(query, 50)
          .map((res) => res.tool)
          .filter((t) => t.categorySlug === category.slug)
      : tools;

    return baseTools.filter((t) => {
      const matchesFav = !favoritesOnly || favorites.has(t.name);
      return matchesFav;
    });
  }, [query, category, tools, favoritesOnly, favorites]);

  const categoryFavCount = tools.filter((t) => favorites.has(t.name)).length;

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 tool-accent-bg tool-accent-text"
              style={getToolAccentStyle(category.color, category.darkColor)}
            >
              <HeaderIcon
                size={26}
                strokeWidth={2}
              />
            </div>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-[#F4F4F5]"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {category.name} Tools
              </h1>
              <p className="text-[#71717A] dark:text-[#A1A1AA] mt-1 text-sm sm:text-base">
                {category.desc}
              </p>
            </div>
          </div>

          {/* Category Controls (Search & Favorites Filter) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${category.name} tools...`}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs text-[#18181B] dark:text-[#F4F4F5] placeholder-[#C4C0B8] dark:placeholder-[#4B5563] outline-none focus:border-[#1F2544] dark:focus:border-[#F5A623]"
              />
            </div>
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${favoritesOnly
                  ? "bg-rose-500 text-white border-rose-600 shadow-md"
                  : "bg-white dark:bg-[#141829] border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-rose-500"
                }`}
            >
              <Heart size={14} className={favoritesOnly ? "fill-white" : ""} />
              <span>Favorites ({categoryFavCount})</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-[#A1A1AA] mt-3">
          Showing {filteredTools.length} of {tools.length} tools available
        </p>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338]">
            <p className="text-[#A1A1AA] text-sm mb-1">
              No matching tools found.
            </p>
            <p className="text-[#C4C0B8] text-xs">
              Try clearing your search query or favorites filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const Icon = getIcon(tool.icon);
              const isFav = favorites.has(tool.name);
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.categorySlug}/${tool.slug}`}
                  className="group relative bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 tool-accent-bg tool-accent-text"
                      style={getToolAccentStyle(tool.color, tool.darkColor)}
                    >
                      <Icon
                        size={20}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block text-[10px] font-semibold px-2 py-[3px] rounded-full tracking-wide leading-none tool-accent-bg tool-accent-text"
                        style={getToolAccentStyle(tool.color, tool.darkColor)}
                      >
                        {tool.badge}
                      </span>
                      <button
                        onClick={(e) => toggleFav(tool.name, e)}
                        className={`p-2 rounded-xl transition-all duration-150 border ${isFav
                            ? "text-rose-500 bg-rose-500/15 border-rose-500/30"
                            : "text-[#A1A1AA] hover:text-rose-500 bg-[#FAFAF8] dark:bg-[#1E2338] border-[#E4E0D8] dark:border-[#2A2F48]"
                          }`}
                        title={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart
                          size={16}
                          strokeWidth={2}
                          className={isFav ? "fill-rose-500 text-rose-500" : ""}
                        />
                      </button>
                    </div>
                  </div>

                  <h3
                    className="font-semibold text-[#18181B] dark:text-[#F4F4F5] text-sm mb-1.5"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {tool.name}
                  </h3>
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
    </div>
  );
}
