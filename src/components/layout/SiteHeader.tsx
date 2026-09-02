"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/shared/Logo";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Menu,
  X,
  History,
  Settings2,
  ArrowRight,
  ShieldCheck,
  Home,
  BookOpen,
  FileText,
  Calculator,
  MapPin,
  Braces,
  Image as ImageIcon,
  ChevronDown,
  Layers,
  Info,
  MessageSquarePlus,
  AlignLeft,
  Boxes,
  Monitor,
  Check,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { TOOLS as REGISTERED_TOOLS } from "@/lib/tools-registry";
import { CategoryAnimatedIcon, CategoryAnimatedIconHandle } from "@/components/layout/CategoryAnimatedIcon";
import DeveloperSuiteIcon from "@/components/shared/DeveloperSuiteIcon";
import { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";

const TOOL_CATEGORIES = [
  {
    name: "PDF Tools",
    href: "/tools/pdf",
    desc: "Merge, compress, split, convert",
    icon: FileText,
    badge: "Popular",
    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
  },
  {
    name: "Image Processing",
    href: "/tools/image",
    desc: "Compress, resize, background remover",
    icon: ImageIcon,
    badge: "",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
  },
  {
    name: "Developer Suite",
    href: "/tools/developer",
    desc: "JSON Formatter, Base64, JWT, Hash",
    icon: DeveloperSuiteIcon,
    badge: "Dev",
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40",
  },
  {
    name: "Finance & Tax",
    href: "/tools/finance",
    desc: "EMI, SIP, Income Tax, Gold/Silver",
    icon: Calculator,
    badge: "",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
  },
  {
    name: "Text & Writing",
    href: "/tools/text",
    desc: "Word counter, text diff, case converter",
    icon: AlignLeft,
    badge: "",
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
  },
  {
    name: "Everyday Utilities",
    href: "/tools/everyday",
    desc: "QR generator, unit converter, age calc",
    icon: Boxes,
    badge: "Quick",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40",
  },
];

function HeaderCategoryDropdownItem({
  cat,
  onSelect,
}: {
  cat: (typeof TOOL_CATEGORIES)[0];
  onSelect: () => void;
}) {
  const iconRef = useRef<CategoryAnimatedIconHandle>(null);

  return (
    <Link
      href={cat.href}
      onClick={onSelect}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          iconRef.current?.trigger();
        }
      }}
      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${cat.color} shrink-0 flex items-center justify-center`}>
          <CategoryAnimatedIcon ref={iconRef} categoryName={cat.name} size={18} />
        </div>
        <div>
          <div className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {cat.name}
          </div>
          <div className="text-[11px] text-[#71717A] dark:text-[#8E95A8] truncate">
            {cat.desc}
          </div>
        </div>
      </div>
      {cat.badge && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300">
          {cat.badge}
        </span>
      )}
    </Link>
  );
}

export default function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pwaActive, setPwaActive] = useState(true);
  const [recentTools, setRecentTools] = useState<
    { name: string; slug: string; categorySlug: string }[]
  >([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close drawers & dropdowns on route change
  useEffect(() => {
    setMobileOpen(false);
    setToolsDropdownOpen(false);
  }, [pathname]);

  // Robust click outside listener for Categories dropdown (supporting touch & mouse)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Global Escape key listener to close active popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setToolsDropdownOpen(false);
        setHistoryOpen(false);
        setSettingsOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Check initial PWA service worker status
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations().then((regs) => {
      setPwaActive(regs.length > 0);
    });
  }, []);

  const togglePwa = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (pwaActive) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.unregister();
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      setPwaActive(false);
    } else {
      try {
        await navigator.serviceWorker.register("/sw.js");
        setPwaActive(true);
      } catch {
        // Fallback
      }
    }
  };

  // Bulletproof body scroll lock when mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sajilo_history");
      if (!raw) {
        setRecentTools([]);
        return;
      }
      const saved = JSON.parse(raw) as {
        name: string;
        slug: string;
        categorySlug: string;
      }[];
      if (!Array.isArray(saved)) return;
      const valid = saved.slice(0, 10).flatMap((item) => {
        const tool = REGISTERED_TOOLS.find(
          (t) => t.slug === item?.slug && t.categorySlug === item?.categorySlug
        );
        return tool
          ? [{ name: tool.name, slug: tool.slug, categorySlug: tool.categorySlug }]
          : [];
      });
      setRecentTools(valid);
    } catch {
      setRecentTools([]);
    }
  }, [historyOpen]);

  function clearHistory() {
    try {
      localStorage.removeItem("sajilo_history");
    } catch {
      /* ignore */
    }
    setRecentTools([]);
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#080B16]/80 backdrop-blur-xl border-b border-[#E4E0D8] dark:border-[#1E2338] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-6">

            {/* 1. LEFT: Brand Logo & Navigation */}
            <div className="flex items-center gap-8 shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <Logo size={28} priority />
              </Link>

              {/* 2. REAL SAAS NAVIGATION LINKS */}
              <nav className="hidden lg:flex items-center gap-1">
                <Link
                  href="/"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/"
                      ? "text-[#18181B] dark:text-white bg-black/[0.05] dark:bg-white/[0.08] font-semibold"
                      : "text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    }`}
                >
                  Home
                </Link>

                <Link
                  href="/tools"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/tools"
                      ? "text-[#18181B] dark:text-white bg-black/[0.05] dark:bg-white/[0.08] font-semibold"
                      : "text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    }`}
                >
                  Tools
                </Link>

                <Link
                  href="/tools/nepal"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/tools/nepal")
                      ? "text-[#18181B] dark:text-white bg-black/[0.05] dark:bg-white/[0.08] font-semibold"
                      : "text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    }`}
                >
                  Nepali Tools
                </Link>

                <Link
                  href="/tools/everyday"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/tools/everyday")
                      ? "text-[#18181B] dark:text-white bg-black/[0.05] dark:bg-white/[0.08] font-semibold"
                      : "text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    }`}
                >
                  Everyday
                </Link>

                <Link
                  href="/blog"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/blog")
                      ? "text-[#18181B] dark:text-white bg-black/[0.05] dark:bg-white/[0.08] font-semibold"
                      : "text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    }`}
                >
                  Guides
                </Link>

                {/* Categories Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setToolsDropdownOpen((prev) => !prev)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${toolsDropdownOpen || pathname.startsWith("/tools/")
                        ? "text-[#18181B] dark:text-white bg-black/[0.05] dark:bg-white/[0.08]"
                        : "text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      }`}
                  >
                    <span>Categories</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 opacity-60 ${toolsDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Dropdown Menu (Real SaaS Mega Menu) */}
                  {toolsDropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-1.5 w-[380px] bg-white dark:bg-[#0E1322] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="px-2.5 py-1.5 text-[11px] font-bold text-[#71717A] dark:text-[#8E95A8] uppercase tracking-wider">
                        Categories
                      </div>
                      <div className="space-y-1">
                        {TOOL_CATEGORIES.map((cat) => (
                          <HeaderCategoryDropdownItem
                            key={cat.name}
                            cat={cat}
                            onSelect={() => setToolsDropdownOpen(false)}
                          />
                        ))}
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338] px-2.5 py-1 flex items-center justify-between">
                        <Link
                          href="/tools"
                          onClick={() => setToolsDropdownOpen(false)}
                          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                        >
                          Explore all 70+ Tools <ArrowRight size={13} />
                        </Link>
                        <span className="text-[11px] text-[#71717A]">100% Free &amp; Offline</span>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* 3. RIGHT: Search Bar & Actions */}
            <div className="flex items-center gap-2">
              {/* Direct Search Bar (Desktop only) */}
              <div className="hidden md:block w-48 lg:w-56 xl:w-64">
                <SearchBar placeholder="Search tools..." dropdownAlign="right" />
              </div>

              {/* Suggest a Tool CTA */}
              <Link
                href="/contact"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0D9488] dark:text-[#2DD4BF] border border-[#0D9488]/25 dark:border-[#2DD4BF]/25 bg-[#0D9488]/[0.06] dark:bg-[#2DD4BF]/[0.08] hover:bg-[#0D9488]/[0.12] dark:hover:bg-[#2DD4BF]/[0.14] transition-colors whitespace-nowrap"
              >
                <MessageSquarePlus size={14} />
                Suggest a Tool
              </Link>

              {/* History Button (Beside Toggler) */}
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="relative p-2 rounded-xl text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-[#E4E0D8] dark:border-[#1E2338] transition-all cursor-pointer flex items-center justify-center"
                title="Recently Used Tools"
                aria-label="Recent Tools"
              >
                <History size={16} />
                {recentTools.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                  </span>
                )}
              </button>

              {/* Settings Button (Desktop) */}
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="hidden md:flex p-2 rounded-xl text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-[#E4E0D8] dark:border-[#1E2338] transition-colors cursor-pointer"
                title="Preferences"
                aria-label="Preferences"
              >
                <Settings2 size={16} />
              </button>

              {/* Dark/Light Mode Switcher (Desktop) */}
              <button
                type="button"
                onClick={() => {
                  const isCurrentlyDark = document.documentElement.classList.contains("dark");
                  setTheme(isCurrentlyDark ? "light" : "dark");
                }}
                className="hidden md:flex p-2 rounded-xl text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-[#E4E0D8] dark:border-[#1E2338] transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                <Sun size={16} className="hidden dark:block text-amber-400" />
                <Moon size={16} className="block dark:hidden text-[#18181B]" />
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                className="lg:hidden p-2 rounded-xl text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-[#E4E0D8] dark:border-[#1E2338] transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />

      <div
        className={`lg:hidden fixed top-0 right-0 z-50 h-dvh w-[88vw] max-w-sm bg-white dark:bg-[#080B16] border-l border-[#E4E0D8] dark:border-[#1E2338] shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out will-change-transform ${mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        aria-hidden={!mobileOpen}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E0D8] dark:border-[#1E2338] shrink-0 bg-[#FAFAF8] dark:bg-[#0E1322]">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
            <Logo size={26} />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div data-drawer-scroll className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
          {/* SEARCH */}
          <div>
            <SearchBar
              placeholder="Search 70+ tools..."
              dropdownAlign="full"
              onSelect={() => setMobileOpen(false)}
            />
          </div>

          {/* MAIN NAVIGATION */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-[#71717A] dark:text-[#8E95A8] uppercase tracking-wider px-1 mb-1">
              Explore
            </div>
            {[
              { name: "Home", href: "/", icon: Home },
              { name: "All 70+ Tools", href: "/tools", icon: Layers },
              { name: "Nepali Tools", href: "/tools/nepal", icon: MapPin },
              { name: "Guides & Articles", href: "/blog", icon: BookOpen },
              { name: "Suggest a Tool", href: "/contact", icon: MessageSquarePlus },
            ].map((link) => {
              const Icon = link.icon;
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${isActive
                      ? "bg-black/[0.05] dark:bg-white/[0.08] text-[#18181B] dark:text-white"
                      : "text-[#52525B] dark:text-[#A1A1AA] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} className="opacity-70" />
                    {link.name}
                  </span>
                  <ArrowRight size={13} className="opacity-30" />
                </Link>
              );
            })}
          </div>

          {/* CATEGORIES */}
          <div>
            <div className="text-[11px] font-bold text-[#71717A] dark:text-[#8E95A8] uppercase tracking-wider px-1 mb-2">
              Categories
            </div>
            <div className="space-y-1">
              {TOOL_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-[#18181B] dark:text-[#F4F4F5] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${cat.color}`}>
                        <CatIcon size={15} />
                      </div>
                      <span className="font-semibold">{cat.name}</span>
                    </span>
                    <ArrowRight size={13} className="opacity-30" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#0E1322] flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              const isDark = document.documentElement.classList.contains("dark");
              setTheme(isDark ? "light" : "dark");
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A304D] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]"
          >
            <Sun size={14} className="hidden dark:block text-amber-400" />
            <Moon size={14} className="block dark:hidden" />
            <span>Appearance</span>
          </button>

          <button
            onClick={() => {
              setMobileOpen(false);
              setSettingsOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A304D] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]"
          >
            <Settings2 size={14} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* ── HISTORY MODAL ── */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setHistoryOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0E1322] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-3">
              <div className="flex items-center gap-2">
                <History size={16} className="text-teal-600 dark:text-teal-400" />
                <h3 className="font-semibold text-sm text-[#18181B] dark:text-white">
                  Recently Used Tools
                </h3>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-[#71717A] hover:text-[#18181B] dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1 py-1 max-h-60 overflow-y-auto">
              {recentTools.length > 0 ? (
                recentTools.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/tools/${item.categorySlug}/${item.slug}`}
                    onClick={() => setHistoryOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#18181B] dark:text-white">
                      {item.name}
                    </span>
                    <ArrowRight size={13} className="text-[#71717A]" />
                  </Link>
                ))
              ) : (
                <p className="text-xs text-[#71717A] text-center py-6">
                  No recently visited tools yet.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338]">
              {recentTools.length > 0 ? (
                <AnimatedTrashButton
                  onDelete={clearHistory}
                  iconSize={13}
                  className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <span>Clear History</span>
                </AnimatedTrashButton>
              ) : (
                <span />
              )}
              <button
                onClick={() => setHistoryOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS PANEL ── */}
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setSettingsOpen(false)}
          />
          {/* Panel — full-screen on mobile, centered modal on desktop */}
          <div
            className="fixed z-50 inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full md:max-h-[85vh] md:rounded-2xl bg-white dark:bg-[#0E1322] md:border md:border-[#E4E0D8] dark:md:border-[#1E2338] md:shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#0E1322] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40">
                  <Settings2 size={16} className="text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-bold text-sm text-[#18181B] dark:text-white">
                  Preferences & Settings
                </h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-5 space-y-6">

                {/* ─ Appearance ─ */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-[#71717A] dark:text-[#8E95A8] uppercase tracking-wider">
                      Appearance
                    </span>
                    <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 capitalize">
                      {theme} Theme
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Light Option */}
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`group relative flex flex-col p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                        theme === "light"
                          ? "border-[#0D9488] dark:border-[#2DD4BF] bg-[#0D9488]/[0.04] dark:bg-[#2DD4BF]/[0.06] shadow-xs"
                          : "border-[#E4E0D8] dark:border-[#1E2338] bg-black/[0.02] dark:bg-white/[0.02] hover:border-[#A1A1AA] dark:hover:border-[#3A4066]"
                      }`}
                    >
                      {/* Top-Right Check Badge */}
                      {theme === "light" && (
                        <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[#0D9488] dark:bg-[#2DD4BF] text-white dark:text-[#080B16] flex items-center justify-center shadow-xs z-10">
                          <Check size={9} strokeWidth={3.5} />
                        </span>
                      )}

                      {/* Mini Window Mockup */}
                      <div className="w-full h-11 rounded-lg bg-[#FAFAF8] border border-[#E4E0D8] p-1 flex flex-col justify-between shadow-2xs overflow-hidden">
                        <div className="flex items-center justify-between pb-0.5 border-b border-[#E4E0D8]">
                          <div className="flex items-center gap-0.5">
                            <span className="h-1 w-1 rounded-full bg-rose-400" />
                            <span className="h-1 w-1 rounded-full bg-amber-400" />
                            <span className="h-1 w-1 rounded-full bg-emerald-400" />
                          </div>
                          <div className="h-0.5 w-4 rounded-full bg-[#E4E0D8]" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="h-1 w-3/4 rounded-xs bg-[#E4E0D8]" />
                          <div className="h-0.5 w-1/2 rounded-xs bg-[#E4E0D8]/60" />
                        </div>
                      </div>

                      {/* Centered Label Row */}
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <Sun size={12} className={theme === "light" ? "text-[#0D9488] dark:text-[#2DD4BF]" : "text-[#71717A]"} />
                        <span className={`text-[11px] font-semibold ${theme === "light" ? "text-[#18181B] dark:text-white font-bold" : "text-[#71717A]"}`}>
                          Light
                        </span>
                      </div>
                    </button>

                    {/* Dark Option */}
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`group relative flex flex-col p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                        theme === "dark"
                          ? "border-[#0D9488] dark:border-[#2DD4BF] bg-[#0D9488]/[0.04] dark:bg-[#2DD4BF]/[0.06] shadow-xs"
                          : "border-[#E4E0D8] dark:border-[#1E2338] bg-black/[0.02] dark:bg-white/[0.02] hover:border-[#A1A1AA] dark:hover:border-[#3A4066]"
                      }`}
                    >
                      {/* Top-Right Check Badge */}
                      {theme === "dark" && (
                        <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[#0D9488] dark:bg-[#2DD4BF] text-white dark:text-[#080B16] flex items-center justify-center shadow-xs z-10">
                          <Check size={9} strokeWidth={3.5} />
                        </span>
                      )}

                      {/* Mini Window Mockup */}
                      <div className="w-full h-11 rounded-lg bg-[#080B16] border border-[#1E2338] p-1 flex flex-col justify-between shadow-2xs overflow-hidden">
                        <div className="flex items-center justify-between pb-0.5 border-b border-[#1E2338]">
                          <div className="flex items-center gap-0.5">
                            <span className="h-1 w-1 rounded-full bg-rose-500/80" />
                            <span className="h-1 w-1 rounded-full bg-amber-500/80" />
                            <span className="h-1 w-1 rounded-full bg-emerald-500/80" />
                          </div>
                          <div className="h-0.5 w-4 rounded-full bg-[#1E2338]" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="h-1 w-3/4 rounded-xs bg-[#1E2338]" />
                          <div className="h-0.5 w-1/2 rounded-xs bg-[#1E2338]/60" />
                        </div>
                      </div>

                      {/* Centered Label Row */}
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <Moon size={12} className={theme === "dark" ? "text-[#0D9488] dark:text-[#2DD4BF]" : "text-[#71717A]"} />
                        <span className={`text-[11px] font-semibold ${theme === "dark" ? "text-[#18181B] dark:text-white font-bold" : "text-[#71717A]"}`}>
                          Dark
                        </span>
                      </div>
                    </button>

                    {/* System Option */}
                    <button
                      type="button"
                      onClick={() => setTheme("system")}
                      className={`group relative flex flex-col p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                        theme === "system"
                          ? "border-[#0D9488] dark:border-[#2DD4BF] bg-[#0D9488]/[0.04] dark:bg-[#2DD4BF]/[0.06] shadow-xs"
                          : "border-[#E4E0D8] dark:border-[#1E2338] bg-black/[0.02] dark:bg-white/[0.02] hover:border-[#A1A1AA] dark:hover:border-[#3A4066]"
                      }`}
                    >
                      {/* Top-Right Check Badge */}
                      {theme === "system" && (
                        <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[#0D9488] dark:bg-[#2DD4BF] text-white dark:text-[#080B16] flex items-center justify-center shadow-xs z-10">
                          <Check size={9} strokeWidth={3.5} />
                        </span>
                      )}

                      {/* Mini Window Mockup (Split) */}
                      <div className="w-full h-11 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] flex shadow-2xs overflow-hidden">
                        {/* Left Light */}
                        <div className="w-1/2 h-full bg-[#FAFAF8] p-1 flex flex-col justify-between border-r border-[#E4E0D8]">
                          <div className="flex items-center gap-0.5">
                            <span className="h-1 w-1 rounded-full bg-rose-400" />
                            <span className="h-1 w-1 rounded-full bg-amber-400" />
                          </div>
                          <div className="h-1 w-full rounded-xs bg-[#E4E0D8]" />
                        </div>
                        {/* Right Dark */}
                        <div className="w-1/2 h-full bg-[#080B16] p-1 flex flex-col justify-between">
                          <div className="flex items-center justify-end">
                            <span className="h-1 w-1 rounded-full bg-emerald-500/80" />
                          </div>
                          <div className="h-1 w-full rounded-xs bg-[#1E2338]" />
                        </div>
                      </div>

                      {/* Centered Label Row */}
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <Monitor size={12} className={theme === "system" ? "text-[#0D9488] dark:text-[#2DD4BF]" : "text-[#71717A]"} />
                        <span className={`text-[11px] font-semibold ${theme === "system" ? "text-[#18181B] dark:text-white font-bold" : "text-[#71717A]"}`}>
                          System
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ─ Offline & PWA ─ */}
                <div>
                  <div className="text-[11px] font-bold text-[#71717A] dark:text-[#8E95A8] uppercase tracking-wider mb-3">
                    Offline Access
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#E4E0D8] dark:border-[#1E2338]">
                    <div className="space-y-1 pr-3">
                      <div className="text-xs font-bold text-[#18181B] dark:text-white flex items-center gap-1.5">
                        <span className={`inline-flex h-2 w-2 rounded-full ${pwaActive ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                        Offline PWA Mode
                      </div>
                      <div className="text-[11px] text-[#71717A] leading-relaxed">
                        {pwaActive
                          ? "App shell is cached. Tools work offline."
                          : "Enable to use client-side tools without internet."}
                      </div>
                    </div>
                    <button
                      onClick={togglePwa}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shrink-0 ${pwaActive
                          ? "border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          : "border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        }`}
                    >
                      {pwaActive ? "Turn Off" : "Enable"}
                    </button>
                  </div>
                </div>

                {/* ─ Quick Links ─ */}
                <div>
                  <div className="text-[11px] font-bold text-[#71717A] dark:text-[#8E95A8] uppercase tracking-wider mb-3">
                    Quick Links
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { name: "About SajiloTools", href: "/about", icon: Info },
                      { name: "Privacy Policy", href: "/privacy-policy", icon: ShieldCheck },
                      { name: "Suggest a Tool", href: "/contact", icon: MessageSquarePlus },
                    ].map((link) => {
                      const LinkIcon = link.icon;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setSettingsOpen(false)}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <LinkIcon size={15} className="text-[#71717A]" />
                            <span className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                              {link.name}
                            </span>
                          </span>
                          <ArrowRight size={13} className="text-[#D4D4D8] dark:text-[#52525B]" />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* ─ Privacy Badge ─ */}
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      Privacy-First
                    </div>
                    <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 leading-relaxed">
                      All client-side tools run 100% in your browser. No data is uploaded or tracked on our servers.
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-5 py-4 border-t border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#0E1322] flex items-center justify-between shrink-0">
              <span className="text-[10px] text-[#A1A1AA] dark:text-[#52525B] font-medium">
                SajiloTools v1.0
              </span>
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-5 py-2 bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] text-xs font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
