"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Heart } from "lucide-react";
import type { ToolDef, CategoryDef } from "@/lib/tools-registry";
import { trackToolUse } from "@/lib/analytics";
import ToolFeedbackWidget from "@/components/tools/shared/ToolFeedbackWidget";

export const TOOL_COMPONENTS: Record<string, any> = {
  "json-formatter": dynamic(() => import("@/components/tools/JsonFormatterTool")),
  "base64-encoder": dynamic(() => import("@/components/tools/Base64Tool")),
  "url-encoder": dynamic(() => import("@/components/tools/UrlEncoderTool")),
  "word-counter": dynamic(() => import("@/components/tools/WordCounterTool")),
  "case-converter": dynamic(() => import("@/components/tools/CaseConverterTool")),
  "password-generator": dynamic(() => import("@/components/tools/PasswordGeneratorTool")),
  "lorem-ipsum": dynamic(() => import("@/components/tools/LoremIpsumTool")),
  "hash-generator": dynamic(() => import("@/components/tools/HashGeneratorTool")),
  "regex-tester": dynamic(() => import("@/components/tools/RegexTesterTool")),
  "color-picker": dynamic(() => import("@/components/tools/ColorPickerTool")),
  "qr-generator": dynamic(() => import("@/components/tools/QrCodeTool")),
  "text-diff": dynamic(() => import("@/components/tools/TextDiffTool")),
  "markdown-preview": dynamic(() => import("@/components/tools/MarkdownPreviewTool")),
  "string-utilities": dynamic(() => import("@/components/tools/StringUtilitiesTool")),
  "land-converter": dynamic(() => import("@/components/tools/LandConverterTool")),
  "nrs-converter": dynamic(() => import("@/components/tools/NrsCurrencyTool")),
  "emi-calculator": dynamic(() => import("@/components/tools/EmiCalculatorTool")),
  "tax-calculator": dynamic(() => import("@/components/tools/TaxCalculatorTool")),
  "sip-calculator": dynamic(() => import("@/components/tools/SipCalculatorTool")),
  "fd-calculator": dynamic(() => import("@/components/tools/FdCalculatorTool")),
  "vat-calculator": dynamic(() => import("@/components/tools/VatCalculatorTool")),
  "link-shortener": dynamic(() => import("@/components/tools/UrlShortenerTool")),
  "nepali-translator": dynamic(() => import("@/components/tools/NepaliTranslatorTool")),
  "nepali-date-converter": dynamic(() => import("@/components/tools/NepaliDateConverterTool")),
  "nepali-unicode": dynamic(() => import("@/components/tools/NepaliUnicodeTool")),
  "nepali-number-words": dynamic(() => import("@/components/tools/NepaliNumberToWordsTool")),
  "timezone-converter": dynamic(() => import("@/components/tools/TimeZoneConverterTool"), { ssr: false }),
  "pdf-to-word": dynamic(() => import("@/components/tools/PdfToWordTool"), { ssr: false }),
  "image-compressor": dynamic(() => import("@/components/tools/ImageCompressorTool"), { ssr: false }),
  "image-resizer": dynamic(() => import("@/components/tools/ImageResizerTool"), { ssr: false }),
  "image-cropper": dynamic(() => import("@/components/tools/ImageCropperTool"), { ssr: false }),
  "image-converter": dynamic(() => import("@/components/tools/ImageConverterTool"), { ssr: false }),
  "image-to-base64": dynamic(() => import("@/components/tools/ImageToBase64Tool"), { ssr: false }),
  "background-remover": dynamic(() => import("@/components/tools/BackgroundRemoverTool"), { ssr: false }),
  "pdf-merger": dynamic(() => import("@/components/tools/PdfMergerTool"), { ssr: false }),
  "pdf-splitter": dynamic(() => import("@/components/tools/PdfSplitterTool"), { ssr: false }),
  "pdf-organizer": dynamic(() => import("@/components/tools/PdfOrganizerTool"), { ssr: false }),
  "pdf-watermark": dynamic(() => import("@/components/tools/PdfWatermarkTool"), { ssr: false }),
  "jpg-pdf-converter": dynamic(() => import("@/components/tools/JpgPdfConverterTool"), { ssr: false }),
  "pdf-compressor": dynamic(() => import("@/components/tools/PdfCompressorTool"), { ssr: false }),
  "interest-calculator": dynamic(() => import("@/components/tools/InterestCalculatorTool"), { ssr: false }),
  "pf-calculator": dynamic(() => import("@/components/tools/PfCalculatorTool"), { ssr: false }),
  "gold-silver-calculator": dynamic(() => import("@/components/tools/GoldSilverCalculatorTool"), { ssr: false }),
  "uuid-generator": dynamic(() => import("@/components/tools/UuidGeneratorTool"), { ssr: false }),
  "jwt-decoder": dynamic(() => import("@/components/tools/JwtDecoderTool"), { ssr: false }),
  "unix-timestamp-converter": dynamic(() => import("@/components/tools/UnixTimestampConverterTool"), { ssr: false }),
  "css-js-minifier": dynamic(() => import("@/components/tools/CssJsMinifierTool"), { ssr: false }),
  "favicon-generator": dynamic(() => import("@/components/tools/FaviconGeneratorTool"), { ssr: false }),
  "image-watermark": dynamic(() => import("@/components/tools/ImageWatermarkTool"), { ssr: false }),
  "image-rotate-flip": dynamic(() => import("@/components/tools/ImageRotateFlipTool"), { ssr: false }),
  "nepali-calendar": dynamic(() => import("@/components/tools/NepaliCalendarTool"), { ssr: false }),
  "traditional-unit-converter": dynamic(() => import("@/components/tools/TraditionalUnitConverterTool"), { ssr: false }),
  "vehicle-tax-calculator": dynamic(() => import("@/components/tools/VehicleTaxCalculatorTool"), { ssr: false }),
  "ward-municipality-lookup": dynamic(() => import("@/components/tools/WardMunicipalityLookupTool"), { ssr: false }),

  "unit-converter": dynamic(() => import("@/components/tools/UnitConverterTool")),
  "percentage-calculator": dynamic(() => import("@/components/tools/PercentageCalculatorTool")),
  "gpa-percentage-converter": dynamic(() => import("@/components/tools/GpaPercentageConverterTool")),
  "bmi-calculator": dynamic(() => import("@/components/tools/BmiCalculatorTool")),
  "discount-calculator": dynamic(() => import("@/components/tools/DiscountCalculatorTool")),

  // New High-RPM Global Tools
  "hmac-generator": dynamic(() => import("@/components/tools/HmacGeneratorTool"), { ssr: false }),
  "random-token-generator": dynamic(() => import("@/components/tools/RandomTokenGeneratorTool"), { ssr: false }),
  "file-checksum-verifier": dynamic(() => import("@/components/tools/FileChecksumVerifierTool"), { ssr: false }),
  "bmr-calculator": dynamic(() => import("@/components/tools/BmrTdeeCalculatorTool"), { ssr: false }),
  "calorie-calculator": dynamic(() => import("@/components/tools/CalorieCalculatorTool"), { ssr: false }),
  "age-calculator": dynamic(() => import("@/components/tools/AgeCalculatorTool"), { ssr: false }),
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
    try {
      const raw = localStorage.getItem("sajilo_favorites");
      if (raw) {
        const list: string[] = JSON.parse(raw);
        setIsFav(list.includes(tool.name));
      }
    } catch {}
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
