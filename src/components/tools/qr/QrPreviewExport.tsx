"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, FileCode, Copy, Check, QrCode } from "lucide-react";
import { QrStyleOptions } from "./types";

interface QrPreviewExportProps {
  payload: string;
  isFormValid: boolean;
  styleOptions: QrStyleOptions;
  onStyleChange: (updated: Partial<QrStyleOptions>) => void;
}

export default function QrPreviewExport({
  payload,
  isFormValid,
  styleOptions,
  onStyleChange,
}: QrPreviewExportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [hasQr, setHasQr] = useState(false);

  // Initialize and update qr-code-styling instance
  useEffect(() => {
    if (!payload || !isFormValid) {
      setHasQr(false);
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      return;
    }

    let isMounted = true;
    setIsRendering(true);

    import("qr-code-styling").then((module) => {
      if (!isMounted) return;
      const QRCodeStyling = module.default;

      // Build options for qr-code-styling
      const qrOptions: any = {
        width: 280,
        height: 280,
        type: "canvas",
        data: payload,
        margin: 10,
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

      if (!qrInstanceRef.current) {
        qrInstanceRef.current = new QRCodeStyling(qrOptions);
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          qrInstanceRef.current.append(containerRef.current);
        }
      } else {
        qrInstanceRef.current.update(qrOptions);
      }

      setHasQr(true);
      setIsRendering(false);
    });

    return () => {
      isMounted = false;
    };
  }, [payload, isFormValid, styleOptions]);

  // Export functions helper
  async function getExportInstance(exportSize: number, extension: "png" | "svg") {
    const module = await import("qr-code-styling");
    const QRCodeStyling = module.default;

    const qrOptions: any = {
      width: exportSize,
      height: exportSize,
      type: extension === "svg" ? "svg" : "canvas",
      data: payload,
      margin: Math.round(exportSize * 0.04),
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

    return new QRCodeStyling(qrOptions);
  }

  async function handleDownloadPng() {
    if (!hasQr || !payload) return;
    try {
      const exportQr = await getExportInstance(styleOptions.size, "png");
      await exportQr.download({
        name: `qrcode_${styleOptions.size}px`,
        extension: "png",
      });
    } catch (err) {
      console.error("PNG download error:", err);
    }
  }

  async function handleDownloadSvg() {
    if (!hasQr || !payload) return;
    try {
      const exportQr = await getExportInstance(styleOptions.size, "svg");
      await exportQr.download({
        name: "qrcode_vector",
        extension: "svg",
      });
    } catch (err) {
      console.error("SVG download error:", err);
    }
  }

  async function handleCopyImage() {
    if (!hasQr || !payload) return;
    try {
      const exportQr = await getExportInstance(512, "png");
      const raw = await exportQr.getRawData("png");
      if (raw) {
        const imageBlob = raw instanceof Blob ? raw : new Blob([raw as unknown as BlobPart], { type: "image/png" });
        await navigator.clipboard.write([new ClipboardItem({ "image/png": imageBlob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Copy image error:", err);
    }
  }

  const sizes = [256, 512, 1024, 2048];

  return (
    <div className="flex flex-col items-center gap-5 p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="w-full flex items-center justify-between">
        <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
          Live QR Preview
        </span>
        {hasQr && (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
            Ready to Export
          </span>
        )}
      </div>

      {/* Render Box */}
      <div className="relative flex items-center justify-center p-6 rounded-2xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] min-h-[300px] w-full max-w-[320px] shadow-inner overflow-hidden">
        <div
          ref={containerRef}
          className={`transition-all duration-300 flex items-center justify-center ${
            hasQr ? "opacity-100 scale-100" : "opacity-0 scale-95 hidden"
          }`}
        />

        {!hasQr && (
          <div className="text-center py-12 text-[#A1A1AA]">
            <QrCode size={48} className="mx-auto mb-3 opacity-30 animate-pulse" />
            <p className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA]">
              Complete required fields to render QR code
            </p>
          </div>
        )}
      </div>

      {/* PNG Resolution Selector */}
      {hasQr && (
        <div className="w-full space-y-2 pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#71717A] dark:text-[#A1A1AA] font-medium">
              Export PNG Resolution
            </span>
            <span className="font-mono text-[11px] text-[#18181B] dark:text-[#F4F4F5]">
              {styleOptions.size} × {styleOptions.size} px
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStyleChange({ size: s })}
                className={`py-1 rounded text-xs font-medium border transition-colors ${
                  styleOptions.size === s
                    ? "border-[#F5A623] bg-[#F5A623]/10 text-[#18181B] dark:text-[#F4F4F5] font-bold"
                    : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA]"
                }`}
              >
                {s}px
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Download & Copy Buttons */}
      {hasQr && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Download size={14} /> PNG ({styleOptions.size}px)
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] bg-[#FAFAF8] dark:bg-[#1E2338] rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <FileCode size={14} className="text-[#F5A623]" /> Vector SVG
          </button>
          <button
            type="button"
            onClick={handleCopyImage}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] dark:text-[#A1A1AA] rounded-xl text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Image"}
          </button>
        </div>
      )}
    </div>
  );
}
