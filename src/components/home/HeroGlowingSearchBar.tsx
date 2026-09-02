"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Check,
  CornerDownLeft,
  Calendar,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Calculator,
  Braces,
  Ruler,
  AlignLeft,
  QrCode,
  Palette,
  ShieldCheck,
  Code2,
  Link2,
  Hash,
  Languages,
  Clock,
  Wand2,
  Maximize2,
  Crop,
  RefreshCw,
  Vault,
  Receipt,
  Keyboard,
  MapPin,
  Stamp,
  FileImage,
  Minimize2,
  Percent,
  Landmark,
  Gem,
  TrendingUp,
  Scale,
  Car,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { searchTools } from "@/lib/search-engine";
import { getToolAccentStyle } from "@/lib/theme-utils";
import { trackSearch } from "@/lib/analytics";
import { ToolDef } from "@/lib/tools-registry";
import DeveloperSuiteIcon from "@/components/shared/DeveloperSuiteIcon";

const ICON_MAP: Record<string, React.ElementType> = {
  Braces: DeveloperSuiteIcon,
  Developer: DeveloperSuiteIcon,
  AlignLeft,
  FileText,
  Image: ImageIcon,
  Calculator,
  Ruler,
  Code2,
  Link2,
  Hash,
  Search,
  Palette,
  ShieldCheck,
  QrCode,
  Clock,
  Languages,
  Maximize2,
  Crop,
  RefreshCw,
  Wand2,
  Keyboard,
  Calendar,
  CalendarDays,
  Vault,
  Receipt,
  MapPin,
  Stamp,
  FileImage,
  Minimize2,
  Percent,
  Landmark,
  Gem,
  TrendingUp,
  Scale,
  Car,
  Building2,
};

interface PopularToolItem {
  name: string;
  categorySlug: string;
  slug: string;
}

export interface HeroGlowingSearchBarProps {
  continuousAnimation?: boolean;
  size?: "default" | "compact";
  className?: string;
}

// SajiloTools most-used real utilities (ALL slugs verified against tools-registry.ts)
const POPULAR_TOOLS: PopularToolItem[] = [
  { name: "Nepali Calendar (BS)", categorySlug: "nepal", slug: "nepali-calendar" },
  { name: "Nepali Date Converter (BS ↔ AD)", categorySlug: "nepal", slug: "nepali-date-converter" },
  { name: "PDF to Word Converter", categorySlug: "pdf", slug: "pdf-to-word" },
  { name: "Image Compressor", categorySlug: "image", slug: "image-compressor" },
  { name: "Vehicle Tax Calculator", categorySlug: "nepal", slug: "vehicle-tax-calculator" },
  { name: "Background Remover", categorySlug: "image", slug: "background-remover" },
  { name: "13% VAT Calculator", categorySlug: "finance", slug: "vat-calculator" },
  { name: "Land Area Converter (Ropani, Bigha)", categorySlug: "nepal", slug: "land-converter" },
  { name: "EMI Loan Calculator", categorySlug: "finance", slug: "emi-calculator" },
  { name: "PDF Merger", categorySlug: "pdf", slug: "pdf-merger" },
  { name: "QR Code Generator", categorySlug: "developer", slug: "qr-generator" },
  { name: "Gold & Silver Calculator", categorySlug: "finance", slug: "gold-silver-calculator" },
  { name: "Nepali Unicode Typing", categorySlug: "nepal", slug: "nepali-unicode" },
  { name: "Word & Character Counter", categorySlug: "text", slug: "word-counter" },
  { name: "Income Tax Calculator", categorySlug: "finance", slug: "tax-calculator" },
  { name: "JSON Formatter & Validator", categorySlug: "developer", slug: "json-formatter" },
  { name: "PDF Compressor", categorySlug: "pdf", slug: "pdf-compressor" },
  { name: "NRs Currency Converter", categorySlug: "finance", slug: "nrs-converter" },
];

