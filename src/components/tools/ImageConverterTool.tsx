"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  Trash2,
  Loader2,
  Archive,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCode,
} from "lucide-react";
import JSZip from "jszip";
import ImageDropzone from "./shared/ImageDropzone";

interface ConverterItem {
  id: string;
  originalFile: File;
  originalSize: number;
  originalFormat: string;
  originalUrl: string;
  convertedBlob: Blob | null;
  convertedSize: number | null;
  convertedUrl: string | null;
  status: "idle" | "converting" | "done" | "error";
  error: string | null;
}

type TargetFormat = "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml" | "image/bmp";

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getFormatBadge(mimeType: string, fileName: string): string {
  if (mimeType.includes("svg") || fileName.endsWith(".svg")) return "SVG";
  if (mimeType.includes("png") || fileName.endsWith(".png")) return "PNG";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "JPG";
  if (mimeType.includes("webp") || fileName.endsWith(".webp")) return "WEBP";
  if (mimeType.includes("gif") || fileName.endsWith(".gif")) return "GIF";
  if (mimeType.includes("bmp") || fileName.endsWith(".bmp")) return "BMP";
  return "IMAGE";
}

function getTargetExtension(format: TargetFormat): string {
  if (format === "image/jpeg") return ".jpg";
  if (format === "image/webp") return ".webp";
  if (format === "image/png") return ".png";
  if (format === "image/svg+xml") return ".svg";
  if (format === "image/bmp") return ".bmp";
  return ".img";
}

