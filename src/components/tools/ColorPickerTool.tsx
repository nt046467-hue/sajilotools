"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  Pipette,
  Eye,
  Palette,
  Upload,
  Image as ImageIcon,
  Download,
  Trash2,
  Sliders,
  X,
  Code2,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  Link2,
  ChevronRight,
  Plus,
  Send,
  Globe,
  ExternalLink,
} from "lucide-react";
import AnimatedTrashIcon, { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";
import ImageDropzone from "./shared/ImageDropzone";

// --- Authentic Real-World Icons for Presets and Swatches ---

function PhotoPresetsIcon({ className = "w-4 h-4 text-[#F5A623]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 22H4a2 2 0 0 1-2-2V6" />
      <rect x="6" y="2" width="16" height="16" rx="2" />
      <circle cx="11" cy="7" r="1.5" />
      <path d="m22 13-3-3a2 2 0 0 0-2.8 0L10 16" />
    </svg>
  );
}

function SwatchDeckIcon({ className = "w-4 h-4 text-[#F5A623]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="7" width="16" height="15" rx="2" />
      <path d="M6 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2" />
      <line x1="2" y1="14" x2="18" y2="14" />
      <circle cx="6" cy="18" r="1.2" fill="currentColor" />
      <circle cx="10" cy="18" r="1.2" fill="currentColor" />
      <circle cx="14" cy="18" r="1.2" fill="currentColor" />
    </svg>
  );
}

// --- Color Space Math Helpers ---

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  if (h.length !== 6) return null;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number) {
  h = ((h % 360) + 360) % 360;
  h /= 360;
  s = Math.min(100, Math.max(0, s)) / 100;
  l = Math.min(100, Math.max(0, l)) / 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function rgbToCmyk(r: number, g: number, b: number) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = Math.round(((1 - rNorm - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gNorm - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bNorm - k) / (1 - k)) * 100);
  return { c, m, y, k: Math.round(k * 100) };
}

function rgbToLab(r: number, g: number, b: number) {
  const [rLin, gLin, bLin] = [r / 255, g / 255, b / 255].map((v) =>
    v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
  );
  const x = (rLin * 0.4124564 + gLin * 0.3575761 + bLin * 0.1804375) / 0.95047;
  const y = (rLin * 0.2126729 + gLin * 0.7151522 + bLin * 0.072175) / 1.0;
  const z = (rLin * 0.0193339 + gLin * 0.119192 + bLin * 0.9503041) / 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  const lVal = Math.max(0, 116 * fy - 16);
  const aVal = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);

  return {
    l: Math.round(lVal * 10) / 10,
    a: Math.round(aVal * 10) / 10,
    b: Math.round(bVal * 10) / 10,
  };
}

function relativeLuminance(r: number, g: number, b: number) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(
  rgb1: { r: number; g: number; b: number },
  rgb2: { r: number; g: number; b: number }
) {
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Color Blindness Simulation
type CvdType = "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

function simulateCvd(
  r: number,
  g: number,
  b: number,
  type: CvdType
): { r: number; g: number; b: number } {
  if (type === "achromatopsia") {
    const gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    return { r: gray, g: gray, b: gray };
  }

  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const toGamma = (v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    const g =
      clamped <= 0.0031308
        ? 12.92 * clamped
        : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    return Math.round(Math.min(255, Math.max(0, g * 255)));
  };

  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);

  let rSim = 0;
  let gSim = 0;
  let bSim = 0;

  if (type === "protanopia") {
    rSim = 0.56667 * rLin + 0.43333 * gLin + 0.0 * bLin;
    gSim = 0.55833 * rLin + 0.44167 * gLin + 0.0 * bLin;
    bSim = 0.0 * rLin + 0.24167 * gLin + 0.75833 * bLin;
  } else if (type === "deuteranopia") {
    rSim = 0.625 * rLin + 0.375 * gLin + 0.0 * bLin;
    gSim = 0.7 * rLin + 0.3 * gLin + 0.0 * bLin;
    bSim = 0.0 * rLin + 0.3 * gLin + 0.7 * bLin;
  } else if (type === "tritanopia") {
    rSim = 0.95 * rLin + 0.05 * gLin + 0.0 * bLin;
    gSim = 0.0 * rLin + 0.43333 * gLin + 0.56667 * bLin;
    bSim = 0.0 * rLin + 0.475 * gLin + 0.525 * bLin;
  }

  return {
    r: toGamma(rSim),
    g: toGamma(gSim),
    b: toGamma(bSim),
  };
}

// --- Image Quantization & Sampling Helpers ---

export interface ExtractedColor {
  hex: string;
  count: number;
  percentage: number;
  r: number;
  g: number;
  b: number;
}

function extractDominantColors(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  maxColors = 8
): ExtractedColor[] {
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 35000)));
  const imgData = ctx.getImageData(0, 0, width, height).data;

  const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  let totalSampled = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const a = imgData[idx + 3];
      if (a < 128) continue;

      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];

      const qR = Math.round(r / 24) * 24;
      const qG = Math.round(g / 24) * 24;
      const qB = Math.round(b / 24) * 24;
      const key = `${qR},${qG},${qB}`;

      const existing = colorBuckets.get(key);
      if (existing) {
        existing.count++;
        existing.r += r;
        existing.g += g;
        existing.b += b;
      } else {
        colorBuckets.set(key, { r, g, b, count: 1 });
      }
      totalSampled++;
    }
  }

  if (totalSampled === 0) return [];

  const sorted = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);

  const result: ExtractedColor[] = [];
  const colorDist = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) =>
    Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));

  for (const bucket of sorted) {
    const avgR = Math.min(255, Math.max(0, Math.round(bucket.r / bucket.count)));
    const avgG = Math.min(255, Math.max(0, Math.round(bucket.g / bucket.count)));
    const avgB = Math.min(255, Math.max(0, Math.round(bucket.b / bucket.count)));

    const isDistinct = result.every((c) => colorDist(avgR, avgG, avgB, c.r, c.g, c.b) > 40);
    if (isDistinct) {
      result.push({
        hex: rgbToHex(avgR, avgG, avgB),
        count: bucket.count,
        percentage: Math.max(1, Math.round((bucket.count / totalSampled) * 100)),
        r: avgR,
        g: avgG,
        b: avgB,
      });
      if (result.length >= maxColors) break;
    }
  }

  return result;
}

function samplePixelColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number,
  sampleSize: 1 | 3 | 5
): { hex: string; r: number; g: number; b: number } {
  const half = Math.floor(sampleSize / 2);
  const startX = Math.max(0, x - half);
  const startY = Math.max(0, y - half);
  const endX = Math.min(canvasWidth - 1, x + half);
  const endY = Math.min(canvasHeight - 1, y + half);

  const w = endX - startX + 1;
  const h = endY - startY + 1;
  const data = ctx.getImageData(startX, startY, w, h).data;

  let totalR = 0,
    totalG = 0,
    totalB = 0,
    count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }
  }

  if (count === 0) {
    return { hex: "#000000", r: 0, g: 0, b: 0 };
  }

  const r = Math.min(255, Math.max(0, Math.round(totalR / count)));
  const g = Math.min(255, Math.max(0, Math.round(totalG / count)));
  const b = Math.min(255, Math.max(0, Math.round(totalB / count)));
  return { hex: rgbToHex(r, g, b), r, g, b };
}

// --- Sample Image Presets (Realistic Photographic Assets) ---

const SAMPLE_PRESETS = [
  {
    id: "sunset",
    title: "Sunset Horizon",
    tag: "Warm Dusk & Lake",
    colors: ["#090514", "#931851", "#EA580C", "#FEF08A"],
    dataUri: "/images/samples/sunset-horizon.webp",
  },
  {
    id: "cyberpunk",
    title: "Neon Cyberpunk",
    tag: "Electric Synthwave",
    colors: ["#00F0FF", "#FF007F", "#7928CA", "#FFE600"],
    dataUri: "/images/samples/neon-cyberpunk.webp",
  },
  {
    id: "nature",
    title: "Tropical Botanical",
    tag: "Lush Flora & Emeralds",
    colors: ["#064E3B", "#10B981", "#FF5722", "#0284C7"],
    dataUri: "/images/samples/tropical-botanical.webp",
  },
  {
    id: "citrus",
    title: "Fresh Citrus & Berries",
    tag: "Artisan Fruit Studio",
    colors: ["#EA580C", "#84CC16", "#E11D48", "#4338CA"],
    dataUri: "/images/samples/citrus-berries.webp",
  },
];

