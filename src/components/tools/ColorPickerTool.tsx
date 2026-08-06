"use client";
import { useState, useCallback, useMemo } from "react";
import { Copy, Check, Pipette, Eye, Palette, SunMedium } from "lucide-react";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
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
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function relativeLuminance(r: number, g: number, b: number) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }) {
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export default function ColorPickerTool() {
  const [hex, setHex] = useState("#F5A623");
  const [compareHex, setCompareHex] = useState("#1F2544");
  const [copied, setCopied] = useState("");
  const [hexError, setHexError] = useState("");
  const [hasEyeDropper] = useState(() => typeof window !== "undefined" && "EyeDropper" in window);

  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(hex);
  const rgb = hexToRgb(hex) || { r: 245, g: 166, b: 35 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const safeHex = isValidHex ? hex : "#F5A623";

  const compareRgb = hexToRgb(compareHex) || { r: 31, g: 37, b: 68 };
  const safeCompareHex = /^#[0-9a-fA-F]{6}$/.test(compareHex) ? compareHex : "#1F2544";

  const updateFromHex = (val: string) => {
    let clean = val.replace(/[^#0-9a-fA-F]/g, "");
    if (!clean.startsWith("#")) clean = "#" + clean;
    clean = clean.slice(0, 7);
    setHex(clean);

    if (clean.length === 7 && /^#[0-9a-fA-F]{6}$/.test(clean)) {
      setHexError("");
    } else if (clean.length > 1) {
      setHexError(`Need 6 hex digits — currently ${clean.length - 1}/6`);
    } else {
      setHexError("");
    }
  };

  const updateFromRgb = (key: "r" | "g" | "b", val: number) => {
    const newRgb = { ...rgb, [key]: Math.min(255, Math.max(0, val)) };
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const updateFromHsl = (key: "h" | "s" | "l", val: number) => {
    const maxVal = key === "h" ? 360 : 100;
    const newHsl = { ...hsl, [key]: Math.min(maxVal, Math.max(0, val)) };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleRgbKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, ch: "r" | "g" | "b") => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const delta = e.key === "ArrowUp" ? step : -step;
      updateFromRgb(ch, (rgb[ch] || 0) + delta);
    }
  };

  const handleHslKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, ch: "h" | "s" | "l") => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const delta = e.key === "ArrowUp" ? step : -step;
      updateFromHsl(ch, (hsl[ch] || 0) + delta);
    }
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const step = e.shiftKey ? 5 : 1;
      const delta = e.key === "ArrowUp" ? step : -step;
      updateFromHsl("l", (hsl.l || 0) + delta);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>, type: "rgb" | "hsl", ch: "r" | "g" | "b" | "h" | "s" | "l") => {
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    const delta = e.deltaY < 0 ? step : -step;
    if (type === "rgb" && (ch === "r" || ch === "g" || ch === "b")) {
      updateFromRgb(ch, (rgb[ch] || 0) + delta);
    } else if (type === "hsl" && (ch === "h" || ch === "s" || ch === "l")) {
      updateFromHsl(ch, (hsl[ch] || 0) + delta);
    }
  };

  const copyValue = useCallback((label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const pickFromScreen = useCallback(async () => {
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result.sRGBHex) {
        setHex(result.sRGBHex);
        setHexError("");
      }
    } catch {
      // User cancelled or browser denied
    }
  }, []);

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

  // Palette Generation
  const palette = useMemo(() => {
    const complementary = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
    const analogous1 = hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l);
    const analogous2 = hslToRgb((hsl.h + 330) % 360, hsl.s, hsl.l);
    const triadic1 = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l);
    const triadic2 = hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l);

    const tints = [90, 80, 70, 60, 50].map(l => hslToRgb(hsl.h, hsl.s, l));
    const shades = [40, 30, 20, 15, 10].map(l => hslToRgb(hsl.h, hsl.s, l));

    return {
      complementary: rgbToHex(complementary.r, complementary.g, complementary.b),
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
      tints: tints.map(t => rgbToHex(t.r, t.g, t.b)),
      shades: shades.map(s => rgbToHex(s.r, s.g, s.b)),
    };
  }, [hsl.h, hsl.s, hsl.l, safeHex]);

  const formats = [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "CSS", value: hex.toUpperCase() },
  ];

  return (
    <div className="space-y-6">


      {/* Color preview + picker */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div
          className="w-full sm:w-48 h-48 rounded-2xl border-2 border-[#E4E0D8] dark:border-[#1E2338] shadow-inner relative overflow-hidden"
          style={{ backgroundColor: safeHex }}
        >
          <input
            type="color"
            value={safeHex}
            onChange={(e) => { setHex(e.target.value); setHexError(""); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="absolute bottom-2 right-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] font-mono text-[#18181B] dark:text-[#F4F4F5]">
            Click to pick
          </div>
        </div>

        {/* RGB Sliders & Inputs */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-1">
            <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider">RGB Channels</span>
            <span className="text-[10px] text-[#71717A]">0 – 255</span>
          </div>

          {(["r", "g", "b"] as const).map((ch) => (
            <div key={ch} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-[#71717A] tracking-wider">{ch.toUpperCase()}</label>
                <input
                  type="number"
                  min={0}
                  max={255}
                  step={1}
                  value={rgb[ch]}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") return;
                    updateFromRgb(ch, parseInt(raw, 10) || 0);
                  }}
                  onKeyDown={(e) => handleRgbKeyDown(e, ch)}
                  onWheel={(e) => handleWheel(e, "rgb", ch)}
                  className="w-16 text-center text-xs font-mono px-1 py-0.5 rounded border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
                />
              </div>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb[ch]}
                onChange={(e) => updateFromRgb(ch, parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#F5A623]"
                style={{ background: `linear-gradient(to right, ${rgbToHex(...Object.values({ ...rgb, [ch]: 0 }) as [number, number, number])}, ${rgbToHex(...Object.values({ ...rgb, [ch]: 255 }) as [number, number, number])})` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* HSL Sliders & Inputs */}
      <div className="p-4 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-1">
          <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider">HSL Channels (Hue, Saturation, Lightness)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Hue */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#71717A]">H (Hue)</label>
              <input
                type="number"
                min={0}
                max={360}
                step={1}
                value={hsl.h}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") return;
                  updateFromHsl("h", parseInt(raw, 10) || 0);
                }}
                onKeyDown={(e) => handleHslKeyDown(e, "h")}
                onWheel={(e) => handleWheel(e, "hsl", "h")}
                className="w-16 text-center text-xs font-mono px-1 py-0.5 rounded border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={hsl.h}
              onChange={(e) => updateFromHsl("h", parseInt(e.target.value, 10))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#F5A623]"
              style={{ background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" }}
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#71717A]">S (Sat %)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={hsl.s}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") return;
                  updateFromHsl("s", parseInt(raw, 10) || 0);
                }}
                onKeyDown={(e) => handleHslKeyDown(e, "s")}
                onWheel={(e) => handleWheel(e, "hsl", "s")}
                className="w-16 text-center text-xs font-mono px-1 py-0.5 rounded border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={hsl.s}
              onChange={(e) => updateFromHsl("s", parseInt(e.target.value, 10))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#F5A623]"
            />
          </div>

          {/* Lightness */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#71717A]">L (Light %)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={hsl.l}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") return;
                  updateFromHsl("l", parseInt(raw, 10) || 0);
                }}
                onKeyDown={(e) => handleHslKeyDown(e, "l")}
                onWheel={(e) => handleWheel(e, "hsl", "l")}
                className="w-16 text-center text-xs font-mono px-1 py-0.5 rounded border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={hsl.l}
              onChange={(e) => updateFromHsl("l", parseInt(e.target.value, 10))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#F5A623]"
            />
          </div>
        </div>
      </div>

      {/* HEX Input + Eyedropper */}
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">HEX Value (Use ↑ / ↓ to adjust brightness)</label>
          <input
            type="text"
            value={hex}
            onChange={(e) => updateFromHex(e.target.value)}
            onKeyDown={handleHexKeyDown}
            maxLength={7}
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] font-mono text-sm focus:outline-none focus:ring-2 ${hexError
              ? "border-red-400 dark:border-red-600 focus:ring-red-400/40"
              : "border-[#E4E0D8] dark:border-[#1E2338] focus:ring-[#F5A623]/40"
              }`}
          />
          {hexError && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{hexError}</p>
          )}
        </div>

        {hasEyeDropper && (
          <button
            onClick={pickFromScreen}
            className="mt-8 px-4 py-3 rounded-xl bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
          >
            <Pipette size={16} /> Pick from Screen
          </button>
        )}
      </div>

      {/* Output Formats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {formats.map((f) => (
          <div key={f.label} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div>
              <span className="text-[10px] font-bold text-[#1F2544] dark:text-[#F5A623] uppercase tracking-wider">{f.label}</span>
              <p className="text-sm font-mono text-[#18181B] dark:text-[#E4E4E7] mt-0.5">{f.value}</p>
            </div>
            <button
              onClick={() => copyValue(f.label, f.value)}
              className="p-2 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-white dark:hover:bg-[#141829] transition-colors"
            >
              {copied === f.label ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
        ))}
      </div>

      {/* WCAG Contrast Checker */}
      <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4 shadow-sm">
        <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
          <Eye size={14} className="text-[#F5A623]" /> WCAG Contrast Checker
        </h4>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Foreground Color */}
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-[#71717A]">Foreground (Text)</label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] shrink-0" style={{ backgroundColor: safeHex }} />
              <span className="text-xs font-mono text-[#18181B] dark:text-[#F4F4F5]">{safeHex.toUpperCase()}</span>
            </div>
          </div>

          {/* Background Color */}
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-[#71717A]">Background</label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] shrink-0 relative overflow-hidden" style={{ backgroundColor: safeCompareHex }}>
                <input
                  type="color"
                  value={safeCompareHex}
                  onChange={(e) => setCompareHex(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                className="flex-1 px-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
              />
            </div>
          </div>
        </div>

        {/* Preview Text */}
        <div className="p-5 rounded-xl" style={{ backgroundColor: safeCompareHex }}>
          <p className="text-2xl font-bold" style={{ color: safeHex }}>
            Sample Text Aa
          </p>
          <p className="text-sm mt-1" style={{ color: safeHex }}>
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>

        {/* Contrast Ratio + WCAG Results */}
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <span className="text-[10px] font-bold text-[#71717A] uppercase block">Contrast Ratio</span>
            <span className="text-lg font-extrabold text-[#18181B] dark:text-[#F4F4F5]">{wcag.ratio}:1</span>
          </div>
          {[
            { label: "AA Normal", pass: wcag.aaNormal },
            { label: "AA Large", pass: wcag.aaLarge },
            { label: "AAA Normal", pass: wcag.aaaNormal },
            { label: "AAA Large", pass: wcag.aaaLarge },
          ].map((badge) => (
            <div
              key={badge.label}
              className={`px-3 py-2.5 rounded-xl border text-center ${badge.pass
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60"
                }`}
            >
              <span className="text-[10px] font-bold uppercase block text-[#71717A]">{badge.label}</span>
              <span className={`text-xs font-extrabold ${badge.pass ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {badge.pass ? "✓ PASS" : "✗ FAIL"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Palette Generator */}
      <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5 shadow-sm">
        <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
          <Palette size={14} className="text-[#F5A623]" /> Generated Palettes
        </h4>

        {/* Complementary */}
        <PaletteRow label="Complementary" colors={[safeHex, palette.complementary]} onCopy={copyValue} copied={copied} />

        {/* Analogous */}
        <PaletteRow label="Analogous" colors={palette.analogous} onCopy={copyValue} copied={copied} />

        {/* Triadic */}
        <PaletteRow label="Triadic" colors={palette.triadic} onCopy={copyValue} copied={copied} />

        {/* Tints */}
        <PaletteRow label="Tints (Lighter)" colors={palette.tints} onCopy={copyValue} copied={copied} />

        {/* Shades */}
        <PaletteRow label="Shades (Darker)" colors={palette.shades} onCopy={copyValue} copied={copied} />
      </div>
    </div>
  );
}

function PaletteRow({
  label,
  colors,
  onCopy,
  copied,
}: {
  label: string;
  colors: string[];
  onCopy: (label: string, value: string) => void;
  copied: string;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">{label}</span>
      <div className="flex gap-2 flex-wrap">
        {colors.map((color, idx) => (
          <button
            key={`${label}-${idx}`}
            onClick={() => onCopy(`${label}-${idx}`, color.toUpperCase())}
            className="group relative w-14 h-14 rounded-xl border-2 border-[#E4E0D8] dark:border-[#2A2F48] hover:scale-110 transition-transform shadow-sm"
            style={{ backgroundColor: color }}
            title={`Click to copy ${color.toUpperCase()}`}
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#71717A] whitespace-nowrap">
              {copied === `${label}-${idx}` ? "✓" : color.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
