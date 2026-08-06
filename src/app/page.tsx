"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import SearchBar from "@/components/SearchBar";
import { getToolAccentStyle } from "@/lib/theme-utils";
import {
  Search,
  Moon,
  Sun,
  X,
  Menu,
  ChevronDown,
  ArrowRight,
  Check,
  Command,
  TrendingUp,
  BadgeCheck,
  Languages,
  Settings2,
  History,
  Heart,
  Star,
  FileText,
  Image as ImageIcon,
  Calculator,
  CalendarDays,
  ShieldCheck,
  Ruler,
  Braces,
  QrCode,
  AlignLeft,
  Palette,
  Link2,
  Hash,
  Code2,
  ArrowLeftRight,
  ArrowDownToLine,
  Zap,
  MapPin,
  Wand2,
  Calendar,
  Keyboard,
  RefreshCw,
  Sparkles,
  Percent,
  Cake,
  GraduationCap,
  Activity,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { TOOLS as REGISTERED_TOOLS, CATEGORIES as REGISTERED_CATEGORIES, type ToolDef } from "@/lib/tools-registry";

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Image: ImageIcon,
  AlignLeft,
  QrCode,
  Calculator,
  Palette,
  Braces,
  Link2,
  Calendar,
  Keyboard,
  RefreshCw,
  Search,
  ShieldCheck,
  Ruler,
  Hash,
  Code2,
  Wand2,
  Languages,
  MapPin,
  CalendarDays,
  ArrowLeftRight,
  ArrowDownToLine,
  Zap,
  BadgeCheck,
  Settings2,
  History,
  Heart,
  Star,
  Moon,
  Sun,
  X,
  Menu,
  ChevronDown,
  ArrowRight,
  Check,
  Command,
  TrendingUp,
  Sparkles,
  Percent,
  Cake,
  GraduationCap,
  Activity,
  Tag,
};



// ─── DATA ────────────────────────────────────────────────────────────────────

const FEATURED_TOOLS = REGISTERED_TOOLS.filter(t => t.featured);
const TRENDING_TOOLS = REGISTERED_TOOLS.filter(t => t.trending);
const LATEST_TOOLS = REGISTERED_TOOLS.filter(t => t.isLatest);

const CATEGORIES = REGISTERED_CATEGORIES.map(cat => ({
  ...cat,
  Icon: ICON_MAP[cat.icon] || FileText,
}));

const STATS = [
  { value: `${REGISTERED_TOOLS.length}+`, label: "Free Tools" },
  { value: "100%", label: "Client-Side Privacy" },
  { value: "No", label: "Sign-up Required" },
  { value: "Instant", label: "Local Speed" },
];

const WHY_ITEMS = [
  {
    Icon: Zap,
    title: "Blazing Fast",
    desc: "Every tool loads in under a second. No waiting, no spinners, no friction.",
  },
  {
    Icon: ShieldCheck,
    title: "Privacy First",
    desc: "Files are processed locally. Your data never touches our servers.",
  },
  {
    Icon: MapPin,
    title: "Built for Nepal",
    desc: "NRs tools, Nepali fonts, and local resources — made for you.",
  },
  {
    Icon: BadgeCheck,
    title: "No Sign-up Ever",
    desc: "Open any tool and start working. We will never ask you to register.",
  },
  {
    Icon: Heart,
    title: "Always Free",
    desc: "No subscriptions, no paywalls, no ads. 100% free, forever.",
  },
  {
    Icon: Braces,
    title: "Open Source",
    desc: "Community-built and transparent. Contribute on GitHub anytime.",
  },
];

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Tools", href: "/tools" },
  { name: "PDF", href: "/tools/pdf" },
  { name: "Image", href: "/tools/image" },
  { name: "Finance", href: "/tools/finance" },
  { name: "Developer", href: "/tools/developer" },
  { name: "Nepal", href: "/tools/nepal" },
];