export default function ImageConverterTool() {
  const [items, setItems] = useState<ConverterItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("image/webp");
  const [quality, setQuality] = useState<number>(90); // 0 to 100

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Revoke object URLs on unmount
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      });
    };
  }, []);

  const handleFilesAdded = (files: File[]) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    const newItems: ConverterItem[] = files.map((file) => {
      const origUrl = URL.createObjectURL(file);
      const fmt = getFormatBadge(file.type, file.name);
      return {
        id: Math.random().toString(36).substring(2, 9),
        originalFile: file,
        originalSize: file.size,
        originalFormat: fmt,
        originalUrl: origUrl,
        convertedBlob: null,
        convertedSize: null,
        convertedUrl: null,
        status: "idle",
        error: null,
      };
    });

    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((i) => i.id === id);
      if (itemToRemove) {
        if (itemToRemove.originalUrl) URL.revokeObjectURL(itemToRemove.originalUrl);
        if (itemToRemove.convertedUrl) URL.revokeObjectURL(itemToRemove.convertedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
    setSuccessMessage(null);
  };

  const clearAll = () => {
    items.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setItems([]);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const convertSingleImage = async (item: ConverterItem): Promise<{ blob: Blob; url: string }> => {
    const isInputSvg = item.originalFile.type.includes("svg") || item.originalFile.name.toLowerCase().endsWith(".svg");

    // CASE 1: Target Format is SVG
    if (targetFormat === "image/svg+xml") {
      if (isInputSvg) {
        // SVG to SVG: re-blob
        const text = await item.originalFile.text();
        const blob = new Blob([text], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        return { blob, url };
      }

      // Raster to SVG wrapper
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const w = img.naturalWidth || 800;
          const h = img.naturalHeight || 600;
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context initialization failed."));
            return;
          }
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image href="${dataUrl}" width="${w}" height="${h}"/>
</svg>`;
          const blob = new Blob([svgContent], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          resolve({ blob, url });
        };
        img.onerror = () => reject(new Error("Failed to read image for SVG conversion."));
        img.src = item.originalUrl;
      });
    }

    // CASE 2: Input is SVG, Target is Raster (PNG, JPG, WEBP, BMP)
    if (isInputSvg) {
      const svgText = await item.originalFile.text();
      
      let width = 1024;
      let height = 1024;
      
      const viewBoxMatch = svgText.match(/viewBox=["']\s*([\d.-]+)[\s,]+([\d.-]+)[\s,]+([\d.-]+)[\s,]+([\d.-]+)\s*["']/i);
      if (viewBoxMatch) {
        const vbW = parseFloat(viewBoxMatch[3]);
        const vbH = parseFloat(viewBoxMatch[4]);
        if (vbW > 0 && vbH > 0) {
          width = vbW;
          height = vbH;
        }
      } else {
        const widthMatch = svgText.match(/width=["']\s*([\d.]+)(px)?\s*["']/i);
        const heightMatch = svgText.match(/height=["']\s*([\d.]+)(px)?\s*["']/i);
        if (widthMatch && heightMatch) {
          const wVal = parseFloat(widthMatch[1]);
          const hVal = parseFloat(heightMatch[1]);
          if (wVal > 0 && hVal > 0) {
            width = wVal;
            height = hVal;
          }
        }
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(16, width);
          canvas.height = Math.max(16, height);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context failed."));
            return;
          }
          if (targetFormat === "image/jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Format conversion failed."));
              const url = URL.createObjectURL(blob);
              resolve({ blob, url });
            },
            targetFormat,
            quality / 100
          );
        };
        img.onerror = () => reject(new Error("Failed to decode SVG image."));
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
      });
    }

    // CASE 3: Standard Raster to Raster
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context initialization failed."));
          return;
        }

        if (targetFormat === "image/jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Format conversion failed."));
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve({ blob, url });
          },
          targetFormat,
          quality / 100
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to decode image file."));
      };

      img.src = item.originalUrl;
    });
  };

  const handleConvertAll = async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    let countDone = 0;

    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i];

      setItems((prev) =>
        prev.map((item) =>
          item.id === currentItem.id ? { ...item, status: "converting", error: null } : item
        )
      );

      try {
        const result = await convertSingleImage(currentItem);

        if (currentItem.convertedUrl) {
          URL.revokeObjectURL(currentItem.convertedUrl);
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === currentItem.id
              ? {
                  ...item,
                  status: "done",
                  convertedBlob: result.blob,
                  convertedSize: result.blob.size,
                  convertedUrl: result.url,
                }
              : item
          )
        );
        countDone++;
      } catch (err: any) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === currentItem.id
              ? { ...item, status: "error", error: err?.message || "Conversion failed." }
              : item
          )
        );
      }
    }

    setIsProcessing(false);
    if (countDone > 0) {
      setSuccessMessage(`Successfully converted ${countDone} ${countDone === 1 ? "image" : "images"}!`);
    }
  };

  const downloadItem = (item: ConverterItem) => {
    if (!item.convertedUrl && !item.convertedBlob) return;
    const link = document.createElement("a");

    const ext = getTargetExtension(targetFormat);
    const baseName = item.originalFile.name.substring(0, item.originalFile.name.lastIndexOf(".")) || item.originalFile.name;
    link.download = `${baseName}_converted${ext}`;
    link.href = item.convertedUrl || URL.createObjectURL(item.convertedBlob!);
    link.click();
  };

  const downloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === "done" && i.convertedBlob);
    if (doneItems.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();

      doneItems.forEach((item) => {
        const ext = getTargetExtension(targetFormat);
        const baseName = item.originalFile.name.substring(0, item.originalFile.name.lastIndexOf(".")) || item.originalFile.name;
        zip.file(`${baseName}_converted${ext}`, item.convertedBlob!);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(content);

      const link = document.createElement("a");
      link.download = `converted_images_${Date.now()}.zip`;
      link.href = zipUrl;
      link.click();

      setTimeout(() => URL.revokeObjectURL(zipUrl), 10000);
    } catch (error) {
      setErrorMessage("Failed to create ZIP archive.");
    } finally {
      setIsZipping(false);
    }
  };

  const doneCount = items.filter((i) => i.status === "done").length;
  const isAnyConverted = doneCount > 0;

  return (
    <div className="space-y-8">
      {/* Tool Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FAFAF8] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#18181B] dark:text-[#F4F4F5]">
                Batch Image & SVG Converter
              </h2>
            </div>
            <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              Convert SVG, PNG, JPG, WebP, GIF & BMP images to any format in seconds. 100% private, client-side processing.
            </p>
          </div>

          {/* Quick Security Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start md:self-auto">
            <ShieldCheck size={16} />
            <span>Client-side Privacy Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Target Format & Controls Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
          <Sliders size={18} className="text-[#2563EB]" />
          <span>Conversion Settings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Format Picker */}
          <div>
            <label className="block text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider mb-2.5">
              Target Output Format
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "WebP", value: "image/webp", desc: "Smallest size" },
                { label: "PNG", value: "image/png", desc: "Transparent" },
                { label: "JPG", value: "image/jpeg", desc: "Universal" },
                { label: "SVG", value: "image/svg+xml", desc: "Vector" },
                { label: "BMP", value: "image/bmp", desc: "Uncompressed" },
              ].map((fmt) => {
                const isSelected = targetFormat === fmt.value;
                return (
                  <button
                    key={fmt.value}
                    type="button"
                    onClick={() => setTargetFormat(fmt.value as TargetFormat)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-[#2563EB]/20 scale-[1.02]"
                        : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] border-[#E4E0D8] dark:border-[#2A2F48] hover:border-[#2563EB]"
                    }`}
                  >
                    <span className="font-extrabold text-sm">{fmt.label}</span>
                    <span
                      className={`text-[10px] hidden sm:block ${
                        isSelected ? "text-white/80" : "text-[#71717A] dark:text-[#A1A1AA]"
                      }`}
                    >
                      {fmt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality Slider (For lossy formats like WebP & JPEG) */}
          <div className={targetFormat === "image/png" || targetFormat === "image/svg+xml" ? "opacity-40 pointer-events-none" : ""}>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
                Output Quality ({quality}%)
              </label>
              {targetFormat === "image/png" || targetFormat === "image/svg+xml" ? (
                <span className="text-[10px] text-[#71717A]">Lossless Format</span>
              ) : null}
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer h-2 bg-[#E4E0D8] dark:bg-[#1E2338] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-[#71717A] mt-2">
              <span>Smaller File Size</span>
              <span>Highest Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <ImageDropzone
        onFilesSelected={handleFilesAdded}
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/svg+xml,.svg"
        description="Supports SVG, PNG, JPEG, WebP, GIF & BMP up to 25MB each"
      />

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Files List & Conversion Table */}
      {items.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E0D8] dark:border-[#1E2338] pb-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#18181B] dark:text-[#F4F4F5]">
                Uploaded Images ({items.length})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 size={14} /> Clear All
              </button>

              {isAnyConverted && (
                <button
                  type="button"
                  onClick={downloadAllZip}
                  disabled={isZipping}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isZipping ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
                  <span>Download ZIP ({doneCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleConvertAll}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-md shadow-[#2563EB]/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    <span>Convert All ({items.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Items Grid / Table */}
          <div className="divide-y divide-[#E4E0D8] dark:divide-[#1E2338]">
            {items.map((item) => {
              const targetBadge = getFormatBadge(targetFormat, getTargetExtension(targetFormat));
              return (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Image Preview & Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                      {item.originalFormat === "SVG" ? (
                        <FileCode size={24} className="text-[#2563EB]" />
                      ) : (
                        <img
                          src={item.originalUrl}
                          alt={item.originalFile.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] truncate">
                        {item.originalFile.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                        <span className="px-2 py-0.5 rounded-md bg-[#2563EB]/10 text-[#2563EB] font-bold text-[10px]">
                          {item.originalFormat}
                        </span>
                        <span>•</span>
                        <span>{formatBytes(item.originalSize)}</span>
                        <ArrowRight size={12} className="text-[#71717A]" />
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                          {targetBadge}
                        </span>
                        {item.convertedSize && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatBytes(item.convertedSize)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {item.status === "converting" && (
                      <span className="text-xs text-[#2563EB] font-semibold flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin" /> Converting...
                      </span>
                    )}

                    {item.status === "error" && (
                      <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                        <AlertTriangle size={14} /> {item.error || "Failed"}
                      </span>
                    )}

                    {item.status === "done" && (
                      <button
                        type="button"
                        onClick={() => downloadItem(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Download size={14} /> Download
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={isProcessing}
                      className="p-2 rounded-xl text-[#71717A] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