export default function HeroGlowingSearchBar({
  continuousAnimation = false,
  size = "default",
  className = "",
}: HeroGlowingSearchBarProps = {}) {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toolIndex, setToolIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Compute live search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchTools(query, 6);
  }, [query]);

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(0);
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  }, [searchResults]);

  // Typing animation effect for popular tools when input is empty
  useEffect(() => {
    if (query.length > 0) return;

    const currentTool = POPULAR_TOOLS[toolIndex];
    const fullText = `${currentTool.name}...`;

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedPlaceholder.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayedPlaceholder(fullText.slice(0, displayedPlaceholder.length + 1));
        }, 55);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 1900);
      }
    } else {
      if (displayedPlaceholder.length > 0) {
        timer = setTimeout(() => {
          setDisplayedPlaceholder(fullText.slice(0, displayedPlaceholder.length - 1));
        }, 26);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false);
          setToolIndex((prev) => (prev + 1) % POPULAR_TOOLS.length);
        }, 280);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedPlaceholder, isDeleting, toolIndex, query]);

  // Navigate to a tool
  const handleSelectTool = useCallback(
    (tool: ToolDef) => {
      setIsFocused(false);
      trackSearch(query.trim() || tool.name);
      router.push(`/tools/${tool.categorySlug}/${tool.slug}`);
    },
    [router, query]
  );

  // Execute search on form submit
  const handlePerformSearch = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      const trimmed = query.trim();

      if (trimmed) {
        trackSearch(trimmed);
        if (searchResults.length > 0) {
          const selected = searchResults[selectedIndex] || searchResults[0];
          handleSelectTool(selected.tool);
        } else {
          router.push(`/tools?q=${encodeURIComponent(trimmed)}`);
          setIsFocused(false);
        }
      } else {
        const activeTool = POPULAR_TOOLS[toolIndex];
        if (activeTool) {
          router.push(`/tools/${activeTool.categorySlug}/${activeTool.slug}`);
        } else {
          router.push("/tools");
        }
        setIsFocused(false);
      }
    },
    [query, searchResults, selectedIndex, toolIndex, handleSelectTool, router]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to highlight matching characters
  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const words = q.trim().split(" ").filter(Boolean);
    const regexStr = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    if (!regexStr) return text;

    const parts = text.split(new RegExp(`(${regexStr})`, "gi"));
    return (
      <>
        {parts.map((part, idx) =>
          words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
            <mark
              key={idx}
              className="bg-[#F5A623]/30 dark:bg-[#F5A623]/35 text-inherit font-bold rounded-sm px-0.5"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const showDropdown = isFocused && query.trim().length > 0;
  const isCompact = size === "compact";

  return (
    <div ref={containerRef} className={`relative w-full ${isCompact ? "max-w-[560px]" : "max-w-[640px]"} mx-auto px-1 sm:px-0 ${className}`}>
      {/* Background ambient radial lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] blur-[120px] rounded-full pointer-events-none -z-10 bg-[#F5A623]/8 dark:bg-[#e019ff]/5 transition-colors duration-500" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] blur-[100px] rounded-full pointer-events-none -z-10 bg-[#1F2544]/6 dark:bg-[#004cff]/10 transition-colors duration-500" />

      {/* Search Form */}
      <form onSubmit={handlePerformSearch} className="relative z-20 w-full">
        {/* Main Container */}
        <div
          className={`relative rounded-[22px] sm:rounded-[24px] p-[6px] flex items-center ${isCompact ? "h-[58px] sm:h-[62px]" : "h-[62px] sm:h-[70px]"} bg-white dark:bg-[#08070d] shadow-[0_10px_35px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_0_40px_rgba(0,0,0,0.8)] border transition-colors duration-500 ${
            isFocused || continuousAnimation
              ? "border-transparent"
              : "border-[#E4E0D8] dark:border-white/5"
          }`}
        >
          {/* Animated Meteor/Tracing Border */}
          <motion.div
            initial={false}
            animate={{ opacity: isFocused || continuousAnimation ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-[-1.5px] rounded-[25.5px] pointer-events-none overflow-hidden"
            style={{
              padding: "1.5px",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          >
            {/* Light Mode Spinning Laser (Exact from animated-glowing-search-bar 2) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 w-[300%] h-[300%] origin-center dark:hidden"
              style={{
                translate: "-50% -50%",
                background:
                  "conic-gradient(from 0deg, transparent 50%, rgba(138, 43, 226, 0.15) 70%, rgba(255, 0, 128, 0.9) 90%, #00e5ff 100%)",
              }}
            />
            {/* Dark Mode Spinning Laser */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 w-[300%] h-[300%] origin-center hidden dark:block"
              style={{
                translate: "-50% -50%",
                background:
                  "conic-gradient(from 0deg, transparent 65%, rgba(0, 240, 255, 0.1) 80%, rgba(0, 110, 255, 0.9) 98%, #ffffff 100%)",
              }}
            />
          </motion.div>

          {/* Left-side Search Icon */}
          <div className={`relative z-10 ${isCompact ? "pl-3 sm:pl-3.5" : "pl-3.5 sm:pl-4"} pr-1 flex items-center justify-center shrink-0`}>
            <Search
              size={isCompact ? 18 : 22}
              strokeWidth={2.2}
              className="text-[#F5A623]"
            />
          </div>

          {/* Text Input with Real Typewriter Placeholder */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsFocused(true);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={displayedPlaceholder}
            className={`relative z-10 flex-1 h-full bg-transparent border-none outline-none ${isCompact ? "text-[14px] sm:text-[16px]" : "text-[16px] sm:text-[19px]"} px-3 sm:px-4 font-normal tracking-wide w-full text-[#18181B] dark:text-white placeholder:text-[#8E8B82] dark:placeholder:text-white/60 selection:bg-[#F5A623]/35 dark:selection:bg-[#004cff]/50 transition-colors`}
            aria-label="Search tools"
          />

          {/* Clear query button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="relative z-10 p-2 rounded-full mr-2 text-zinc-400 hover:text-zinc-700 dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer"
              title="Clear input"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </form>

      {/* ──── Live Floating Search Dropdown ──── */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full mt-3 left-2 right-2 sm:left-0 sm:right-0 z-30 rounded-2xl backdrop-blur-2xl border overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-white/95 dark:bg-[#08070d]/95 border-[#E4E0D8] dark:border-white/10 text-[#18181B] dark:text-white"
          >
            {/* Header */}
            <div className="px-4 py-2 border-b flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase bg-[#FAFAF8] dark:bg-white/5 border-[#E4E0D8] dark:border-white/10 text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Search size={13} className="text-[#F5A623]" />
                <span>
                  {searchResults.length > 0
                    ? `Tools for "${query}" (${searchResults.length})`
                    : "No exact matches"}
                </span>
              </span>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery("");
                  setIsFocused(false);
                  inputRef.current?.blur();
                }}
                className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Results List */}
            <div ref={listContainerRef} className="max-h-[340px] overflow-y-auto p-1.5 space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((res, idx) => {
                  const tool = res.tool;
                  const IconComponent = ICON_MAP[tool.icon] || FileText;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={tool.slug}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent blur
                        handleSelectTool(tool);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer ${isSelected
                        ? "bg-[#1F2544] dark:bg-[#181432] text-white dark:text-white border border-black/5 dark:border-white/10 shadow-sm font-medium"
                        : "hover:bg-[#FAFAF8] dark:hover:bg-white/5 text-zinc-800 dark:text-zinc-200"
                        }`}
                    >
                      {/* Tool Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[#F0EDE8] dark:bg-white/10 text-[#1F2544] dark:text-[#F5A623]"
                          }`}
                        style={
                          isSelected
                            ? { color: "currentColor" }
                            : getToolAccentStyle(tool.color, tool.darkColor)
                        }
                      >
                        <IconComponent size={18} strokeWidth={2} />
                      </div>

                      {/* Tool Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">
                            {highlightMatch(tool.name, query)}
                          </span>
                          {tool.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${isSelected
                                ? "bg-white/20 text-white"
                                : "bg-[#F0EDE8] dark:bg-white/10 text-zinc-600 dark:text-zinc-300"
                                }`}
                            >
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs truncate mt-0.5 ${isSelected
                            ? "text-white/80"
                            : "text-zinc-500 dark:text-zinc-400"
                            }`}
                        >
                          {highlightMatch(tool.desc, query)}
                        </p>
                      </div>

                      {/* Category & Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] font-medium hidden sm:inline ${isSelected ? "text-white/80" : "text-zinc-400 dark:text-zinc-400"
                            }`}
                        >
                          {tool.category}
                        </span>
                        {isSelected ? (
                          <CornerDownLeft size={14} className="opacity-90 shrink-0 text-white" />
                        ) : (
                          <ArrowRight size={14} className="shrink-0 text-zinc-400" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                /* No Results State */
                <div className="p-6 text-center space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#F5A623]/15 text-[#F5A623] flex items-center justify-center mx-auto">
                    <Search size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      No tools found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                      Try keywords like{" "}
                      <span className="text-[#F5A623] font-semibold">
                        Calendar, Nepali Date, PDF, Tax, VAT, Unicode
                      </span>
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/tools?q=${encodeURIComponent(query)}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsFocused(false);
                        router.push(`/tools?q=${encodeURIComponent(query)}`);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#F5A623] hover:underline"
                    >
                      Browse all tools catalog &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t flex items-center justify-between text-[11px] bg-[#FAFAF8] dark:bg-white/5 border-[#E4E0D8] dark:border-white/10 text-zinc-500 dark:text-zinc-400">
              <Link
                href={`/tools?q=${encodeURIComponent(query)}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsFocused(false);
                  router.push(`/tools?q=${encodeURIComponent(query)}`);
                }}
                className="font-semibold text-[#F5A623] hover:underline flex items-center gap-1"
              >
                <span>View all search results</span>
                <ArrowRight size={12} />
              </Link>
              <span className="font-mono text-[10px] hidden sm:inline">ESC to close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