const BADGE_CONFIG: Record<
  string,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  Popular: {
    bg: "#FEF3C7",
    text: "#B45309",
    darkBg: "#451A03",
    darkText: "#FCD34D",
  },
  Fast: {
    bg: "#DBEAFE",
    text: "#1D4ED8",
    darkBg: "#1E3A5F",
    darkText: "#93C5FD",
  },
  Free: {
    bg: "#DCFCE7",
    text: "#15803D",
    darkBg: "#052E16",
    darkText: "#86EFAC",
  },
  New: {
    bg: "#F3E8FF",
    text: "#7C3AED",
    darkBg: "#2E1065",
    darkText: "#C4B5FD",
  },
  Nepal: {
    bg: "#FEE2E2",
    text: "#DC2626",
    darkBg: "#450A0A",
    darkText: "#FCA5A5",
  },
  Updated: {
    bg: "#E0F2FE",
    text: "#0369A1",
    darkBg: "#0C2D48",
    darkText: "#7DD3FC",
  },
};

type RecentTool = {
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
};

function readRecentTools(): RecentTool[] {
  try {
    const raw = localStorage.getItem("sajilo_history");
    const saved = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(saved)) return [];

    // Discard stale entries so every recent-tool link always points to a real tool.
    return saved.slice(0, 10).flatMap((item) => {
      const tool = REGISTERED_TOOLS.find(
        (registered) => registered.slug === item?.slug && registered.categorySlug === item?.categorySlug,
      );
      return tool ? [{ name: tool.name, slug: tool.slug, categorySlug: tool.categorySlug, categoryName: tool.category }] : [];
    });
  } catch {
    return [];
  }
}

// ─── BADGE ───────────────────────────────────────────────────────────────────

