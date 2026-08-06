"use client";

import React, { useState } from "react";
import { Upload, Archive, Play, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import JSZip from "jszip";
import { QrStyleOptions } from "./types";

interface QrBatchToolProps {
  styleOptions: QrStyleOptions;
}

export default function QrBatchTool({ styleOptions }: QrBatchToolProps) {
  const [inputText, setInputText] = useState(
    "Table 1, https://getvelomarket.vercel.app/order?table=1\nTable 2, https://getvelomarket.vercel.app/order?table=2\nTable 3, https://getvelomarket.vercel.app/order?table=3"
  );
  const [exportFormat, setExportFormat] = useState<"png" | "svg">("png");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  function parseInput(): { label: string; payload: string }[] {
    const lines = inputText.split("\n").map((l) => l.trim()).filter(Boolean);
    const items: { label: string; payload: string }[] = [];

    lines.forEach((line, index) => {
      if (line.includes(",")) {
        const parts = line.split(",");
        const label = parts[0].trim() || `qr_${index + 1}`;
        const payload = parts.slice(1).join(",").trim();
        if (payload) {
          items.push({ label, payload });
        }
      } else {
        items.push({ label: `qr_${index + 1}`, payload: line });
      }
    });

    return items.slice(0, 100); // Enforce 100 soft limit
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  }

  async function generateBatchZip() {
    const items = parseInput();
    if (items.length === 0) return;

    setIsGenerating(true);
    setProgress(0);
    setTotalCount(items.length);

    try {
      const zip = new JSZip();
      const module = await import("qr-code-styling");
      const QRCodeStyling = module.default;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const qrOptions: any = {
          width: styleOptions.size || 512,
          height: styleOptions.size || 512,
          type: exportFormat === "svg" ? "svg" : "canvas",
          data: item.payload,
          margin: 16,
          qrOptions: {
            errorCorrectionLevel: styleOptions.errorCorrectionLevel,
          },
          dotsOptions: {
            type: styleOptions.dotStyle,
            color: styleOptions.colorType === "single" ? styleOptions.darkColor : undefined,
            gradient:
              styleOptions.colorType === "gradient"
                ? {
                  type: styleOptions.gradientType,
                  rotation: (styleOptions.gradientRotation * Math.PI) / 180,
                  colorStops: [
                    { offset: 0, color: styleOptions.gradientColor1 },
                    { offset: 1, color: styleOptions.gradientColor2 },
                  ],
                }
                : undefined,
          },
          backgroundOptions: {
            color: styleOptions.isTransparent ? "transparent" : styleOptions.lightColor,
          },
          cornersSquareOptions: {
            type: styleOptions.cornerSquareStyle,
            color: styleOptions.eyeFrameColor || styleOptions.darkColor,
          },
          cornersDotOptions: {
            type: styleOptions.cornerDotStyle,
            color: styleOptions.eyeDotColor || styleOptions.darkColor,
          },
        };

        if (styleOptions.logoSrc) {
          qrOptions.image = styleOptions.logoSrc;
          qrOptions.imageOptions = {
            hideBackgroundDots: styleOptions.logoHideBackgroundDots,
            imageSize: styleOptions.logoSize,
            margin: 4,
            crossOrigin: "anonymous",
          };
        }

        const qrCode = new QRCodeStyling(qrOptions);
        const rawData = await qrCode.getRawData(exportFormat);

        if (rawData) {
          const safeLabel = item.label.replace(/[^a-zA-Z0-9_-]/g, "_");
          const filename = `${i + 1}_${safeLabel}.${exportFormat}`;
          zip.file(filename, rawData);
        }

        setProgress(i + 1);
        // Micro-yield to UI thread so progress updates smoothly
        await new Promise((r) => setTimeout(r, 10));
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `sajilo_qrcodes_batch.${exportFormat === "svg" ? "zip" : "zip"}`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Batch QR generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  const items = parseInput();

  return (
    <div className="space-y-4 p-5 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
            <Archive size={16} className="text-[#F5A623]" /> Batch QR Code Generator
          </h3>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Generate multiple QR codes at once for restaurant tables, event tickets, or product labels.
          </p>
        </div>

        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-medium text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F0EDE8] transition-colors cursor-pointer shrink-0">
          <Upload size={12} className="text-[#F5A623]" />
          Import CSV / Text
          <input type="file" accept=".csv, .txt" onChange={handleCsvUpload} className="hidden" />
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
          Batch Input (Format: <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">Label, Content/URL</code> or one URL per line)
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
          placeholder="Table 1, https://menu.com/1&#10;Table 2, https://menu.com/2"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5] font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
        />
        <div className="flex items-center justify-between text-[11px] text-[#71717A] dark:text-[#A1A1AA] mt-1">
          <span>Detected: {items.length} item(s)</span>
          <span className="text-amber-600 dark:text-amber-400">Soft Limit: 100 rows per zip run</span>
        </div>
      </div>

      {/* Export Settings & Run */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-medium text-[#18181B] dark:text-[#F4F4F5]">Format:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="batchFormat"
              checked={exportFormat === "png"}
              onChange={() => setExportFormat("png")}
              className="text-[#F5A623] focus:ring-[#F5A623]/40"
            />
            <span>PNG</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="batchFormat"
              checked={exportFormat === "svg"}
              onChange={() => setExportFormat("svg")}
              className="text-[#F5A623] focus:ring-[#F5A623]/40"
            />
            <span>Vector SVG</span>
          </label>
        </div>

        <button
          type="button"
          disabled={isGenerating || items.length === 0}
          onClick={generateBatchZip}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isGenerating ? (
            <>Generating Batch ({progress}/{totalCount})...</>
          ) : (
            <>
              <Play size={14} /> Download {items.length} QRs as ZIP
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="space-y-1.5 pt-2">
          <div className="w-full bg-[#E4E0D8] dark:bg-[#2A2F48] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#F5A623] h-full transition-all duration-200"
              style={{ width: `${(progress / totalCount) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] text-right font-mono">
            {Math.round((progress / totalCount) * 100)}% completed
          </p>
        </div>
      )}
    </div>
  );
}