const RECENT_COLORS_STORAGE_KEY = "sajilotools_recent_colors";
const MAX_RECENT_COLORS = 12;

type WorkspaceMode = "image" | "mixer";

type PaletteTab =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "tints"
  | "shades";

export default function ColorPickerTool() {
  // Navigation & Workspace State — default to mixer (harmonies/sliders) on first open
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("mixer");

  // Core Color State
  const [hex, setHex] = useState("#F5A623");
  const [compareHex, setCompareHex] = useState("#1F2544");
  const [copied, setCopied] = useState("");
  const [hexError, setHexError] = useState("");
  const [activePaletteTab, setActivePaletteTab] = useState<PaletteTab>("complementary");
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"css" | "tailwind" | "json" | "scss">("css");
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  // --- Real Image Eyedropper Pro State ---
  // Start empty — user uploads or picks a preset when they visit the image tab
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(false);
  const [sampleSize, setSampleSize] = useState<1 | 3 | 5>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Draggable Pin Marker (stored in canvas image pixel coordinates)
  const [pin, setPin] = useState<{
    x: number;
    y: number;
    colorHex: string;
    visible: boolean;
  }>({
    x: 400,
    y: 290,
    colorHex: "#FF9800",
    visible: true,
  });
  const [isDraggingPin, setIsDraggingPin] = useState(false);

  // Loupe Magnifier State
  const [loupe, setLoupe] = useState<{
    visible: boolean;
    clientX: number;
    clientY: number;
    canvasX: number;
    canvasY: number;
    colorHex: string;
    r: number;
    g: number;
    b: number;
  }>({
    visible: false,
    clientX: 0,
    clientY: 0,
    canvasX: 0,
    canvasY: 0,
    colorHex: "#F5A623",
    r: 245,
    g: 166,
    b: 35,
  });

  // Hovered color for inspector HUD
  const [hoveredColor, setHoveredColor] = useState<{
    hex: string;
    r: number;
    g: number;
    b: number;
    x: number;
    y: number;
  } | null>(null);

  // Extracted Colors & Picked History
  const [dominantColors, setDominantColors] = useState<ExtractedColor[]>([]);
  const [imagePickedColors, setImagePickedColors] = useState<string[]>([
    "#FF9800",
    "#E1306C",
    "#1A153B",
  ]);

  // URL modal state
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  // Ref to the canvas wrapper card — used for smooth scroll-into-view on image load
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const prevLoadedImageRef = useRef<string | null>(null);

  // Initialize from URL query param & LocalStorage on mount
  useEffect(() => {
    setHasEyeDropper(typeof window !== "undefined" && "EyeDropper" in window);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlHex = params.get("hex") || params.get("color");
      if (urlHex) {
        const clean = (urlHex.startsWith("#") ? urlHex : "#" + urlHex).toUpperCase();
        if (/^#[0-9A-F]{6}$/i.test(clean)) {
          setHex(clean);
        }
      }

      try {
        const stored = localStorage.getItem(RECENT_COLORS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentColors(parsed.slice(0, MAX_RECENT_COLORS));
          }
        }
      } catch {}
    }
  }, []);

  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(hex);
  const rgb = useMemo(() => hexToRgb(hex) || { r: 245, g: 166, b: 35 }, [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);
  const lab = useMemo(() => rgbToLab(rgb.r, rgb.g, rgb.b), [rgb]);
  const safeHex = isValidHex ? hex.toUpperCase() : "#F5A623";

  const compareRgb = useMemo(
    () => hexToRgb(compareHex) || { r: 31, g: 37, b: 68 },
    [compareHex]
  );
  const safeCompareHex = /^#[0-9a-fA-F]{6}$/.test(compareHex)
    ? compareHex.toUpperCase()
    : "#1F2544";

  // Sync Color to URL and Save to Recent Colors
  const commitColor = useCallback((newHex: string) => {
    const formatted = newHex.toUpperCase();
    if (!/^#[0-9A-F]{6}$/i.test(formatted)) return;

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("hex", formatted.replace("#", ""));
      window.history.replaceState({}, "", url.toString());

      setRecentColors((prev) => {
        const filtered = prev.filter((c) => c.toUpperCase() !== formatted);
        const updated = [formatted, ...filtered].slice(0, MAX_RECENT_COLORS);
        try {
          localStorage.setItem(RECENT_COLORS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, []);

  const updateFromHex = (val: string) => {
    let clean = val.replace(/[^#0-9a-fA-F]/g, "");
    if (!clean.startsWith("#")) clean = "#" + clean;
    clean = clean.slice(0, 7);
    setHex(clean);

    if (clean.length === 7 && /^#[0-9a-fA-F]{6}$/.test(clean)) {
      setHexError("");
      commitColor(clean);
    } else if (clean.length > 1) {
      setHexError(`Need 6 hex digits — currently ${clean.length - 1}/6`);
    } else {
      setHexError("");
    }
  };

  const updateFromRgb = (key: "r" | "g" | "b", val: number) => {
    const clampedVal = Math.min(255, Math.max(0, isNaN(val) ? 0 : val));
    const newRgb = { ...rgb, [key]: clampedVal };
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHex(newHex);
    commitColor(newHex);
  };

  const updateFromHsl = (key: "h" | "s" | "l", val: number) => {
    const maxVal = key === "h" ? 360 : 100;
    const clampedVal = Math.min(maxVal, Math.max(0, isNaN(val) ? 0 : val));
    const newHsl = { ...hsl, [key]: clampedVal };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHex(newHex);
    commitColor(newHex);
  };

  const handleSliderKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "hsl" | "rgb",
    channel: "h" | "s" | "l" | "r" | "g" | "b"
  ) => {
    if (
      e.key === "ArrowUp" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowDown" ||
      e.key === "ArrowLeft"
    ) {
      e.preventDefault();
      const isUp = e.key === "ArrowUp" || e.key === "ArrowRight";
      const step = e.shiftKey ? 10 : 1;
      const delta = isUp ? step : -step;
      if (type === "hsl" && (channel === "h" || channel === "s" || channel === "l")) {
        updateFromHsl(channel, hsl[channel] + delta);
      } else if (type === "rgb" && (channel === "r" || channel === "g" || channel === "b")) {
        updateFromRgb(channel, rgb[channel] + delta);
      }
    }
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const step = e.shiftKey ? 5 : 1;
      const delta = e.key === "ArrowUp" ? step : -step;
      updateFromHsl("l", hsl.l + delta);
    }
  };

  const copyValue = useCallback((label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1600);
  }, []);

  const clearRecentColors = useCallback(() => {
    setRecentColors([]);
    try {
      localStorage.removeItem(RECENT_COLORS_STORAGE_KEY);
    } catch {}
  }, []);

  const pickFromScreen = useCallback(async () => {
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result.sRGBHex) {
        const picked = result.sRGBHex.toUpperCase();
        setHex(picked);
        setHexError("");
        commitColor(picked);
      }
    } catch {
      // Cancelled by user
    }
  }, [commitColor]);

  // --- Image Handling & Processing ---

  const handleImageFile = useCallback((file: File) => {
    const isImg =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|svg|avif|heic|bmp|ico)$/i.test(file.name);
    if (!isImg) return;
    setImageLoading(true);
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageSrc(result);
      setImageLoading(false);
      setPanOffset({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.onerror = () => {
      setImageLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  // Global Clipboard Paste Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
            setWorkspaceMode("image");
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleImageFile]);

  // Render Image on Canvas & Extract Dominant Palette
  // Also depends on workspaceMode — when user switches back to image tab,
  // canvas is still mounted (CSS hidden) but may need a redraw if it was
  // first painted while hidden (some browsers skip paint for hidden elements).
  useEffect(() => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    setImageLoading(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Render at natural dimensions (capped at 1600px width for smooth performance)
      const maxW = 1600;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxW) {
        h = Math.round((maxW / w) * h);
        w = maxW;
      }
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // Check if this is a newly loaded image (vs switching tabs back and forth)
      const isNewImage = prevLoadedImageRef.current !== imageSrc;
      if (isNewImage) {
        prevLoadedImageRef.current = imageSrc;

        // Extract Dominant Colors for newly loaded image
        try {
          const extracted = extractDominantColors(ctx, w, h, 8);
          setDominantColors(extracted);
        } catch (err) {
          console.warn("Could not extract dominant colors (possible CORS):", err);
        }

        // Drop initial pin at center
        const centerX = Math.floor(w / 2);
        const centerY = Math.floor(h / 2);
        const centerSample = samplePixelColor(ctx, centerX, centerY, w, h, sampleSize);
        setPin({
          x: centerX,
          y: centerY,
          colorHex: centerSample.hex,
          visible: true,
        });

        // Smooth-scroll down to the canvas workstation when an image is first loaded
        setTimeout(() => {
          canvasWrapRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 120);
      }

      setImageLoading(false);
    };
    img.onerror = () => {
      setImageLoading(false);
      alert("Failed to load image. If loading from URL, check if the server allows cross-origin requests.");
    };
    img.src = imageSrc;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, sampleSize, workspaceMode]);

  // Draw Loupe Magnifier (Photoshop style 11x11 pixel grid with center reticle)
  const drawLoupeMagnifier = useCallback(
    (canvasX: number, canvasY: number) => {
      const mainCanvas = canvasRef.current;
      const loupeCanvas = loupeCanvasRef.current;
      if (!mainCanvas || !loupeCanvas) return;

      const mainCtx = mainCanvas.getContext("2d", { willReadFrequently: true });
      const loupeCtx = loupeCanvas.getContext("2d");
      if (!mainCtx || !loupeCtx) return;

      const sampleGrid = 11; // 11x11 grid of pixels
      const half = Math.floor(sampleGrid / 2);
      const cellSize = loupeCanvas.width / sampleGrid;

      loupeCtx.imageSmoothingEnabled = false;
      loupeCtx.clearRect(0, 0, loupeCanvas.width, loupeCanvas.height);

      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const px = canvasX + dx;
          const py = canvasY + dy;

          const destX = (dx + half) * cellSize;
          const destY = (dy + half) * cellSize;

          if (px >= 0 && px < mainCanvas.width && py >= 0 && py < mainCanvas.height) {
            const pixel = mainCtx.getImageData(px, py, 1, 1).data;
            loupeCtx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
          } else {
            // Checkered background outside canvas boundaries
            loupeCtx.fillStyle = (dx + dy) % 2 === 0 ? "#E4E0D8" : "#FAFAF8";
          }
          loupeCtx.fillRect(destX, destY, cellSize, cellSize);

          // Subtle pixel boundary grid line
          loupeCtx.strokeStyle = "rgba(0,0,0,0.12)";
          loupeCtx.lineWidth = 0.5;
          loupeCtx.strokeRect(destX, destY, cellSize, cellSize);
        }
      }

      // Center Pixel Target Reticle
      const centerDestX = half * cellSize;
      const centerDestY = half * cellSize;

      // Outer White Reticle
      loupeCtx.strokeStyle = "#FFFFFF";
      loupeCtx.lineWidth = 2.5;
      loupeCtx.strokeRect(centerDestX - 1, centerDestY - 1, cellSize + 2, cellSize + 2);

      // Inner Dark Reticle
      loupeCtx.strokeStyle = "#000000";
      loupeCtx.lineWidth = 1;
      loupeCtx.strokeRect(centerDestX, centerDestY, cellSize, cellSize);
    },
    []
  );

  // Coordinate Calculation Helper
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const canvasX = Math.floor((clientX - rect.left) * scaleX);
      const canvasY = Math.floor((clientY - rect.top) * scaleY);

      if (canvasX < 0 || canvasX >= canvas.width || canvasY < 0 || canvasY >= canvas.height) {
        return null;
      }
      return { canvasX, canvasY };
    },
    []
  );

  // Canvas Mouse Move & Loupe Tracker
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    if (!coords) {
      setLoupe((l) => ({ ...l, visible: false }));
      setHoveredColor(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const sample = samplePixelColor(ctx, coords.canvasX, coords.canvasY, canvas.width, canvas.height, sampleSize);

    setHoveredColor({
      hex: sample.hex,
      r: sample.r,
      g: sample.g,
      b: sample.b,
      x: coords.canvasX,
      y: coords.canvasY,
    });

    setLoupe({
      visible: true,
      clientX: e.clientX,
      clientY: e.clientY,
      canvasX: coords.canvasX,
      canvasY: coords.canvasY,
      colorHex: sample.hex,
      r: sample.r,
      g: sample.g,
      b: sample.b,
    });

    drawLoupeMagnifier(coords.canvasX, coords.canvasY);

    // If currently dragging the pin, update pin position and commit color in real-time
    if (isDraggingPin) {
      setPin({
        x: coords.canvasX,
        y: coords.canvasY,
        colorHex: sample.hex,
        visible: true,
      });
      setHex(sample.hex);
      setHexError("");
      commitColor(sample.hex);
    }
  };

  const handleCanvasMouseLeave = () => {
    if (!isDraggingPin) {
      setLoupe((l) => ({ ...l, visible: false }));
      setHoveredColor(null);
    }
  };

  // Canvas Click: Drop Pin & Sample Color
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const sample = samplePixelColor(ctx, coords.canvasX, coords.canvasY, canvas.width, canvas.height, sampleSize);

    setPin({
      x: coords.canvasX,
      y: coords.canvasY,
      colorHex: sample.hex,
      visible: true,
    });

    setHex(sample.hex);
    setHexError("");
    commitColor(sample.hex);

    // Add to Picked Colors strip (avoid immediate duplicate)
    setImagePickedColors((prev) => {
      if (prev[0] === sample.hex) return prev;
      return [sample.hex, ...prev.filter((c) => c !== sample.hex)].slice(0, 16);
    });
  };

  // Mobile Touch Support: Touch & Drag to Sample Color without page scrolling
  const handleCanvasTouch = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const sample = samplePixelColor(ctx, coords.canvasX, coords.canvasY, canvas.width, canvas.height, sampleSize);

    setPin({
      x: coords.canvasX,
      y: coords.canvasY,
      colorHex: sample.hex,
      visible: true,
    });

    setHex(sample.hex);
    setHexError("");
    commitColor(sample.hex);

    setHoveredColor({
      hex: sample.hex,
      r: sample.r,
      g: sample.g,
      b: sample.b,
      x: coords.canvasX,
      y: coords.canvasY,
    });

    setLoupe({
      visible: true,
      clientX: touch.clientX,
      clientY: touch.clientY,
      canvasX: coords.canvasX,
      canvasY: coords.canvasY,
      colorHex: sample.hex,
      r: sample.r,
      g: sample.g,
      b: sample.b,
    });

    drawLoupeMagnifier(coords.canvasX, coords.canvasY);
  }, [commitColor, drawLoupeMagnifier, getCanvasCoordinates, sampleSize]);

  const handleCanvasTouchEnd = useCallback(() => {
    setIsDraggingPin(false);
    setLoupe((l) => ({ ...l, visible: false }));
    // Commit to picked history when user releases touch
    setPin((currentPin) => {
      if (currentPin.colorHex) {
        setImagePickedColors((prev) => {
          if (prev[0] === currentPin.colorHex) return prev;
          return [currentPin.colorHex, ...prev.filter((c) => c !== currentPin.colorHex)].slice(0, 16);
        });
      }
      return currentPin;
    });
  }, []);

  // Prevent mobile gesture scrolling while touching/dragging inside image canvas viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas) return;

    const preventTouchScroll = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    canvas.addEventListener("touchstart", preventTouchScroll, { passive: false });
    canvas.addEventListener("touchmove", preventTouchScroll, { passive: false });
    if (viewport) {
      viewport.addEventListener("touchmove", preventTouchScroll, { passive: false });
    }

    return () => {
      canvas.removeEventListener("touchstart", preventTouchScroll);
      canvas.removeEventListener("touchmove", preventTouchScroll);
      if (viewport) {
        viewport.removeEventListener("touchmove", preventTouchScroll);
      }
    };
  }, [imageSrc]);

  // Zoom Controls
  const handleZoomIn = () => setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100));
  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Load Image From Web URL
  const handleLoadUrl = () => {
    if (!urlInput.trim()) return;
    setImageLoading(true);
    setUrlError("");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageSrc(urlInput.trim());
      setImageFileName("web-image");
      setShowUrlModal(false);
      setUrlInput("");
      setImageLoading(false);
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
    };
    img.onerror = () => {
      setImageLoading(false);
      setUrlError("Unable to load image from URL. Ensure the URL is direct, valid, and permits CORS.");
    };
    img.src = urlInput.trim();
  };

  // WCAG Contrast
  const wcag = useMemo(() => {
    const ratio = contrastRatio(rgb, compareRgb);
    return {
      ratio: Math.round(ratio * 100) / 100,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  }, [rgb, compareRgb]);

  // Color Blindness Simulation
  const cvdSimulations = useMemo(() => {
    return [
      {
        id: "protanopia" as const,
        name: "Protanopia",
        desc: "Red-Blind (~1% males)",
        rgb: simulateCvd(rgb.r, rgb.g, rgb.b, "protanopia"),
      },
      {
        id: "deuteranopia" as const,
        name: "Deuteranopia",
        desc: "Green-Blind (~5% males)",
        rgb: simulateCvd(rgb.r, rgb.g, rgb.b, "deuteranopia"),
      },
      {
        id: "tritanopia" as const,
        name: "Tritanopia",
        desc: "Blue-Blind (Rare)",
        rgb: simulateCvd(rgb.r, rgb.g, rgb.b, "tritanopia"),
      },
      {
        id: "achromatopsia" as const,
        name: "Achromatopsia",
        desc: "Monochromacy (Total)",
        rgb: simulateCvd(rgb.r, rgb.g, rgb.b, "achromatopsia"),
      },
    ].map((item) => ({
      ...item,
      hex: rgbToHex(item.rgb.r, item.rgb.g, item.rgb.b),
    }));
  }, [rgb]);

  // Harmonious Palettes
  const palettes = useMemo(() => {
    const complementary = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
    const analogous1 = hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l);
    const analogous2 = hslToRgb((hsl.h + 330) % 360, hsl.s, hsl.l);
    const triadic1 = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l);
    const triadic2 = hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l);
    const tetradic1 = hslToRgb((hsl.h + 90) % 360, hsl.s, hsl.l);
    const tetradic2 = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
    const tetradic3 = hslToRgb((hsl.h + 270) % 360, hsl.s, hsl.l);

    const tints = [95, 85, 75, 65, 55].map((l) => hslToRgb(hsl.h, hsl.s, l));
    const shades = [45, 35, 25, 15, 8].map((l) => hslToRgb(hsl.h, hsl.s, l));

    return {
      complementary: [safeHex, rgbToHex(complementary.r, complementary.g, complementary.b)],
      analogous: [
        rgbToHex(analogous2.r, analogous2.g, analogous2.b),
        safeHex,
        rgbToHex(analogous1.r, analogous1.g, analogous1.b),
      ],
      triadic: [
        safeHex,
        rgbToHex(triadic1.r, triadic1.g, triadic1.b),
        rgbToHex(triadic2.r, triadic2.g, triadic2.b),
      ],
      tetradic: [
        safeHex,
        rgbToHex(tetradic1.r, tetradic1.g, tetradic1.b),
        rgbToHex(tetradic2.r, tetradic2.g, tetradic2.b),
        rgbToHex(tetradic3.r, tetradic3.g, tetradic3.b),
      ],
      tints: tints.map((t) => rgbToHex(t.r, t.g, t.b)),
      shades: shades.map((s) => rgbToHex(s.r, s.g, s.b)),
    };
  }, [hsl.h, hsl.s, hsl.l, safeHex]);

  const currentPaletteColors = palettes[activePaletteTab] || palettes.complementary;

  // Formats Display
  const formats = useMemo(
    () => [
      { label: "HEX", value: safeHex },
      { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
      { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      { label: "HSV / HSB", value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
      { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
      { label: "CIELAB", value: `lab(${lab.l}% ${lab.a} ${lab.b})` },
      { label: "CSS Variable", value: `--color-primary: ${safeHex};` },
    ],
    [safeHex, rgb, hsl, hsv, cmyk, lab]
  );

  // Generate Export Code Snippets
  const exportCode = useMemo(() => {
    if (exportFormat === "css") {
      return `:root {\n  --color-base: ${safeHex};\n${currentPaletteColors
        .map((c, i) => `  --color-${activePaletteTab}-${i + 1}: ${c};`)
        .join("\n")}\n}`;
    }
    if (exportFormat === "tailwind") {
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        brand: {\n          base: '${safeHex}',\n${currentPaletteColors
        .map((c, i) => `          '${(i + 1) * 100}': '${c}',`)
        .join("\n")}\n        },\n      },\n    },\n  },\n};`;
    }
    if (exportFormat === "json") {
      return JSON.stringify(
        {
          name: `${activePaletteTab.toUpperCase()} Palette`,
          baseColor: safeHex,
          palette: currentPaletteColors,
        },
        null,
        2
      );
    }
    if (exportFormat === "scss") {
      return `$color-base: ${safeHex};\n${currentPaletteColors
        .map((c, i) => `$color-${activePaletteTab}-${i + 1}: ${c};`)
        .join("\n")}`;
    }
    return "";
  }, [exportFormat, safeHex, currentPaletteColors, activePaletteTab]);

  return (
    <div className="space-y-6">
      {/* Top Main Navigation Bar: Workspace Switcher + Action Hub */}
      <div className="flex flex-col gap-2 p-2 sm:p-2.5 bg-[#FAFAF8] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl shadow-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        {/* Workspace Mode Tabs — 50/50 segmented on mobile, flex-auto on desktop */}
        <div className="grid grid-cols-2 w-full sm:w-auto sm:flex sm:items-center gap-1.5 p-1 bg-white dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] rounded-xl">
          <button
            type="button"
            onClick={() => setWorkspaceMode("mixer")}
            className={`min-h-[40px] px-2.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              workspaceMode === "mixer"
                ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] shadow-sm"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
          >
            <Sliders size={15} className="shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Mixer</span>
              <span className="hidden sm:inline">Mixer &amp; Harmonies</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceMode("image")}
            className={`min-h-[40px] px-2.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              workspaceMode === "image"
                ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] shadow-sm"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
          >
            <ImageIcon size={15} className="shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">From Image</span>
              <span className="hidden sm:inline">Image Eyedropper</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-[#F5A623] text-white dark:bg-[#1F2544] dark:text-[#F5A623] shrink-0 leading-none">
              Pro
            </span>
          </button>
        </div>

        {/* Quick Utility Tools — balanced 50/50 on mobile, flex on desktop */}
        <div className={`grid ${hasEyeDropper ? "grid-cols-2" : "grid-cols-1"} sm:flex sm:items-center gap-2 w-full sm:w-auto`}>
          {hasEyeDropper && (
            <button
              type="button"
              onClick={pickFromScreen}
              className="min-h-[40px] px-3 py-2 rounded-xl bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold hover:border-[#F5A623] transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              title="Pick any pixel color from anywhere on your display"
            >
              <Pipette size={15} className="text-[#F5A623] shrink-0" />
              <span className="truncate">Screen Pick</span>
            </button>
          )}

          {/* Active Color Preview Badge */}
          <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] shadow-2xs min-h-[40px]">
            <span
              className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
              style={{ backgroundColor: safeHex }}
            />
            <span className="text-xs font-mono font-bold text-[#18181B] dark:text-[#F4F4F5] tracking-wide">
              {safeHex}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKSPACE 1: REAL-WORLD IMAGE EYEDROPPER WORKSTATION                     */}
      {/* Keep always mounted (never unmount) so the canvas retains its drawn      */}
      {/* image across tab switches. We show/hide with CSS only.                   */}
      {/* ========================================================================= */}
      <div className={workspaceMode === "image" ? "space-y-5 animate-in fade-in duration-200" : "hidden"}>
          {/* Workstation Top Bar: Image Source & Canvas Controls */}
          <div className="flex flex-col gap-3 p-3 sm:p-4 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl shadow-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            {/* Left: Title & file name */}
            <div className="flex items-center gap-2 min-w-0">
              <Pipette size={18} className="text-[#F5A623] shrink-0" />
              <span className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] truncate">
                Image Eyedropper
              </span>
              {imageSrc && imageFileName && (
                <span className="text-xs text-[#71717A] truncate max-w-[120px] sm:max-w-[180px] font-medium">
                  — {imageFileName}
                </span>
              )}
              {imageSrc && (
                <AnimatedTrashButton
                  onDelete={() => {
                    setImageSrc(null);
                    setDominantColors([]);
                    prevLoadedImageRef.current = null;
                  }}
                  iconSize={15}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                  title="Remove Image"
                />
              )}
            </div>

            {/* Right: Controls row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sample Size Filter (1x1, 3x3, 5x5) */}
              <div className="flex items-center gap-1 bg-[#FAFAF8] dark:bg-[#1E2338] p-1 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48]">
                <span className="text-[10px] font-bold text-[#71717A] px-1 uppercase hidden xs:block">Sample:</span>
                {([1, 3, 5] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSampleSize(sz)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer min-h-[32px] ${
                      sampleSize === sz
                        ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E]"
                        : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                    title={sz === 1 ? "Exact single pixel" : `${sz}x${sz} average smoothing`}
                  >
                    {sz}×{sz}
                  </button>
                ))}
              </div>

              {/* Zoom Controls — only when image loaded */}
              {imageSrc && (
                <div className="flex items-center gap-1 bg-[#FAFAF8] dark:bg-[#1E2338] p-1 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48]">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-white dark:hover:bg-[#141829] transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-[#18181B] dark:text-[#F4F4F5] px-1 min-w-[36px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-white dark:hover:bg-[#141829] transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                  {zoom !== 1 && (
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors cursor-pointer"
                      title="Reset Zoom to 100%"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Upload & URL Buttons */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/svg+xml,image/avif,.svg,.png,.jpg,.jpeg,.webp,.avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#F5A623] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload size={14} className="text-[#F5A623]" />
                <span>Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUrlModal(true)}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#F5A623] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Link2 size={14} className="text-[#71717A]" />
                <span>From URL</span>
              </button>
            </div>
          </div>

          {/* Image Drop-Zone or Empty State (If no image is loaded) */}
          {!imageSrc && (
            <div className="space-y-6">
              <ImageDropzone
                multiple={false}
                onFilesSelected={(files) => {
                  if (files && files[0]) handleImageFile(files[0]);
                }}
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/svg+xml,image/avif,.svg,.png,.jpg,.jpeg,.webp,.avif"
                description="Supports PNG, JPG, WebP, SVG, GIF, AVIF • Or press Ctrl+V anywhere to paste"
                className="hover:border-[#F5A623] focus:ring-[#F5A623]/40"
              />

              {/* Sample Presets to try immediately */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
                    <PhotoPresetsIcon className="w-4 h-4 text-[#F5A623]" /> Try with Instant Sample Images
                  </span>
                  <span className="text-[11px] text-[#71717A]">One-click to test the eyedropper</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SAMPLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setImageSrc(preset.dataUri);
                        setImageFileName(`${preset.id}.webp`);
                        setZoom(1);
                        setPanOffset({ x: 0, y: 0 });
                      }}
                      className="group p-3 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] hover:border-[#F5A623] transition-all text-left shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                    >
                      <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-black/5 relative mb-2.5">
                        <img
                          src={preset.dataUri}
                          alt={preset.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] group-hover:text-[#F5A623] transition-colors">
                            {preset.title}
                          </span>
                          <span className="text-[10px] text-[#71717A] font-medium">{preset.tag}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          {preset.colors.map((c, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Workstation Canvas & Loupe */}
          {imageSrc && (
            <div ref={canvasWrapRef} className="space-y-4 scroll-mt-20">
              {/* Live Image Viewport with Draggable Reticle Pin & Loupe */}
              <div
                ref={viewportRef}
                className="relative overflow-hidden rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[repeating-conic-gradient(#E4E0D8_0_90deg,#FAFAF8_0_180deg)_0_0/16px_16px] dark:bg-[repeating-conic-gradient(#1E2338_0_90deg,#141829_0_180deg)_0_0/16px_16px] min-h-[190px] sm:min-h-[380px] max-h-[620px] flex items-center justify-center p-2 sm:p-3 cursor-crosshair select-none touch-none"
                style={{ touchAction: "none" }}
              >
                <div
                  className="relative transition-transform duration-75 origin-center inline-block touch-none"
                  style={{
                    transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                    touchAction: "none",
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={handleCanvasMouseLeave}
                    onClick={handleCanvasClick}
                    onTouchStart={handleCanvasTouch}
                    onTouchMove={handleCanvasTouch}
                    onTouchEnd={handleCanvasTouchEnd}
                    onTouchCancel={handleCanvasTouchEnd}
                    className="max-w-full h-auto rounded-xl shadow-lg block touch-none select-none"
                    style={{ touchAction: "none" }}
                  />

                  {/* Interactive Pin Marker on Canvas Coordinates */}
                  {pin.visible && canvasRef.current && (
                    <div
                      className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-grab active:cursor-grabbing group/pin touch-none select-none"
                      style={{
                        left: `${(pin.x / canvasRef.current.width) * 100}%`,
                        top: `${(pin.y / canvasRef.current.height) * 100}%`,
                        touchAction: "none",
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDraggingPin(true);
                        const handleGlobalMouseUp = () => {
                          setIsDraggingPin(false);
                          window.removeEventListener("mouseup", handleGlobalMouseUp);
                        };
                        window.addEventListener("mouseup", handleGlobalMouseUp);
                      }}
                      onTouchStart={handleCanvasTouch}
                      onTouchMove={handleCanvasTouch}
                      onTouchEnd={handleCanvasTouchEnd}
                      onTouchCancel={handleCanvasTouchEnd}
                      title="Drag to inspect or move pin"
                    >
                      {/* Outer pulsing beacon ring */}
                      <span
                        className="absolute -inset-3 rounded-full animate-ping opacity-30 pointer-events-none"
                        style={{ backgroundColor: pin.colorHex }}
                      />

                      {/* Reticle Target Circle */}
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-black shadow-xl flex items-center justify-center bg-black/40 backdrop-blur-xs relative ring-2 ring-black/40">
                        <span
                          className="w-4 h-4 rounded-full border border-white shrink-0 shadow-inner"
                          style={{ backgroundColor: pin.colorHex }}
                        />
                        <Crosshair size={12} className="absolute text-white/90 pointer-events-none" />
                      </div>

                      {/* Tooltip Tag */}
                      <div className="absolute left-1/2 -bottom-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 text-white text-[10px] font-mono font-bold shadow-md whitespace-nowrap backdrop-blur-xs border border-white/20 pointer-events-none">
                        {pin.colorHex}
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Loupe Magnifier HUD (Follows cursor) */}
                {loupe.visible && (
                  <div
                    className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-[115px] sm:-translate-y-[145px] flex flex-col items-center"
                    style={{ left: `${loupe.clientX}px`, top: `${loupe.clientY}px` }}
                  >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-3 sm:border-4 border-white dark:border-[#141829] shadow-2xl overflow-hidden bg-black relative ring-2 ring-[#F5A623]">
                      <canvas
                        ref={loupeCanvasRef}
                        width={128}
                        height={128}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="mt-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/90 text-white text-[10px] sm:text-[11px] font-mono font-bold flex items-center gap-1.5 sm:gap-2 shadow-xl backdrop-blur-md border border-white/20">
                      <span
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-white shrink-0 inline-block shadow-xs"
                        style={{ backgroundColor: loupe.colorHex }}
                      />
                      <span>{loupe.colorHex}</span>
                      <span className="text-[9px] sm:text-[10px] text-white/60 font-sans">
                        ({loupe.canvasX}, {loupe.canvasY})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Inspector Status HUD Bar: Real-time information on Hovered & Selected Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl shadow-xs">
                {/* Selected Color Badge */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338]">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white dark:border-[#2A2F48] shrink-0 shadow-sm"
                    style={{ backgroundColor: pin.colorHex }}
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                      Selected Pixel
                    </span>
                    <span className="text-sm font-mono font-bold text-[#18181B] dark:text-[#F4F4F5] block truncate">
                      {pin.colorHex}
                    </span>
                    <span className="text-[10px] text-[#71717A] font-mono">
                      X: {pin.x}px • Y: {pin.y}px
                    </span>
                  </div>
                </div>

                {/* Hovered Pixel (Live Tracker) */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338]">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white dark:border-[#2A2F48] shrink-0 shadow-sm transition-colors"
                    style={{ backgroundColor: hoveredColor ? hoveredColor.hex : pin.colorHex }}
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                      Hovered Color
                    </span>
                    <span className="text-sm font-mono font-bold text-[#18181B] dark:text-[#F4F4F5] block truncate">
                      {hoveredColor ? hoveredColor.hex : pin.colorHex}
                    </span>
                    <span className="text-[10px] text-[#71717A] font-mono">
                      {hoveredColor ? `X: ${hoveredColor.x} • Y: ${hoveredColor.y}` : "Hover image to inspect"}
                    </span>
                  </div>
                </div>

                {/* WCAG Contrast Tag on Black/White */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338]">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                      Text Contrast
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ backgroundColor: safeHex, color: "#000000" }}
                      >
                        Black
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ backgroundColor: safeHex, color: "#FFFFFF" }}
                      >
                        White
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#18181B] dark:text-[#F4F4F5]">
                    {wcag.ratio}:1
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => copyValue("HEX-SELECTED", pin.colorHex)}
                    className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copied === "HEX-SELECTED" ? (
                      <>
                        <Check size={14} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy HEX
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkspaceMode("mixer")}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#F5A623] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Open this color in Harmonies & Sliders Mixer"
                  >
                    <span>Fine-tune</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Extracted Dominant Color Palette (Auto Image Quantization) */}
              {dominantColors.length > 0 && (
                <div className="p-4 sm:p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SwatchDeckIcon className="w-4 h-4 text-[#F5A623]" />
                      <h4 className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider">
                        Dominant Colors Extracted from Image
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#71717A]">
                      Click any swatch to apply as active color
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                    {dominantColors.map((item, idx) => (
                      <button
                        key={`${item.hex}-${idx}`}
                        type="button"
                        onClick={() => {
                          setHex(item.hex);
                          setHexError("");
                          commitColor(item.hex);
                        }}
                        className={`group p-2 rounded-xl border text-left transition-all hover:scale-105 cursor-pointer shadow-2xs ${
                          item.hex.toUpperCase() === safeHex
                            ? "border-[#F5A623] ring-2 ring-[#F5A623]/30 bg-[#F5A623]/5"
                            : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338]"
                        }`}
                      >
                        <div
                          className="h-10 w-full rounded-lg border border-black/10 shadow-2xs mb-1.5"
                          style={{ backgroundColor: item.hex }}
                        />
                        <span className="font-mono text-[11px] font-bold text-[#18181B] dark:text-[#F4F4F5] block truncate group-hover:text-[#F5A623] transition-colors">
                          {item.hex}
                        </span>
                        <span className="text-[10px] text-[#71717A] block">
                          {item.percentage}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* "Colors Picked from this Image" Swatches History */}
              {imagePickedColors.length > 0 && (
                <div className="p-4 sm:p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette size={16} className="text-[#F5A623]" />
                      <h4 className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider">
                        Colors Picked from Image ({imagePickedColors.length})
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(imagePickedColors.join(", "));
                          setCopied("ALL_PICKED");
                          setTimeout(() => setCopied(""), 1600);
                        }}
                        className="text-[11px] font-bold text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copied === "ALL_PICKED" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        <span>Copy All</span>
                      </button>
                      <span className="text-[#E4E0D8] dark:text-[#2A2F48]">•</span>
                      <AnimatedTrashButton
                        onDelete={() => setImagePickedColors([])}
                        iconSize={12}
                        className="text-[11px] text-[#71717A] hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Clear picked colors"
                      >
                        <span>Clear</span>
                      </AnimatedTrashButton>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {imagePickedColors.map((color, idx) => (
                      <div
                        key={`${color}-${idx}`}
                        className={`flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-xl border transition-all ${
                          color.toUpperCase() === safeHex
                            ? "border-[#F5A623] bg-[#F5A623]/10 ring-2 ring-[#F5A623]/20"
                            : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setHex(color);
                            setHexError("");
                            commitColor(color);
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                          title="Select this color"
                        >
                          <span
                            className="w-5 h-5 rounded-lg border border-black/15 shadow-2xs"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-mono text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                            {color}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyValue(`PICK-${idx}`, color)}
                          className="p-1 text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors cursor-pointer"
                          title="Copy HEX"
                        >
                          {copied === `PICK-${idx}` ? (
                            <Check size={12} className="text-emerald-500" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Presets Quick Strip when an image is loaded */}
              <div className="p-3 bg-[#FAFAF8] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs font-bold text-[#71717A] flex items-center gap-1.5">
                  <PhotoPresetsIcon className="w-4 h-4 text-[#F5A623]" /> Switch Sample Preset:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {SAMPLE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setImageSrc(p.dataUri);
                        setImageFileName(`${p.id}.webp`);
                        setZoom(1);
                        setPanOffset({ x: 0, y: 0 });
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#F5A623] transition-all cursor-pointer shadow-2xs"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Code Formats Grid for current color */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Active Color Codes &amp; Values
              </span>
              <span className="text-[10px] text-[#71717A]">Click copy icon to copy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {formats.slice(0, 4).map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] hover:border-[#F5A623]/50 transition-colors shadow-2xs min-h-[44px]"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-[#1F2544] dark:text-[#F5A623] uppercase tracking-wider block">
                      {f.label}
                    </span>
                    <p className="text-xs font-mono font-bold text-[#18181B] dark:text-[#F4F4F5] mt-0.5 truncate">
                      {f.value}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(f.label, f.value)}
                    className="p-2 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] transition-colors shrink-0 cursor-pointer"
                    title={`Copy ${f.label}`}
                  >
                    {copied === f.label ? (
                      <Check size={15} className="text-emerald-500" />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
      </div> {/* end WORKSPACE 1 */}

      {/* ========================================================================= */}
      {/* WORKSPACE 2: COLOR MIXER, SLIDERS, HARMONIES & WCAG                      */}
      {/* ========================================================================= */}
      {/* Also always mounted — CSS-only toggling so Mixer state (sliders, tabs)  */}
      {/* is never lost when switching to Image tab and back.                      */}
      {/* ========================================================================= */}
      <div className={workspaceMode === "mixer" ? "space-y-6 animate-in fade-in duration-200" : "hidden"}>
          {/* Main Interactive Workstation: Color Preview & Dual Channel Sliders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Color Big Swatch + Direct Color Picker */}
            <div className="lg:col-span-4 space-y-4">
              <div
                className="w-full h-52 sm:h-56 rounded-2xl border-2 border-[#E4E0D8] dark:border-[#1E2338] shadow-inner relative overflow-hidden group transition-all duration-200"
                style={{ backgroundColor: safeHex }}
              >
                <input
                  type="color"
                  value={safeHex}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setHex(val);
                    setHexError("");
                    commitColor(val);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Native color picker input"
                />
                <div className="absolute top-3 left-3 bg-black/50 text-white backdrop-blur-md rounded-xl px-2.5 py-1 text-xs font-mono font-bold">
                  {safeHex}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] shadow-xs flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                  <Pipette size={14} className="text-[#F5A623]" />
                  <span>Click to Open Native Palette</span>
                </div>
              </div>

              {/* Direct HEX Input Box */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-[#71717A] tracking-wider">
                  HEX Color Value
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    onKeyDown={handleHexKeyDown}
                    maxLength={7}
                    placeholder="#F5A623"
                    className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] font-mono text-sm font-bold focus:outline-none focus:ring-2 ${
                      hexError
                        ? "border-red-400 dark:border-red-600 focus:ring-red-400/40"
                        : "border-[#E4E0D8] dark:border-[#1E2338] focus:ring-[#F5A623]/40"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => copyValue("HEX-INPUT", safeHex)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] transition-colors cursor-pointer"
                    title="Copy HEX"
                  >
                    {copied === "HEX-INPUT" ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                {hexError ? (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium">{hexError}</p>
                ) : (
                  <p className="text-[11px] text-[#71717A]">Tip: Use ↑ / ↓ arrow keys to adjust brightness</p>
                )}
              </div>

              {/* Recent Colors Row */}
              {recentColors.length > 0 && (
                <div className="p-3 bg-[#FAFAF8] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                      Recent Colors ({recentColors.length})
                    </span>
                    <AnimatedTrashButton
                      onDelete={clearRecentColors}
                      iconSize={11}
                      className="text-[10px] text-[#71717A] hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Clear recent colors"
                    >
                      <span>Clear</span>
                    </AnimatedTrashButton>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {recentColors.map((rColor, idx) => (
                      <button
                        key={`${rColor}-${idx}`}
                        type="button"
                        onClick={() => {
                          setHex(rColor);
                          setHexError("");
                          commitColor(rColor);
                        }}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 transition-transform hover:scale-110 cursor-pointer shadow-2xs relative ${
                          rColor.toUpperCase() === safeHex
                            ? "border-[#F5A623] scale-105 ring-2 ring-[#F5A623]/30"
                            : "border-[#E4E0D8] dark:border-[#2A2F48]"
                        }`}
                        style={{ backgroundColor: rColor }}
                        title={`Click to reload ${rColor}`}
                        aria-label={`Select recent color ${rColor}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sliders (HSL + RGB) with Dynamic Live Gradient Tracks */}
            <div className="lg:col-span-8 space-y-4">
              {/* HSL Channels */}
              <div className="p-4 sm:p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-2">
                  <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={14} className="text-[#F5A623]" /> HSL Channels (Hue, Saturation, Lightness)
                  </span>
                  <span className="text-[10px] text-[#71717A]">Keyboard: Arrows (±1), Shift+Arrows (±10)</span>
                </div>

                <div className="space-y-3.5">
                  {/* Hue Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#71717A]">H (Hue: 0°–360°)</label>
                      <input
                        type="number"
                        min={0}
                        max={360}
                        value={hsl.h}
                        onChange={(e) => updateFromHsl("h", parseInt(e.target.value, 10) || 0)}
                        onKeyDown={(e) => handleSliderKeyDown(e, "hsl", "h")}
                        className="w-16 min-h-[32px] text-center text-xs font-mono font-bold rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] focus:ring-2 focus:ring-[#F5A623]/40"
                        aria-label="Hue value"
                      />
                    </div>
                    <div className="relative py-2 flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={hsl.h}
                        onChange={(e) => updateFromHsl("h", parseInt(e.target.value, 10))}
                        onKeyDown={(e) => handleSliderKeyDown(e, "hsl", "h")}
                        className="w-full h-3 rounded-full appearance-none cursor-pointer accent-[#1F2544] dark:accent-white shadow-inner"
                        style={{
                          background:
                            "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                        }}
                        aria-label="Hue slider"
                      />
                    </div>
                  </div>

                  {/* Saturation Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#71717A]">S (Saturation: 0%–100%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={hsl.s}
                        onChange={(e) => updateFromHsl("s", parseInt(e.target.value, 10) || 0)}
                        onKeyDown={(e) => handleSliderKeyDown(e, "hsl", "s")}
                        className="w-16 min-h-[32px] text-center text-xs font-mono font-bold rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] focus:ring-2 focus:ring-[#F5A623]/40"
                        aria-label="Saturation value"
                      />
                    </div>
                    <div className="relative py-2 flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={hsl.s}
                        onChange={(e) => updateFromHsl("s", parseInt(e.target.value, 10))}
                        onKeyDown={(e) => handleSliderKeyDown(e, "hsl", "s")}
                        className="w-full h-3 rounded-full appearance-none cursor-pointer accent-[#1F2544] dark:accent-white shadow-inner"
                        style={{
                          background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`,
                        }}
                        aria-label="Saturation slider"
                      />
                    </div>
                  </div>

                  {/* Lightness Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#71717A]">L (Lightness: 0%–100%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={hsl.l}
                        onChange={(e) => updateFromHsl("l", parseInt(e.target.value, 10) || 0)}
                        onKeyDown={(e) => handleSliderKeyDown(e, "hsl", "l")}
                        className="w-16 min-h-[32px] text-center text-xs font-mono font-bold rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] focus:ring-2 focus:ring-[#F5A623]/40"
                        aria-label="Lightness value"
                      />
                    </div>
                    <div className="relative py-2 flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={hsl.l}
                        onChange={(e) => updateFromHsl("l", parseInt(e.target.value, 10))}
                        onKeyDown={(e) => handleSliderKeyDown(e, "hsl", "l")}
                        className="w-full h-3 rounded-full appearance-none cursor-pointer accent-[#1F2544] dark:accent-white shadow-inner"
                        style={{
                          background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`,
                        }}
                        aria-label="Lightness slider"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RGB Sliders with Dynamic Live Gradients */}
              <div className="p-4 sm:p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-2">
                  <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-[#F5A623]" /> RGB Channels (Red, Green, Blue)
                  </span>
                  <span className="text-[10px] text-[#71717A]">0 – 255</span>
                </div>

                <div className="space-y-3.5">
                  {(["r", "g", "b"] as const).map((ch) => {
                    const labelName = ch === "r" ? "Red" : ch === "g" ? "Green" : "Blue";
                    const startRgb = rgbToHex(
                      ...(Object.values({ ...rgb, [ch]: 0 }) as [number, number, number])
                    );
                    const endRgb = rgbToHex(
                      ...(Object.values({ ...rgb, [ch]: 255 }) as [number, number, number])
                    );

                    return (
                      <div key={ch} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase text-[#71717A] tracking-wider">
                            {ch.toUpperCase()} ({labelName})
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={255}
                            value={rgb[ch]}
                            onChange={(e) => updateFromRgb(ch, parseInt(e.target.value, 10) || 0)}
                            onKeyDown={(e) => handleSliderKeyDown(e, "rgb", ch)}
                            className="w-16 min-h-[32px] text-center text-xs font-mono font-bold rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] focus:ring-2 focus:ring-[#F5A623]/40"
                            aria-label={`${labelName} value`}
                          />
                        </div>
                        <div className="relative py-2 flex items-center">
                          <input
                            type="range"
                            min={0}
                            max={255}
                            value={rgb[ch]}
                            onChange={(e) => updateFromRgb(ch, parseInt(e.target.value, 10))}
                            onKeyDown={(e) => handleSliderKeyDown(e, "rgb", ch)}
                            className="w-full h-3 rounded-full appearance-none cursor-pointer accent-[#1F2544] dark:accent-white shadow-inner"
                            style={{
                              background: `linear-gradient(to right, ${startRgb}, ${endRgb})`,
                            }}
                            aria-label={`${labelName} slider`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Formats Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Color Formats &amp; Conversions
              </span>
              <span className="text-[10px] text-[#71717A]">Click copy icon to copy to clipboard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {formats.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] hover:border-[#F5A623]/50 transition-colors shadow-2xs min-h-[44px]"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-[#1F2544] dark:text-[#F5A623] uppercase tracking-wider block">
                      {f.label}
                    </span>
                    <p className="text-xs font-mono font-bold text-[#18181B] dark:text-[#F4F4F5] mt-0.5 truncate">
                      {f.value}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(f.label, f.value)}
                    className="p-2.5 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-white dark:hover:bg-[#1E2338] transition-colors shrink-0 cursor-pointer"
                    title={`Copy ${f.label}`}
                    aria-label={`Copy ${f.label} value`}
                  >
                    {copied === f.label ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Harmonious Palettes Generator */}
          <div className="p-5 sm:p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E0D8] dark:border-[#1E2338] pb-4">
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-[#F5A623]" />
                <h3 className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5]">
                  Harmonious Palettes
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold hover:bg-[#F0EDE8] dark:hover:bg-[#2A2F48] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
                title="Export palette as CSS, Tailwind, JSON, or SCSS"
              >
                <Code2 size={15} className="text-[#F5A623]" />
                <span>Export Palette</span>
              </button>
            </div>

            {/* Palette Tab Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {(
                [
                  { id: "complementary", label: "Complementary" },
                  { id: "analogous", label: "Analogous" },
                  { id: "triadic", label: "Triadic" },
                  { id: "tetradic", label: "Tetradic (Square)" },
                  { id: "tints", label: "Tints (Lighter)" },
                  { id: "shades", label: "Shades (Darker)" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePaletteTab(tab.id)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activePaletteTab === tab.id
                      ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] shadow-sm"
                      : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] border border-transparent hover:border-[#E4E0D8] dark:hover:border-[#2A2F48]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active Palette Swatches */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {currentPaletteColors.map((color, idx) => {
                const isCurrentBase = color.toUpperCase() === safeHex;
                return (
                  <div
                    key={`${activePaletteTab}-${idx}-${color}`}
                    className="flex flex-col rounded-2xl border border-[#E4E0D8] dark:border-[#2A2F48] overflow-hidden bg-[#FAFAF8] dark:bg-[#1E2338]/40 shadow-xs hover:border-[#F5A623] transition-all group"
                  >
                    <div
                      className="h-24 sm:h-28 w-full relative transition-transform"
                      style={{ backgroundColor: color }}
                    >
                      {isCurrentBase && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold backdrop-blur-xs">
                          Base
                        </span>
                      )}
                    </div>

                    <div className="p-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setHex(color);
                          setHexError("");
                          commitColor(color);
                        }}
                        className="text-left font-mono font-bold text-xs text-[#18181B] dark:text-[#F4F4F5] hover:text-[#F5A623] transition-colors cursor-pointer truncate"
                        title={`Click to set ${color} as base color`}
                      >
                        {color}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyValue(`pal-${activePaletteTab}-${idx}`, color)}
                        className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-white dark:hover:bg-[#141829] transition-colors cursor-pointer shrink-0"
                        title="Copy hex code"
                        aria-label={`Copy ${color}`}
                      >
                        {copied === `pal-${activePaletteTab}-${idx}` ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WCAG Contrast Checker & Color Blindness Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* WCAG Contrast Checker */}
            <div className="lg:col-span-6 p-5 sm:p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-3">
                <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={16} className="text-[#F5A623]" /> WCAG Contrast Ratio Checker
                </h4>
                <span className="text-[10px] font-bold text-[#71717A]">WCAG 2.1 Criteria</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#71717A]">Foreground (Text)</label>
                  <div className="flex items-center gap-2 p-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338]">
                    <div
                      className="w-7 h-7 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] shrink-0 shadow-2xs"
                      style={{ backgroundColor: safeHex }}
                    />
                    <span className="text-xs font-mono font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      {safeHex}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#71717A]">Background Color</label>
                  <div className="flex items-center gap-2 p-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338]">
                    <div
                      className="w-7 h-7 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] shrink-0 relative overflow-hidden shadow-2xs"
                      style={{ backgroundColor: safeCompareHex }}
                    >
                      <input
                        type="color"
                        value={safeCompareHex}
                        onChange={(e) => setCompareHex(e.target.value.toUpperCase())}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Compare background color input"
                      />
                    </div>
                    <input
                      type="text"
                      value={compareHex}
                      onChange={(e) => {
                        let c = e.target.value.replace(/[^#0-9a-fA-F]/g, "");
                        if (!c.startsWith("#")) c = "#" + c;
                        setCompareHex(c.slice(0, 7));
                      }}
                      maxLength={7}
                      className="w-full text-xs font-mono font-bold bg-transparent text-[#18181B] dark:text-[#F4F4F5] focus:outline-none"
                      placeholder="#1F2544"
                    />
                  </div>
                </div>
              </div>

              {/* Contrast Preview Box */}
              <div
                className="p-5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] shadow-inner transition-colors"
                style={{ backgroundColor: safeCompareHex }}
              >
                <p className="text-xl sm:text-2xl font-bold" style={{ color: safeHex }}>
                  Sample Headline Aa
                </p>
                <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: safeHex }}>
                  The quick brown fox jumps over the lazy dog. 1234567890
                </p>
              </div>

              {/* Contrast Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-center">
                  <span className="text-[9px] font-bold text-[#71717A] uppercase block">Ratio</span>
                  <span className="text-base font-extrabold text-[#18181B] dark:text-[#F4F4F5]">
                    {wcag.ratio}:1
                  </span>
                </div>
                {[
                  { label: "AA Normal", pass: wcag.aaNormal, req: "4.5:1" },
                  { label: "AA Large", pass: wcag.aaLarge, req: "3.0:1" },
                  { label: "AAA Normal", pass: wcag.aaaNormal, req: "7.0:1" },
                  { label: "AAA Large", pass: wcag.aaaLarge, req: "4.5:1" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className={`p-2 rounded-xl border text-center ${
                      b.pass
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60"
                        : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60"
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase block text-[#71717A]">
                      {b.label}
                    </span>
                    <span
                      className={`text-[11px] font-extrabold block mt-0.5 ${
                        b.pass
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {b.pass ? "✓ PASS" : "✗ FAIL"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Blindness Simulation Preview */}
            <div className="lg:col-span-6 p-5 sm:p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-3">
                <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={16} className="text-[#F5A623]" /> Color Vision Deficiency (CVD) Preview
                </h4>
                <span className="text-[10px] text-[#71717A]">Simulated Perception</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338]/60 border border-[#E4E0D8] dark:border-[#2A2F48]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] shrink-0 shadow-2xs"
                      style={{ backgroundColor: safeHex }}
                    />
                    <div>
                      <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] block">
                        Normal Trichromatic Vision
                      </span>
                      <span className="text-[10px] text-[#71717A]">Standard color perception</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#18181B] dark:text-[#F4F4F5]">
                    {safeHex}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cvdSimulations.map((sim) => (
                    <div
                      key={sim.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338]/60 border border-[#E4E0D8] dark:border-[#2A2F48]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] shrink-0 shadow-2xs"
                          style={{ backgroundColor: sim.hex }}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] truncate block">
                            {sim.name}
                          </span>
                          <span className="text-[9px] text-[#71717A] truncate block">{sim.desc}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#71717A] shrink-0 ml-1">
                        {sim.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* URL Import Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-3">
              <div className="flex items-center gap-2">
                <Link2 size={18} className="text-[#F5A623]" />
                <h3 className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
                  Load Image from Web URL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="p-1.5 rounded-xl text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#71717A]">Image Direct URL</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-mono text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
              />
              {urlError && <p className="text-xs text-rose-500 font-medium">{urlError}</p>}
              <p className="text-[11px] text-[#71717A]">
                Note: Server must allow CORS (Cross-Origin Resource Sharing) to permit canvas pixel sampling.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLoadUrl}
                disabled={!urlInput.trim() || imageLoading}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {imageLoading ? "Loading..." : "Load Image"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dev-Handoff Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-3">
              <div className="flex items-center gap-2">
                <Code2 size={20} className="text-[#F5A623]" />
                <h3 className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5]">
                  Export Palette for Developers
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-xl text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Format Switcher */}
            <div className="flex items-center gap-2">
              {(
                [
                  { id: "css", label: "CSS Variables" },
                  { id: "tailwind", label: "Tailwind CSS" },
                  { id: "json", label: "JSON Array" },
                  { id: "scss", label: "SCSS" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setExportFormat(f.id)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    exportFormat === f.id
                      ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E]"
                      : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Code Snippet Box */}
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-[#0F1221] text-emerald-400 font-mono text-xs overflow-x-auto max-h-64 border border-[#1E2338] leading-relaxed">
                <code>{exportCode}</code>
              </pre>
              <button
                type="button"
                onClick={() => copyValue("EXPORT_SNIPPET", exportCode)}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-xs cursor-pointer"
              >
                {copied === "EXPORT_SNIPPET" ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F0EDE8] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
