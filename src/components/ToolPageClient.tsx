"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Heart } from "lucide-react";
import type { ToolDef, CategoryDef } from "@/lib/tools-registry";
import { trackToolUse } from "@/lib/analytics";
import ToolFeedbackWidget from "@/components/tools/shared/ToolFeedbackWidget";

import { ToolWorkstationSkeleton } from "@/components/tools/shared/ToolPageSkeleton";

function loadTool(importFn: () => Promise<any>, isSsr = false) {
  return dynamic(importFn, {
    loading: () => <ToolWorkstationSkeleton />,
    ssr: isSsr,
  });
}

export const TOOL_COMPONENTS: Record<string, any> = {
  "json-formatter": loadTool(() => import("@/components/tools/JsonFormatterTool")),
  "base64-encoder": loadTool(() => import("@/components/tools/Base64Tool")),
  "url-encoder": loadTool(() => import("@/components/tools/UrlEncoderTool")),
  "word-counter": loadTool(() => import("@/components/tools/WordCounterTool")),
  "case-converter": loadTool(() => import("@/components/tools/CaseConverterTool")),
  "password-generator": loadTool(() => import("@/components/tools/PasswordGeneratorTool")),
  "lorem-ipsum": loadTool(() => import("@/components/tools/LoremIpsumTool")),
  "hash-generator": loadTool(() => import("@/components/tools/HashGeneratorTool")),
  "regex-tester": loadTool(() => import("@/components/tools/RegexTesterTool")),
  "color-picker": loadTool(() => import("@/components/tools/ColorPickerTool")),
  "qr-generator": loadTool(() => import("@/components/tools/QrCodeTool")),
  "text-diff": loadTool(() => import("@/components/tools/TextDiffTool")),
  "markdown-preview": loadTool(() => import("@/components/tools/MarkdownPreviewTool")),
  "string-utilities": loadTool(() => import("@/components/tools/StringUtilitiesTool")),
  "land-converter": loadTool(() => import("@/components/tools/LandConverterTool")),
  "nrs-converter": loadTool(() => import("@/components/tools/NrsCurrencyTool")),
  "emi-calculator": loadTool(() => import("@/components/tools/EmiCalculatorTool")),
  "tax-calculator": loadTool(() => import("@/components/tools/TaxCalculatorTool")),
  "sip-calculator": loadTool(() => import("@/components/tools/SipCalculatorTool")),
  "fd-calculator": loadTool(() => import("@/components/tools/FdCalculatorTool")),
  "vat-calculator": loadTool(() => import("@/components/tools/VatCalculatorTool")),
  "link-shortener": loadTool(() => import("@/components/tools/UrlShortenerTool")),
  "nepali-translator": loadTool(() => import("@/components/tools/NepaliTranslatorTool")),
  "nepali-date-converter": loadTool(() => import("@/components/tools/NepaliDateConverterTool")),
  "nepali-unicode": loadTool(() => import("@/components/tools/NepaliUnicodeTool")),
  "nepali-number-words": loadTool(() => import("@/components/tools/NepaliNumberToWordsTool")),
  "timezone-converter": loadTool(() => import("@/components/tools/TimeZoneConverterTool")),
  "pdf-to-word": loadTool(() => import("@/components/tools/PdfToWordTool")),
  "image-compressor": loadTool(() => import("@/components/tools/ImageCompressorTool")),
  "image-resizer": loadTool(() => import("@/components/tools/ImageResizerTool")),
  "image-cropper": loadTool(() => import("@/components/tools/ImageCropperTool")),
  "image-converter": loadTool(() => import("@/components/tools/ImageConverterTool")),
  "image-to-base64": loadTool(() => import("@/components/tools/ImageToBase64Tool")),
  "background-remover": loadTool(() => import("@/components/tools/BackgroundRemoverTool")),
  "pdf-merger": loadTool(() => import("@/components/tools/PdfMergerTool")),
  "pdf-splitter": loadTool(() => import("@/components/tools/PdfSplitterTool")),
  "pdf-organizer": loadTool(() => import("@/components/tools/PdfOrganizerTool")),
  "pdf-watermark": loadTool(() => import("@/components/tools/PdfWatermarkTool")),
  "jpg-pdf-converter": loadTool(() => import("@/components/tools/JpgPdfConverterTool")),
  "pdf-compressor": loadTool(() => import("@/components/tools/PdfCompressorTool")),
  "interest-calculator": loadTool(() => import("@/components/tools/InterestCalculatorTool")),
  "pf-calculator": loadTool(() => import("@/components/tools/PfCalculatorTool")),
  "gold-silver-calculator": loadTool(() => import("@/components/tools/GoldSilverCalculatorTool")),
  "uuid-generator": loadTool(() => import("@/components/tools/UuidGeneratorTool")),
  "jwt-decoder": loadTool(() => import("@/components/tools/JwtDecoderTool")),
  "unix-timestamp-converter": loadTool(() => import("@/components/tools/UnixTimestampConverterTool")),
  "css-js-minifier": loadTool(() => import("@/components/tools/CssJsMinifierTool")),
  "favicon-generator": loadTool(() => import("@/components/tools/FaviconGeneratorTool")),
  "image-watermark": loadTool(() => import("@/components/tools/ImageWatermarkTool")),
  "image-rotate-flip": loadTool(() => import("@/components/tools/ImageRotateFlipTool")),
  "nepali-calendar": loadTool(() => import("@/components/tools/NepaliCalendarTool")),
  "traditional-unit-converter": loadTool(() => import("@/components/tools/TraditionalUnitConverterTool")),
  "vehicle-tax-calculator": loadTool(() => import("@/components/tools/VehicleTaxCalculatorTool")),
  "ward-municipality-lookup": loadTool(() => import("@/components/tools/WardMunicipalityLookupTool")),

  "unit-converter": loadTool(() => import("@/components/tools/UnitConverterTool")),
  "percentage-calculator": loadTool(() => import("@/components/tools/PercentageCalculatorTool")),
  "gpa-percentage-converter": loadTool(() => import("@/components/tools/GpaPercentageConverterTool")),
  "bmi-calculator": loadTool(() => import("@/components/tools/BmiCalculatorTool")),
  "discount-calculator": loadTool(() => import("@/components/tools/DiscountCalculatorTool")),

  // High-RPM Global Tools
  "hmac-generator": loadTool(() => import("@/components/tools/HmacGeneratorTool")),
  "random-token-generator": loadTool(() => import("@/components/tools/RandomTokenGeneratorTool")),
  "file-checksum-verifier": loadTool(() => import("@/components/tools/FileChecksumVerifierTool")),
  "bmr-calculator": loadTool(() => import("@/components/tools/BmrTdeeCalculatorTool")),
  "calorie-calculator": loadTool(() => import("@/components/tools/CalorieCalculatorTool")),
  "age-calculator": loadTool(() => import("@/components/tools/AgeCalculatorTool")),
};

