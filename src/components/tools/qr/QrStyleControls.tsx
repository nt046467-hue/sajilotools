"use client";

import React, { useRef } from "react";
import {
  Palette,
  Upload,
  X,
  AlertTriangle,
  Info,
  ShieldCheck,
  Check,
  Sliders,
} from "lucide-react";
import {
  QrStyleOptions,
  DotStyle,
  CornerSquareStyle,
  CornerDotStyle,
  ErrorCorrectionLevel,
  ColorType,
  GradientType,
} from "./types";
import { checkContrast } from "./qr-serializers";

interface QrStyleControlsProps {
  styleOptions: QrStyleOptions;
  onChange: (updated: Partial<QrStyleOptions>) => void;
}

export default function QrStyleControls({
  styleOptions,
  onChange,
}: QrStyleControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLowContrast, message } = checkContrast(
    styleOptions.darkColor,
    styleOptions.lightColor,
    styleOptions.isTransparent
  );

  const dotStyles: { id: DotStyle; label: string }[] = [
    { id: "square", label: "Square" },
    { id: "rounded", label: "Rounded" },
    { id: "dots", label: "Dots" },
    { id: "extra-rounded", label: "Extra Round" },
    { id: "classy", label: "Classy" },
    { id: "classy-rounded", label: "Classy Round" },
  ];

  const cornerSquareStyles: { id: CornerSquareStyle; label: string }[] = [
    { id: "square", label: "Square Frame" },
    { id: "extra-rounded", label: "Rounded Frame" },
    { id: "dot", label: "Dot Frame" },
  ];

  const cornerDotStyles: { id: CornerDotStyle; label: string }[] = [
    { id: "square", label: "Square Center" },
    { id: "dot", label: "Dot Center" },
  ];

  const eccLevels: { id: ErrorCorrectionLevel; label: string; desc: string }[] = [
    { id: "L", label: "L - 7%", desc: "Lowest density, cleans scans for simple text" },
    { id: "M", label: "M - 15%", desc: "Default balance for mobile cameras" },
    { id: "Q", label: "Q - 25%", desc: "High resilience for dirty/scratched surfaces" },
    { id: "H", label: "H - 30%", desc: "Maximum recovery (required for logo overlays)" },
  ];

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        logoSrc: reader.result as string,
        // Auto-bump to H for logo scannability guarantee
        errorCorrectionLevel: "H",
      });
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    onChange({ logoSrc: null });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
          Style & Appearance
        </label>
        {isLowContrast && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle size={12} /> Low Contrast Warning
          </span>
        )}
      </div>

      <div className="p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] space-y-5">
        {/* Colors & Gradient Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
              <Palette size={14} className="text-[#F5A623]" />
              Color Fill & Background
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ colorType: "single" })}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  styleOptions.colorType === "single"
                    ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                    : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA]"
                }`}
              >
                Solid Color
              </button>
              <button
                type="button"
                onClick={() => onChange({ colorType: "gradient" })}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  styleOptions.colorType === "gradient"
                    ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                    : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA]"
                }`}
              >
                Gradient
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Foreground / Gradient Pickers */}
            {styleOptions.colorType === "single" ? (
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={styleOptions.darkColor}
                  onChange={(e) => onChange({ darkColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 p-0 bg-transparent cursor-pointer shrink-0"
                />
                <div>
                  <span className="block font-medium text-[#18181B] dark:text-[#F4F4F5]">Foreground</span>
                  <span className="text-[10px] text-[#A1A1AA] uppercase font-mono">{styleOptions.darkColor}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 sm:col-span-2 p-3 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#18181B] dark:text-[#F4F4F5]">Gradient Colors & Rotation</span>
                  <select
                    value={styleOptions.gradientType}
                    onChange={(e) => onChange({ gradientType: e.target.value as GradientType })}
                    className="px-2 py-0.5 rounded text-[11px] border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5]"
                  >
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="color"
                      value={styleOptions.gradientColor1}
                      onChange={(e) => onChange({ gradientColor1: e.target.value })}
                      className="w-7 h-7 rounded border-0 p-0 bg-transparent cursor-pointer"
                    />
                    <span>Start Color</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="color"
                      value={styleOptions.gradientColor2}
                      onChange={(e) => onChange({ gradientColor2: e.target.value })}
                      className="w-7 h-7 rounded border-0 p-0 bg-transparent cursor-pointer"
                    />
                    <span>End Color</span>
                  </label>
                  {styleOptions.gradientType === "linear" && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">Angle:</span>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="15"
                        value={styleOptions.gradientRotation}
                        onChange={(e) => onChange({ gradientRotation: parseInt(e.target.value) })}
                        className="w-20 cursor-pointer accent-[#F5A623]"
                      />
                      <span className="text-[10px] font-mono">{styleOptions.gradientRotation}°</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Background Color & Transparent toggle */}
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={styleOptions.lightColor}
                  onChange={(e) => onChange({ lightColor: e.target.value })}
                  disabled={styleOptions.isTransparent}
                  className="w-8 h-8 rounded border-0 p-0 bg-transparent cursor-pointer disabled:opacity-30 shrink-0"
                />
                <div>
                  <span className="block font-medium text-[#18181B] dark:text-[#F4F4F5]">Background</span>
                  <span className="text-[10px] text-[#A1A1AA] uppercase font-mono">
                    {styleOptions.isTransparent ? "Transparent" : styleOptions.lightColor}
                  </span>
                </div>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-[#18181B] dark:text-[#F4F4F5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleOptions.isTransparent}
                  onChange={(e) => onChange({ isTransparent: e.target.checked })}
                  className="rounded border-[#E4E0D8] text-[#F5A623] focus:ring-[#F5A623]/40"
                />
                <span>Transparent</span>
              </label>
            </div>
          </div>
        </div>

        {/* Dot Pattern & Corner Eye Shapes */}
        <div className="space-y-3 pt-3 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
          <span className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] block">
            Dot Pattern & Corner Eye Styles
          </span>
          <div className="space-y-3">
            {/* Dots */}
            <div>
              <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] block mb-1.5">
                Body Pattern
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {dotStyles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChange({ dotStyle: item.id })}
                    className={`px-2 py-1.5 rounded text-xs text-center border font-medium transition-all ${
                      styleOptions.dotStyle === item.id
                        ? "border-[#F5A623] bg-[#F5A623]/10 text-[#18181B] dark:text-[#F4F4F5] font-bold"
                        : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Frames & Center Dots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] block mb-1.5">
                  Eye Outer Frame
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {cornerSquareStyles.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onChange({ cornerSquareStyle: item.id })}
                      className={`px-2 py-1 rounded text-[11px] text-center border transition-all ${
                        styleOptions.cornerSquareStyle === item.id
                          ? "border-[#F5A623] bg-[#F5A623]/10 text-[#18181B] dark:text-[#F4F4F5] font-bold"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA]"
                      }`}
                    >
                      {item.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] block mb-1.5">
                  Eye Center Dot
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {cornerDotStyles.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onChange({ cornerDotStyle: item.id })}
                      className={`px-2 py-1 rounded text-[11px] text-center border transition-all ${
                        styleOptions.cornerDotStyle === item.id
                          ? "border-[#F5A623] bg-[#F5A623]/10 text-[#18181B] dark:text-[#F4F4F5] font-bold"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA]"
                      }`}
                    >
                      {item.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Logo Upload & Scale Slider */}
        <div className="space-y-3 pt-3 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">
              Center Branding Logo
            </span>
            {styleOptions.logoSrc && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck size={12} /> ECC Auto-bumped to &apos;H&apos;
              </span>
            )}
          </div>

          {styleOptions.logoSrc ? (
            <div className="p-3 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={styleOptions.logoSrc}
                    alt="Center logo preview"
                    className="w-9 h-9 rounded object-contain border border-[#E4E0D8] dark:border-[#2A2F48] bg-white p-0.5"
                  />
                  <div>
                    <span className="block text-xs font-medium text-[#18181B] dark:text-[#F4F4F5]">
                      Logo Embedded
                    </span>
                    <span className="text-[10px] text-[#A1A1AA]">
                      Size: {Math.round(styleOptions.logoSize * 100)}% of QR area
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="p-1 text-[#71717A] hover:text-red-500 transition-colors"
                  title="Remove logo"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Logo controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E4E0D8]/60 dark:border-[#2A2F48]/60">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#71717A] dark:text-[#A1A1AA]">Logo Size Scale</span>
                    <span className="font-mono">{Math.round(styleOptions.logoSize * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.28"
                    step="0.02"
                    value={styleOptions.logoSize}
                    onChange={(e) => onChange({ logoSize: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer accent-[#F5A623]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hide-bg-dots"
                    checked={styleOptions.logoHideBackgroundDots}
                    onChange={(e) => onChange({ logoHideBackgroundDots: e.target.checked })}
                    className="rounded border-[#E4E0D8] text-[#F5A623] focus:ring-[#F5A623]/40 cursor-pointer"
                  />
                  <label htmlFor="hide-bg-dots" className="text-xs text-[#18181B] dark:text-[#F4F4F5] cursor-pointer">
                    Clear dots behind logo
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-medium text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#2A2F48] transition-colors cursor-pointer">
              <Upload size={14} className="text-[#F5A623]" />
              Upload Branding Logo (PNG, SVG, JPG)
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Error Correction Level */}
        <div className="space-y-3 pt-3 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Error Correction Level (ECC)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {eccLevels.map((lvl) => {
              const isSelected = styleOptions.errorCorrectionLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onChange({ errorCorrectionLevel: lvl.id })}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "border-[#F5A623] bg-[#F5A623]/10 text-[#18181B] dark:text-[#F4F4F5]"
                      : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA]"
                  }`}
                >
                  <span className="block text-xs font-bold">{lvl.label}</span>
                  <span className="block text-[9px] opacity-80 mt-0.5 line-clamp-1">
                    {lvl.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {styleOptions.logoSrc && (styleOptions.errorCorrectionLevel === "L" || styleOptions.errorCorrectionLevel === "M") && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Warning: Using low ECC with a logo may make the QR unscannable. &apos;H&apos; is recommended.</span>
            </div>
          )}
        </div>

        {/* Contrast Status Banner */}
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
            isLowContrast
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300"
              : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {isLowContrast ? <AlertTriangle size={15} className="shrink-0" /> : <Check size={15} className="shrink-0" />}
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
