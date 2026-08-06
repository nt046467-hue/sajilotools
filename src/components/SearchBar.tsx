"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Command,
  ArrowRight,
  Sparkles,
  TrendingUp,
  History,
  CornerDownLeft,
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
  Calendar,
} from "lucide-react";
import { TOOLS as REGISTERED_TOOLS, ToolDef } from "@/lib/tools-registry";
import { getToolAccentStyle } from "@/lib/theme-utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Braces,
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
  Vault,
  Receipt,
  TrendingUp,
};

// Synonym & tag mappings for enhanced fuzzy discovery
const SEARCH_TAGS: Record<string, string[]> = {
  "qr-generator": ["qr", "qrcode", "wifi", "vcard", "contact", "barcode", "menu", "chipsy"],
  "base64-encoder": ["base64", "b64", "decode", "encode", "binary", "string"],
  "json-formatter": ["json", "prettify", "minify", "beautify", "validate", "parse"],
  "url-encoder": ["url", "encode", "decode", "uri", "percent"],
  "hash-generator": ["md5", "sha1", "sha256", "sha512", "hash", "crypto"],
  "regex-tester": ["regex", "regexp", "pattern", "match", "replace"],
  "color-picker": ["color", "hex", "rgb", "hsl", "palette", "picker"],
  "password-generator": ["password", "secure", "pass", "random", "generator"],
  "lorem-ipsum": ["lorem", "ipsum", "dummy", "placeholder", "text"],
  "timezone-converter": ["timezone", "clock", "nepal", "utc", "time"],
  "markdown-preview": ["markdown", "md", "preview", "editor"],
  "link-shortener": ["link", "shortener", "url", "alias", "tiny"],
  "word-counter": ["word", "counter", "character", "letter", "sentence"],
  "case-converter": ["case", "upper", "lower", "title", "camel"],
  "text-diff": ["diff", "compare", "text", "difference"],
  "string-utilities": ["string", "trim", "reverse", "slugify"],
  "pdf-merger": ["pdf", "merge", "combine", "join"],
  "pdf-splitter": ["pdf", "split", "extract", "pages"],
  "pdf-to-word": ["pdf", "word", "docx", "convert"],
  "image-compressor": ["image", "compress", "shrink", "optimize", "png", "jpg"],
  "image-resizer": ["image", "resize", "scale", "dimension"],
  "image-cropper": ["image", "crop", "ratio", "cut"],
  "image-converter": ["image", "convert", "webp", "jpeg", "png", "bmp"],
  "image-to-base64": ["image", "base64", "datauri", "img"],
  "background-remover": ["background", "remove", "ai", "transparent", "bg"],
  "nrs-converter": ["nrs", "currency", "rupees", "nrb", "forex", "dollar"],
  "land-converter": ["land", "ropani", "anna", "bigha", "kattha", "nepal", "unit"],
  "nepali-translator": ["nepali", "english", "translate", "dictionary"],
  "nepali-date-converter": ["nepali", "date", "bs", "ad", "bikram", "sambat", "miti"],
  "nepali-unicode": ["nepali", "unicode", "devanagari", "type", "keyboard"],
  "nepali-number-words": ["nepali", "number", "lakh", "crore", "cheque", "words"],
  "emi-calculator": ["emi", "loan", "calculator", "interest", "bank"],
  "tax-calculator": ["tax", "income", "salary", "slab", "nepal"],
  "sip-calculator": ["sip", "mutual", "fund", "investment", "return"],
  "fd-calculator": ["fd", "fixed", "deposit", "bank", "interest"],
  "vat-calculator": ["vat", "13%", "tax", "price", "calculator"],
};

interface SearchBarProps {
  large?: boolean;
  autoFocus?: boolean;
  onSelect?: () => void;
  placeholder?: string;
}