export default function ToolPageClient({
  tool,
  category,
}: {
  tool: ToolDef;
  category: CategoryDef;
}) {
  // ── Analytics & History ──
  useEffect(() => {
    if (!tool || !category) return;
    trackToolUse(tool.slug);
    try {
      const raw = localStorage.getItem("sajilo_history");
      const list = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((i: any) => i.slug !== tool.slug);
      const updated = [
        {
          name: tool.name,
          slug: tool.slug,
          categorySlug: category.slug,
          categoryName: category.name,
        },
        ...filtered,
      ].slice(0, 10);
      localStorage.setItem("sajilo_history", JSON.stringify(updated));
    } catch {}
  }, [tool, category]);

  // ── Favorites ──
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const syncFav = () => {
      try {
        const raw = localStorage.getItem("sajilo_favorites");
        if (raw) {
          const list: string[] = JSON.parse(raw);
          setIsFav(list.includes(tool.name));
        } else {
          setIsFav(false);
        }
      } catch {}
    };

    syncFav();
    window.addEventListener("sajilo_favorites_updated", syncFav);
    window.addEventListener("storage", syncFav);
    return () => {
      window.removeEventListener("sajilo_favorites_updated", syncFav);
      window.removeEventListener("storage", syncFav);
    };
  }, [tool.name]);

  const toggleFavorite = () => {
    try {
      const raw = localStorage.getItem("sajilo_favorites");
      const list: string[] = raw ? JSON.parse(raw) : [];
      let updated: string[];
      if (list.includes(tool.name)) {
        updated = list.filter((n) => n !== tool.name);
        setIsFav(false);
      } else {
        updated = [...list, tool.name];
        setIsFav(true);
      }
      localStorage.setItem("sajilo_favorites", JSON.stringify(updated));
      window.dispatchEvent(new Event("sajilo_favorites_updated"));
    } catch {}
  };

  const ToolComponent = useMemo(() => TOOL_COMPONENTS[tool.slug] ?? null, [tool.slug]);

  if (!ToolComponent) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
          Coming Soon
        </h2>
        <p className="text-[#71717A] dark:text-[#A1A1AA] text-sm max-w-md mx-auto">
          This tool is currently being built. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Favorite Action Bar */}
      <div className="flex items-center justify-end">
        <button
          onClick={toggleFavorite}
          className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
            isFav
              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              : "bg-[#FAFAF8] dark:bg-[#1E2338] border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:text-rose-600 hover:border-rose-500/30"
          }`}
          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart size={14} className={isFav ? "fill-rose-500 text-rose-500" : ""} />
          <span>{isFav ? "Favorited" : "Favorite"}</span>
        </button>
      </div>

      {/* Active Tool */}
      <ToolComponent />

      {/* Feedback Widget */}
      <ToolFeedbackWidget toolSlug={tool.slug} />
    </div>
  );
}
