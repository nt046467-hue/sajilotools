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
  Share2,
  Download,
  Trash2,
  Sliders,
  X,
  Code2,
  Layers,
  ZoomIn,
  Clipboard,
  RefreshCw,
  Info,
} from "lucide-react";

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
  // sRGB to linear RGB
  const [rLin, gLin, bLin] = [r / 255, g / 255, b / 255].map((v) =>
    v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
  );
  // Linear RGB to XYZ (D65 standard illuminant)
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

const RECENT_COLORS_STORAGE_KEY = "sajilotools_recent_colors";
const MAX_RECENT_COLORS = 10;

type PaletteTab =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "tints"
  | "shades";

export default function ColorPickerTool() {
  const [hex, setHex] = useState("#F5A623");
  const [compareHex, setCompareHex] = useState("#1F2544");
  const [copied, setCopied] = useState("");
  const [hexError, setHexError] = useState("");
  const [activePaletteTab, setActivePaletteTab] = useState<PaletteTab>("complementary");
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"css" | "tailwind" | "json" | "scss">("css");

  // Eyedropper / Image Inspector State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [magnifier, setMagnifier] = useState<{
    visible: boolean;
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
    colorHex: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    canvasX: 0,
    canvasY: 0,
    colorHex: "#000000",
  });

  const [hasEyeDropper, setHasEyeDropper] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize from URL query param & LocalStorage on mount
  useEffect(() => {
    setHasEyeDropper(typeof window !== "undefined" && "EyeDropper" in window);

    // Read URL query parameter
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlHex = params.get("hex") || params.get("color");
      if (urlHex) {
        const clean = (urlHex.startsWith("#") ? urlHex : "#" + urlHex).toUpperCase();
        if (/^#[0-9A-F]{6}$/i.test(clean)) {
          setHex(clean);
        }
      }

      // Read recent colors
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

    // Update URL query param without reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("hex", formatted.replace("#", ""));
      window.history.replaceState({}, "", url.toString());

      // Update Recents
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

  // Sliders Keyboard Handler
  const handleSliderKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "hsl" | "rgb",
    channel: "h" | "s" | "l" | "r" | "g" | "b"
  ) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft") {
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

  const shareLink = useCallback(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("hex", safeHex.replace("#", ""));
      navigator.clipboard.writeText(url.toString());
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  }, [safeHex]);

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
      // User cancelled
    }
  }, [commitColor]);

  // Image Eyedropper & Canvas Inspector
  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageSrc(result);
      setShowImagePicker(true);
      setImageLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  // Listen for Clipboard Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleImageFile]);

  // Render Image on Canvas
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageObjRef.current = img;
      // Calculate responsive dimensions keeping aspect ratio
      const maxWidth = 800;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxWidth) {
        h = (maxWidth / w) * h;
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Canvas Mouse Move & Loupe Magnifier
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const canvasX = Math.floor(clientX * scaleX);
    const canvasY = Math.floor(clientY * scaleY);

    if (canvasX < 0 || canvasX >= canvas.width || canvasY < 0 || canvasY >= canvas.height) {
      setMagnifier((m) => ({ ...m, visible: false }));
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
    const pixelHex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    setMagnifier({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      canvasX,
      canvasY,
      colorHex: pixelHex,
    });

    // Draw magnified pixels to magnifier mini-canvas
    const magCanvas = magnifierCanvasRef.current;
    if (magCanvas) {
      const magCtx = magCanvas.getContext("2d");
      if (magCtx) {
        magCtx.imageSmoothingEnabled = false;
        magCtx.clearRect(0, 0, magCanvas.width, magCanvas.height);
        // Sample 11x11 square around cursor
        const sampleSize = 11;
        const half = Math.floor(sampleSize / 2);
        const sx = Math.max(0, canvasX - half);
        const sy = Math.max(0, canvasY - half);
        magCtx.drawImage(
          canvas,
          sx,
          sy,
          sampleSize,
          sampleSize,
          0,
          0,
          magCanvas.width,
          magCanvas.height
        );

        // Draw crosshair reticle
        const cx = magCanvas.width / 2;
        const cy = magCanvas.height / 2;
        magCtx.strokeStyle = "#FFFFFF";
        magCtx.lineWidth = 2;
        magCtx.strokeRect(cx - 5, cy - 5, 10, 10);
        magCtx.strokeStyle = "#000000";
        magCtx.lineWidth = 1;
        magCtx.strokeRect(cx - 5, cy - 5, 10, 10);
      }
    }
  };

  const handleCanvasMouseLeave = () => {
    setMagnifier((m) => ({ ...m, visible: false }));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = Math.floor((e.clientX - rect.left) * scaleX);
    const canvasY = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
    const pixelHex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setHex(pixelHex);
    setHexError("");
    commitColor(pixelHex);
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

  // Color Palettes
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
      {/* Top Action Bar: Quick Share, Eyedroppers, Image Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#FAFAF8] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pick from Screen (Native EyeDropper API) */}
          {hasEyeDropper && (
            <button
              type="button"
              onClick={pickFromScreen}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              title="Pick any color directly from your screen"
            >
              <Pipette size={16} />
              <span>Pick from Screen</span>
            </button>
          )}

          {/* Eyedropper from Image Button */}
          <button
            type="button"
            onClick={() => setShowImagePicker(!showImagePicker)}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              showImagePicker
                ? "bg-[#F5A623]/10 border-[#F5A623] text-[#F5A623]"
                : "bg-white dark:bg-[#1E2338] border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#F5A623]"
            }`}
            title="Upload or paste an image to extract pixel colors"
          >
            <ImageIcon size={16} className="text-[#F5A623]" />
            <span>{showImagePicker ? "Hide Image Eyedropper" : "Image Eyedropper (Upload / Paste)"}</span>
          </button>
        </div>

        {/* Shareable URL Button */}
        <button
          type="button"
          onClick={shareLink}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold hover:bg-[#F0EDE8] dark:hover:bg-[#2A2F48] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          title="Copy shareable link with current color"
        >
          {shareFeedback ? (
            <>
              <Check size={16} className="text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 size={16} className="text-[#71717A]" />
              <span>Share Color</span>
            </>
          )}
        </button>
      </div>

      {/* Image Eyedropper Workstation (Upload, Drag-and-Drop, Clipboard Paste, Magnifier Canvas) */}
      {showImagePicker && (
        <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pipette size={18} className="text-[#F5A623]" />
              <h3 className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
                Image Eyedropper &amp; Pixel Magnifier
              </h3>
            </div>
            {imageSrc && (
              <button
                type="button"
                onClick={() => {
                  setImageSrc(null);
                  setMagnifier((m) => ({ ...m, visible: false }));
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X size={14} /> Clear Image
              </button>
            )}
          </div>

          {!imageSrc ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleImageFile(file);
              }}
              className="border-2 border-dashed border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl p-8 text-center bg-[#FAFAF8] dark:bg-[#1E2338]/40 hover:border-[#F5A623] transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 text-[#F5A623] flex items-center justify-center mx-auto mb-3">
                <Upload size={22} />
              </div>
              <p className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
                Drop image here or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#F5A623] hover:underline font-bold cursor-pointer"
                >
                  Browse Computer
                </button>
              </p>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1">
                Supports JPG, PNG, WEBP, SVG • Or simply press <kbd className="px-1.5 py-0.5 rounded bg-[#E4E0D8] dark:bg-[#2A2F48] font-mono text-[10px]">Ctrl+V</kbd> to paste screenshot
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1.5">
                <ZoomIn size={14} className="text-[#F5A623]" />
                Hover to magnify pixels with the loupe, then click any pixel to sample its exact hex color.
              </p>
              <div className="relative overflow-auto rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[repeating-conic-gradient(#E4E0D8_0_90deg,#FAFAF8_0_180deg)_0_0/16px_16px] dark:bg-[repeating-conic-gradient(#1E2338_0_90deg,#141829_0_180deg)_0_0/16px_16px] max-h-[480px] flex items-center justify-center p-2 cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={handleCanvasMouseLeave}
                  onClick={handleCanvasClick}
                  className="max-w-full h-auto rounded shadow-sm"
                />

                {/* Live Floating Magnifier Loupe */}
                {magnifier.visible && (
                  <div
                    className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-[130px] flex flex-col items-center"
                    style={{ left: `${magnifier.x}px`, top: `${magnifier.y}px` }}
                  >
                    <div className="w-28 h-28 rounded-full border-4 border-white dark:border-[#141829] shadow-2xl overflow-hidden bg-black relative ring-2 ring-[#F5A623]">
                      <canvas
                        ref={magnifierCanvasRef}
                        width={112}
                        height={112}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="mt-1 px-2.5 py-1 rounded-full bg-black/90 text-white text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs border border-white/20">
                      <span
                        className="w-3 h-3 rounded-full border border-white shrink-0 inline-block"
                        style={{ backgroundColor: magnifier.colorHex }}
                      />
                      <span>{magnifier.colorHex}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
              <span>Click to Open Palette</span>
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
                <button
                  type="button"
                  onClick={clearRecentColors}
                  className="text-[10px] text-[#71717A] hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={11} /> Clear
                </button>
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

        {/* Right: Sliders (HSL + RGB) with LIVE Dynamic Gradient Tracks */}
        <div className="lg:col-span-8 space-y-4">
          {/* HSL Channels (P0 Fix: Dynamic Live Gradients for Saturation and Lightness) */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-2">
              <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={14} className="text-[#F5A623]" /> HSL Channels (Hue, Saturation, Lightness)
              </span>
              <span className="text-[10px] text-[#71717A]">Keyboard: Arrows (±1), Shift+Arrows (±10)</span>
            </div>

            <div className="space-y-3.5">
              {/* Hue Slider (0 - 360) */}
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

              {/* Saturation Slider (0 - 100%) [P0 FIX: Dynamic linear-gradient from gray to saturated at current H & L] */}
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

              {/* Lightness Slider (0 - 100%) [P0 FIX: Dynamic linear-gradient from black to color to white at current H & S] */}
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
                const startRgb = rgbToHex(...(Object.values({ ...rgb, [ch]: 0 }) as [number, number, number]));
                const endRgb = rgbToHex(...(Object.values({ ...rgb, [ch]: 255 }) as [number, number, number]));

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

      {/* Output Formats Grid (HEX, RGB, HSL, HSV, CMYK, LAB, CSS) */}
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

      {/* Palette Generator (P1 Redesign: Single Palette Block + Pill/Tab Switcher + Export Dev-Handoff) */}
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

      {/* WCAG Contrast Checker & Color Blindness Simulation Preview */}
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
            {/* Foreground */}
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

            {/* Background */}
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
                <span className="text-[9px] font-bold uppercase block text-[#71717A]">{b.label}</span>
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

        {/* Color Blindness Simulation (CVD) Preview (P2 Polish) */}
        <div className="lg:col-span-6 p-5 sm:p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-3">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={16} className="text-[#F5A623]" /> Color Vision Deficiency (CVD) Preview
            </h4>
            <span className="text-[10px] text-[#71717A]">Simulated Perception</span>
          </div>

          <div className="space-y-3">
            {/* Normal Swatch */}
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

            {/* Simulated CVD Conditions */}
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