export default function SearchBar({
  large = false,
  autoFocus = false,
  onSelect,
  placeholder,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Detect OS for shortcut badge
  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator) {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform));
    }
  }, []);

  // Filter tools based on query & keywords
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return top popular tools when query is empty
      return REGISTERED_TOOLS.filter((t) =>
        ["Popular", "New", "Nepal"].includes(t.badge)
      ).slice(0, 8);
    }

    return REGISTERED_TOOLS.filter((tool) => {
      const nameMatch = tool.name.toLowerCase().includes(q);
      const descMatch = tool.desc.toLowerCase().includes(q);
      const categoryMatch = tool.category.toLowerCase().includes(q);
      const tags = SEARCH_TAGS[tool.slug] || [];
      const tagMatch = tags.some((tag) => tag.includes(q) || q.includes(tag));

      return nameMatch || descMatch || categoryMatch || tagMatch;
    }).sort((a, b) => {
      // Prioritize exact name prefix matches
      const aNameStarts = a.name.toLowerCase().startsWith(q);
      const bNameStarts = b.name.toLowerCase().startsWith(q);
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;
      return 0;
    }).slice(0, 10);
  }, [query]);

  // Reset selectedIndex when search results change
  useEffect(() => {
    setSelectedIndex(0);
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  }, [searchResults]);

  // Auto-scroll selected item into view on keyboard navigation
  useEffect(() => {
    if (!isOpen || !listContainerRef.current) return;
    const container = listContainerRef.current;
    const selectedEl = container.children[selectedIndex] as HTMLElement;

    if (selectedEl) {
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elTop = selectedEl.offsetTop - container.offsetTop;
      const elBottom = elTop + selectedEl.offsetHeight;

      if (elTop < containerTop) {
        container.scrollTop = elTop;
      } else if (elBottom > containerBottom) {
        container.scrollTop = elBottom - container.clientHeight;
      }
    }
  }, [selectedIndex, isOpen]);

  // Handle Keyboard Navigation (Cmd+K, ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K or '/' key trigger
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }

      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, searchResults.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % Math.max(1, searchResults.length));
      } else if (e.key === "Enter" && searchResults.length > 0) {
        e.preventDefault();
        const selected = searchResults[selectedIndex];
        if (selected) {
          router.push(`/tools/${selected.categorySlug}/${selected.slug}`);
          setIsOpen(false);
          if (onSelect) onSelect();
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, router, onSelect]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to highlight matching text query
  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, idx) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark key={idx} className="bg-[#F5A623]/30 text-[#18181B] dark:text-[#F4F4F5] font-bold rounded-xs px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="relative w-full">
      {/* Search Input Box */}
      <div
        className={[
          "flex items-center gap-2.5 rounded-xl transition-all duration-200",
          "bg-white dark:bg-[#141829]",
          isOpen
            ? "border-2 border-[#1F2544] dark:border-[#F5A623] shadow-[0_0_0_4px_rgba(245,166,35,0.15)]"
            : "border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#C4C0B8] dark:hover:border-[#2A2F48]",
          large ? "px-5 py-3.5" : "px-3.5 py-2",
        ].join(" ")}
      >
        <Search
          size={large ? 20 : 16}
          strokeWidth={2.2}
          className="text-[#F5A623] shrink-0"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || (large ? "Search 20+ free developer & local tools (e.g. Base64, QR, PDF, Miti)..." : "Search tools...")}
          className={[
            "flex-1 min-w-0 w-full bg-transparent outline-none text-[#18181B] dark:text-[#F4F4F5] placeholder-[#A1A1AA] dark:placeholder-[#6B7280] font-medium truncate",
            large ? "text-base" : "text-sm",
          ].join(" ")}
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            title="Clear search"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-0.5 bg-[#F0EDE8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-md px-1.5 py-0.5 shrink-0 select-none font-mono text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
            <span>{isMac ? "⌘" : "Ctrl"}</span>
            <span className="font-bold">K</span>
          </div>
        )}
      </div>

      {/* Autocomplete Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={[
            "absolute top-full mt-2 bg-white/95 dark:bg-[#141829]/95 backdrop-blur-2xl border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-150",
            large
              ? "left-0 right-0 w-full"
              : "right-0 left-auto w-[360px] sm:w-[460px] max-w-[calc(100vw-2rem)]",
          ].join(" ")}
        >
          {/* Header Label */}
          <div className="px-4 py-2.5 bg-[#FAFAF8] dark:bg-[#1E2338]/60 border-b border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between text-[11px] font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>
              {query.trim() ? `Search Results (${searchResults.length})` : "⚡ Quick Suggestions"}
            </span>
            <span className="text-[10px] lowercase font-normal opacity-75 hidden sm:inline">
              Use ↑ ↓ arrows & ↵ to select
            </span>
          </div>

          {/* Results List */}
          <div ref={listContainerRef} className="max-h-[380px] overflow-y-auto p-1.5 space-y-1 relative">
            {searchResults.length > 0 ? (
              searchResults.map((tool, idx) => {
                const IconComponent = ICON_MAP[tool.icon] || Braces;
                const isSelected = idx === selectedIndex;

                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.categorySlug}/${tool.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      if (onSelect) onSelect();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all ${isSelected
                        ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                        : "hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5]"
                      }`}
                  >
                    {/* Tool Icon Box */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected
                          ? "bg-white/20 dark:bg-black/20"
                          : "bg-[#F0EDE8] dark:bg-[#1E2338] tool-accent-text"
                        }`}
                      style={isSelected ? { color: "currentColor" } : getToolAccentStyle(tool.color, tool.darkColor)}
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
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${isSelected
                                ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0C0F1E]"
                                : "bg-[#F0EDE8] dark:bg-[#2A2F48] text-[#71717A] dark:text-[#A1A1AA]"
                              }`}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs truncate mt-0.5 ${isSelected
                            ? "text-white/80 dark:text-[#0C0F1E]/80"
                            : "text-[#71717A] dark:text-[#A1A1AA]"
                          }`}
                      >
                        {highlightMatch(tool.desc, query)}
                      </p>
                    </div>

                    {/* Category & Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] font-medium hidden xs:inline ${isSelected
                            ? "text-white/70 dark:text-[#0C0F1E]/70"
                            : "text-[#A1A1AA]"
                          }`}
                      >
                        {tool.category}
                      </span>
                      {isSelected ? (
                        <CornerDownLeft size={14} className="opacity-90 shrink-0" />
                      ) : (
                        <ArrowRight size={14} className="text-[#A1A1AA] shrink-0" />
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <Search size={32} className="mx-auto text-[#A1A1AA] opacity-40 animate-bounce" />
                <p className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  No tools found for "{query}"
                </p>
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                  Try searching for <span className="font-semibold text-[#F5A623]">PDF, Base64, QR Code, Date Converter, Land Unit</span>
                </p>
              </div>
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div className="px-4 py-2 bg-[#FAFAF8] dark:bg-[#1E2338]/60 border-t border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#F5A623]" />
              {REGISTERED_TOOLS.length} Instant Browser Tools Available
            </span>
            <span className="font-mono text-[10px]">Press ESC to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
