"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
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
  Ruler,
  Languages,
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
  Maximize2,
  RefreshCw,
  TrendingUp,
  Vault,
  Receipt,
  Calendar,
  Keyboard,
  Boxes,
  Wrench,
} from "lucide-react";
import { TOOLS, CATEGORIES } from "@/lib/tools-registry";
import { searchTools } from "@/lib/search-engine";
import { getToolAccentStyle } from "@/lib/theme-utils";
import { trackSearch } from "@/lib/analytics";

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
  Maximize2,
  RefreshCw,
  TrendingUp,
  Vault,
  Receipt,
  Calendar,
  Keyboard,
  Boxes,
  Wrench,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? Braces;
}

export default function ToolsCatalogClient() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 3) return;
    const timer = setTimeout(() => {
      trackSearch(query);
    }, 800);
    return () => clearTimeout(timer);
  }, [query]);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sajilo_favorites");
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch { }
  }, []);

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

  const filtered = useMemo(() => {
    const baseTools = query.trim()
      ? searchTools(query, 100).map((res) => res.tool)
      : TOOLS;

    return baseTools.filter((t) => {
      const matchesCategory = !activeCategory || t.categorySlug === activeCategory;
      const matchesFav = !favoritesOnly || favorites.has(t.name);
      return matchesCategory && matchesFav;
    });
  }, [query, activeCategory, favoritesOnly, favorites]);

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E] transition-colors duration-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-3"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          All Tools
        </h1>
        <p className="text-[#71717A] dark:text-[#A1A1AA] text-lg max-w-2xl">
          Browse our complete collection of free online tools. Everything runs
          in your browser — fast, private, no sign-up required.
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder-[#C4C0B8] dark:placeholder-[#4B5563] outline-none focus:border-[#1F2544] dark:focus:border-[#F5A623] transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${activeCategory === null
                  ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E]"
                  : "bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                }`}
            >
              All ({TOOLS.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = TOOLS.filter(
                (t) => t.categorySlug === cat.slug
              ).length;
              return (
                <button
                  key={cat.slug}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === cat.slug ? null : cat.slug
                    )
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${activeCategory === cat.slug
                      ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E]"
                      : "bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Favorites Filter Toggle */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${favoritesOnly
                ? "bg-rose-500 text-white shadow-md"
                : "bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-rose-500"
              }`}
          >
            <Heart size={14} className={favoritesOnly ? "fill-white" : ""} />
            <span>Favorites ({favorites.size})</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338]">
            <p className="text-[#A1A1AA] text-lg mb-2">No tools found</p>
            <p className="text-[#C4C0B8] text-sm">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((tool) => {
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

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#C4C0B8] dark:text-[#374151] uppercase tracking-wider">
                      {tool.category}
                    </span>
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