function Badge({
  label,
}: {
  label: string;
}) {
  const cfg = BADGE_CONFIG[label] ?? {
    bg: "#F3F4F6",
    text: "#374151",
    darkBg: "#1F2937",
    darkText: "#D1D5DB",
  };
  return (
    <span
      className="inline-block text-[10px] font-semibold px-2 py-[3px] rounded-full tracking-wide leading-none st-badge"
      style={
        {
          "--badge-bg": cfg.bg,
          "--badge-text": cfg.text,
          "--badge-dark-bg": cfg.darkBg,
          "--badge-dark-text": cfg.darkText,
        } as React.CSSProperties
      }
    >
      {label}
    </span>
  );
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────

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
      <div
        className="st-marquee-track flex py-1"
        style={{ width: "max-content" }}
      >
        {doubled.map((tool, i) => {
          const Icon = ICON_MAP[tool.icon] || FileText;
          return (
            <Link
              key={i}
              href={`/tools/${tool.categorySlug}/${tool.slug}`}
              className="flex items-center gap-2 px-4 py-2 mx-1.5 rounded-full border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[13px] font-medium text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:border-[#1F2544] dark:hover:border-[#F5A623] hover:bg-[#FAFAF8] dark:hover:bg-[#1A1F35] transition-all duration-150 whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <Icon
                size={12}
                strokeWidth={2}
                className="flex-shrink-0 opacity-70"
              />
              {tool.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}



// ─── TOOL CARD ───────────────────────────────────────────────────────────────

function ToolCard({
  tool,
  favorited,
  onFavorite,
}: {
  tool: ToolDef;
  favorited: boolean;
  onFavorite: () => void;
}) {
  const Icon = ICON_MAP[tool.icon] || FileText;

  return (
    <Link
      href={`/tools/${tool.categorySlug}/${tool.slug}`}
      className="group relative block bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-none st-card-hover hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start justify-between mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 tool-accent-bg tool-accent-text"
          style={getToolAccentStyle(tool.color, tool.darkColor)}
        >
          <Icon
            size={20}
            strokeWidth={2}
          />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite();
          }}
          className={`p-1.5 rounded-lg transition-all duration-150 ${favorited
            ? "text-rose-500 bg-rose-50 dark:bg-rose-950/50"
            : "text-[#D4D4D8] dark:text-[#374151] hover:text-[#A1A1AA] dark:hover:text-[#6B7280] hover:bg-[#F7F5F0] dark:hover:bg-[#1E2338]"
            }`}
          aria-label={
            favorited
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          <Heart
            size={15}
            strokeWidth={2}
            fill={favorited ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <h3
          className="font-semibold text-[#18181B] dark:text-[#F4F4F5] text-sm leading-snug"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {tool.name}
        </h3>
        <Badge label={tool.badge} />
      </div>
      <p className="text-[#71717A] dark:text-[#A1A1AA] text-xs leading-relaxed mb-5">
        {tool.desc}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-[#C4C0B8] dark:text-[#374151] uppercase tracking-wider">
          {tool.category}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <span className="flex items-center gap-1 text-xs font-semibold text-[#1F2544] dark:text-[#F5A623]">
            Open <ArrowRight size={11} strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── CATEGORY CARD ───────────────────────────────────────────────────────────

function CategoryCard({
  cat,
}: {
  cat: (typeof CATEGORIES)[0];
}) {
  const Icon = cat.Icon;
  const catSlug = cat.slug;
  const realCount = REGISTERED_TOOLS.filter((t) => t.categorySlug === catSlug).length;

  return (
    <Link
      href={`/tools/${catSlug}`}
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
        <div className="text-[11px] text-[#A1A1AA]">
          {realCount} tools
        </div>
      </div>
    </Link>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);

  useEffect(() => {
    setMounted(true);
    setRecentTools(readRecentTools());

    const syncRecentTools = () => setRecentTools(readRecentTools());
    window.addEventListener("storage", syncRecentTools);
    return () => window.removeEventListener("storage", syncRecentTools);
  }, []);

  const isDark = mounted && (theme === "dark" || (theme === "system" && systemTheme === "dark"));

  const [lang, setLang] = useState<"EN" | "NP">("EN");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sajilo_favorites");
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribeHoneypot, setSubscribeHoneypot] = useState("");
  const [submittingSubscribe, setSubmittingSubscribe] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");

  const toggleFav = (name: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      try {
        localStorage.setItem("sajilo_favorites", JSON.stringify(Array.from(next)));
      } catch { /* quota exceeded — fail silently */ }
      return next;
    });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submittingSubscribe) return;

    setSubmittingSubscribe(true);
    setSubscribeError("");
    setIsAlreadySubscribed(false);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, honeypot: subscribeHoneypot }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe.");
      }

      if (data.alreadySubscribed) {
        setIsAlreadySubscribed(true);
      }
      setSubscribed(true);
    } catch (err: any) {
      setSubscribeError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmittingSubscribe(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#F7F5F0] dark:bg-[#0C0F1E]">
        {/* ── BACKGROUND ── */}
        <div
          className="fixed inset-0 pointer-events-none z-0 st-grid"
          aria-hidden
        />
        <div
          className="fixed inset-0 pointer-events-none z-0 st-glow"
          aria-hidden
        />

        <div className="relative z-10">
          {/* ── NAVBAR ── */}
          <SiteHeader />

          {/* ── HERO ── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E4E0D8] dark:border-[#1E2338] bg-white/80 dark:bg-[#141829]/80 backdrop-blur-sm mb-8 text-sm text-[#71717A] dark:text-[#A1A1AA] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <BadgeCheck
                size={14}
                strokeWidth={2}
                style={{ color: "#F5A623" }}
              />
              {REGISTERED_TOOLS.length}+ free tools, built for everyone
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#18181B] dark:text-[#F4F4F5] leading-[1.08] tracking-tight mb-6"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Find the right tool
              <br />
              <span style={{ color: "#F5A623" }}>
                instantly.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#71717A] dark:text-[#9CA3AF] max-w-lg mx-auto mb-10 leading-relaxed">
              Easy tools, made local. Everything you need to get digital tasks done — fast, free, and without sign-up.
            </p>

            {/* Hero search */}
            <div className="max-w-xl mx-auto mb-12">
              <SearchBar large placeholder={`Search ${REGISTERED_TOOLS.length}+ free developer & local tools (e.g. Base64, QR, PDF, Miti)...`} />
            </div>

            {/* Trending */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp
                size={12}
                strokeWidth={2}
                className="text-[#A1A1AA]"
              />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#A1A1AA]">
                Trending
              </p>
            </div>
            <Marquee items={TRENDING_TOOLS} />
          </section>

          {/* ── POPULAR TOOLS ── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2
                  className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-1"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Popular Tools
                </h2>
                <p className="text-sm text-[#71717A] dark:text-[#9CA3AF]">
                  Most-used tools by the SajiloTools community
                </p>
              </div>
              <Link href="/tools" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#1F2544] dark:text-[#F5A623] hover:opacity-75 transition-opacity">
                View all{" "}
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURED_TOOLS.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  tool={tool}
                  favorited={favorites.has(tool.name)}
                  onFavorite={() => toggleFav(tool.name)}
                />
              ))}
            </div>
          </section>

          {/* ── CATEGORIES ── */}
          <section className="bg-white/60 dark:bg-[#0C0F1E]/60 backdrop-blur-sm border-y border-[#E4E0D8] dark:border-[#1E2338] py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2
                  className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Browse by Category
                </h2>
                <p className="text-sm text-[#71717A] dark:text-[#9CA3AF]">
                  Every tool organized exactly where you expect
                  it
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {CATEGORIES.map((cat) => (
                  <CategoryCard key={cat.name} cat={cat} />
                ))}
              </div>
            </div>
          </section>

          {/* ── STATS ── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#E4E0D8] dark:lg:divide-[#1E2338]">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center px-4"
                >
                  <div
                    className="text-4xl sm:text-5xl font-bold text-[#1F2544] dark:text-[#F5A623] mb-2 tabular-nums"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#71717A] dark:text-[#9CA3AF]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── WHY SAJILOTOOLS ── */}
          <section className="bg-[#F7F5F0] dark:bg-[#080B16] border-t border-b border-[#E4E0D8] dark:border-[#1A1F3A] py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-14">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mb-3 tracking-tight"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Why SajiloTools?
                </h2>
                <p className="text-[#71717A] dark:text-[#A1A1AA] max-w-sm mx-auto text-sm leading-relaxed">
                  Designed to be the last tools site you will
                  ever need
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {WHY_ITEMS.map(({ Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-white/8 hover:border-[#F5A623]/50 dark:hover:border-white/16 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-150 cursor-default"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#F5A623]/10 dark:bg-[#F5A623]/14"
                    >
                      <Icon
                        size={18}
                        strokeWidth={2}
                        style={{ color: "#F5A623" }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-[#18181B] dark:text-white text-sm mb-1.5"
                        style={{
                          fontFamily: "'Sora', sans-serif",
                        }}
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
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
              <Link href="/tools" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#1F2544] dark:text-[#F5A623] hover:opacity-75 transition-opacity">
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
                      <Icon
                        size={18}
                        strokeWidth={2}
                        className="text-[#71717A] dark:text-[#A1A1AA]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span
                          className="font-semibold text-[#18181B] dark:text-[#F4F4F5] text-sm truncate"
                          style={{
                            fontFamily: "'Sora', sans-serif",
                          }}
                        >
                          {tool.name}
                        </span>
                        <Badge label={tool.badge} />
                      </div>
                      <div className="text-[11px] text-[#A1A1AA]">
                        {tool.category}
                      </div>
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
          <section className="bg-white/60 dark:bg-[#0C0F1E]/60 backdrop-blur-sm border-y border-[#E4E0D8] dark:border-[#1E2338] py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2
                  className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Built for Speed, Privacy & Trust
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
                  <h3 className="font-bold text-base text-[#18181B] dark:text-[#F4F4F5]">100% Client-Side Privacy</h3>
                  <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                    Your files, PDFs, images, and text stay strictly on your device. Processing happens locally inside your web browser.
                  </p>
                </div>

                <div className="p-7 bg-[#FAFAF8] dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
                    <Zap size={20} />
                  </div>
                  <h3 className="font-bold text-base text-[#18181B] dark:text-[#F4F4F5]">Instant & Lightweight</h3>
                  <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                    Optimized to run seamlessly on mobile data networks and budget smartphones without bloated downloads or paywalls.
                  </p>
                </div>

                <div className="p-7 bg-[#FAFAF8] dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <MapPin size={20} />
                  </div>
                  <h3 className="font-bold text-base text-[#18181B] dark:text-[#F4F4F5]">Tailored for Nepal</h3>
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
              {/* Decorative glow */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
              </div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                  <Heart size={20} strokeWidth={2} className="text-accent-foreground" fill="currentColor" />
                </div>

                {/* Heading */}
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight font-sora">
                  Stay in the loop
                </h2>

                {/* Subtext */}
                <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
                  Get notified when new tools launch. No spam, ever. Unsubscribe anytime with one click.
                </p>

                {/* Form / Success state */}
                {subscribed ? (
                  <div className={`inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border font-medium text-sm ${isAlreadySubscribed ? "bg-[#FEF3C7] dark:bg-[#78350F]/40 border-[#FDE68A] dark:border-[#92400E] text-[#B45309] dark:text-[#FDE68A]" : "bg-[#DCFCE7] dark:bg-[#052E16]/60 border-[#BBF7D0] dark:border-[#14532D] text-[#15803D] dark:text-[#86EFAC]"}`}>
                    <Check size={16} strokeWidth={2} />
                    {isAlreadySubscribed
                      ? "You're already subscribed to our newsletter!"
                      : "You are subscribed — thanks!"}
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubscribe}
                    className="max-w-md mx-auto space-y-3"
                  >
                    {/* Hidden Honeypot Field */}
                    <div className="hidden" aria-hidden="true">
                      <input
                        type="text"
                        name="b_website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={subscribeHoneypot}
                        onChange={(e) => setSubscribeHoneypot(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="flex-1 min-w-0 h-11 px-3 sm:px-4 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground/60 text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition-all shadow-sm"
                      />
                      <button
                        type="submit"
                        disabled={submittingSubscribe}
                        className="h-11 px-4 sm:px-6 rounded-xl font-semibold text-sm bg-primary text-primary-foreground flex-shrink-0 hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm whitespace-nowrap"
                      >
                        {submittingSubscribe ? "Subscribing..." : "Subscribe"}
                      </button>
                    </div>

                    {subscribeError && (
                      <p className="text-xs text-red-500 dark:text-red-400 font-medium text-center">
                        {subscribeError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <SiteFooter />
        </div>

        {/* ── HISTORY MODAL ── */}
        {historyOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setHistoryOpen(false)}
          >
            <div
              className="bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-[#1F2544] dark:text-[#F5A623]" />
                  <h3 className="font-semibold text-lg text-[#18181B] dark:text-[#F4F4F5]">Recently Used Tools</h3>
                </div>
                <button onClick={() => setHistoryOpen(false)} className="text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 py-2 max-h-[300px] overflow-y-auto">
                {recentTools.length === 0 ? (
                  <p className="text-sm text-[#A1A1AA] text-center py-6">
                    Open any tool and it will appear here.
                  </p>
                ) : (
                  recentTools.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/tools/${item.categorySlug}/${item.slug}`}
                      onClick={() => setHistoryOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-[#18181B] dark:text-[#F4F4F5]">{item.name}</div>
                        <div className="text-[10px] text-[#A1A1AA] capitalize">{item.categoryName || item.categorySlug}</div>
                      </div>
                      <ArrowRight size={14} className="text-[#A1A1AA]" />
                    </Link>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338]">
                <button
                  onClick={() => {
                    try { localStorage.removeItem("sajilo_history"); } catch { }
                    setRecentTools([]);
                  }}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Clear History
                </button>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2338] rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS MODAL ── */}
        {settingsOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSettingsOpen(false)}
          >
            <div
              className="bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 size={18} className="text-[#1F2544] dark:text-[#F5A623]" />
                  <h3 className="font-semibold text-lg text-[#18181B] dark:text-[#F4F4F5]">Preferences &amp; Settings</h3>
                </div>
                <button onClick={() => setSettingsOpen(false)} className="text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">Theme Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTheme("light")}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${!isDark ? "bg-[#1F2544] text-white border-[#1F2544]" : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A]"}`}
                    >
                      ☀️ Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${isDark ? "bg-[#F5A623] text-[#0C0F1E] border-[#F5A623]" : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A]"}`}
                    >
                      🌙 Dark
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="px-4 py-2 bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] font-medium text-sm rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
