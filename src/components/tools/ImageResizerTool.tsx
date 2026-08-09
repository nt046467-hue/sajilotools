"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  Trash2,
  Loader2,
  Archive,
  Sliders,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  Maximize2,
  Eye,
} from "lucide-react";
import JSZip from "jszip";
import ImageDropzone from "./shared/ImageDropzone";

interface ResizerItem {
  id: string;
  originalFile: File;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
  targetWidth: number;
  targetHeight: number;
  resizedBlob: Blob | null;
  resizedSize: number | null;
  resizedUrl: string | null;
  status: "idle" | "resizing" | "done" | "error";
  error: string | null;
}

type ResizeMode = "dimensions" | "percentage";
type OutputFormat = "original" | "image/jpeg" | "image/webp" | "image/png";

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getAspectRatioStr(w: number, h: number): string {
  if (!w || !h) return "1:1";
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(w, h);
  const rw = Math.round(w / divisor);
  const rh = Math.round(h / divisor);
  if (rw <= 32 && rh <= 32) return `${rw}:${rh}`;
  return `${(w / h).toFixed(2)}:1`;
}

export default function ImageResizerTool() {
  const [items, setItems] = useState<ResizerItem[]>([]);
  const [mode, setMode] = useState<ResizeMode>("dimensions");
  const [targetWidth, setTargetWidth] = useState<number>(1280);
  const [targetHeight, setTargetHeight] = useState<number>(720);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [scalePercentage, setScalePercentage] = useState<number>(50);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
  const [quality] = useState<number>(90);

  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [livePreviewW, setLivePreviewW] = useState<number>(0);
  const [livePreviewH, setLivePreviewH] = useState<number>(0);
  const [livePreviewBytes, setLivePreviewBytes] = useState<number | null>(null);

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
        if (item.resizedUrl) URL.revokeObjectURL(item.resizedUrl);
      });
      if (livePreviewUrl) URL.revokeObjectURL(livePreviewUrl);
    };
  }, []);

  const handleFilesAdded = (files: File[]) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    files.forEach((file) => {
      const origUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || 800;
        const height = img.naturalHeight || 600;

        let initW = targetWidth;
        let initH = targetHeight;
        if (items.length === 0) {
          initW = Math.round(width * 0.5);
          initH = Math.round(height * 0.5);
          setTargetWidth(initW);
          setTargetHeight(initH);
        }

        const newItem: ResizerItem = {
          id: Math.random().toString(36).substring(2, 9),
          originalFile: file,
          originalSize: file.size,
          originalWidth: width,
          originalHeight: height,
          originalUrl: origUrl,
          targetWidth: initW,
          targetHeight: initH,
          resizedBlob: null,
          resizedSize: null,
          resizedUrl: null,
          status: "idle",
          error: null,
        };

        setItems((prev) => {
          const next = [...prev, newItem];
          if (next.length === 1) setSelectedPreviewId(newItem.id);
          return next;
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(origUrl);
      };
      img.src = origUrl;
    });
  };

  const previewItem = items.find((i) => i.id === selectedPreviewId) || items[0];

  // Instant Live Canvas Preview Effect
  useEffect(() => {
    if (!previewItem) {
      setLivePreviewUrl(null);
      return;
    }

    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (isCancelled) return;
      let finalW = targetWidth;
      let finalH = targetHeight;

      if (mode === "percentage") {
        finalW = Math.round(previewItem.originalWidth * (scalePercentage / 100));
        finalH = Math.round(previewItem.originalHeight * (scalePercentage / 100));
      } else if (lockAspect) {
        const aspect = previewItem.originalWidth / previewItem.originalHeight;
        finalW = targetWidth;
        finalH = Math.round(targetWidth / aspect);
      }

      finalW = Math.max(1, finalW);
      finalH = Math.max(1, finalH);

      const canvas = document.createElement("canvas");
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, finalW, finalH);

      let mimeType = previewItem.originalFile.type || "image/jpeg";
      if (outputFormat !== "original") mimeType = outputFormat;

      canvas.toBlob(
        (blob) => {
          if (isCancelled || !blob) return;
          const url = URL.createObjectURL(blob);
          setLivePreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          setLivePreviewW(finalW);
          setLivePreviewH(finalH);
          setLivePreviewBytes(blob.size);
        },
        mimeType,
        quality / 100
      );
    };

    img.src = previewItem.originalUrl;

    return () => {
      isCancelled = true;
    };
  }, [
    previewItem,
    targetWidth,
    targetHeight,
    mode,
    scalePercentage,
    lockAspect,
    outputFormat,
    quality,
  ]);

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && items.length > 0 && previewItem) {
      const ratio = previewItem.originalWidth / previewItem.originalHeight;
      if (ratio > 0) {
        setTargetHeight(Math.round(val / ratio));
      }
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && items.length > 0 && previewItem) {
      const ratio = previewItem.originalWidth / previewItem.originalHeight;
      if (ratio > 0) {
        setTargetWidth(Math.round(val * ratio));
      }
    }
  };

  const applyPreset = (w: number, h: number) => {
    setMode("dimensions");
    setLockAspect(false);
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const applyScalePercentage = (pct: number) => {
    setMode("percentage");
    setScalePercentage(pct);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((i) => i.id === id);
      if (itemToRemove) {
        if (itemToRemove.originalUrl) URL.revokeObjectURL(itemToRemove.originalUrl);
        if (itemToRemove.resizedUrl) URL.revokeObjectURL(itemToRemove.resizedUrl);
      }
      const next = prev.filter((i) => i.id !== id);
      if (selectedPreviewId === id) {
        setSelectedPreviewId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
    setSuccessMessage(null);
  };

  const clearAll = () => {
    items.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.resizedUrl) URL.revokeObjectURL(item.resizedUrl);
    });
    if (livePreviewUrl) URL.revokeObjectURL(livePreviewUrl);
    setItems([]);
    setSelectedPreviewId(null);
    setLivePreviewUrl(null);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const resizeSingleImage = (item: ResizerItem): Promise<{ blob: Blob; url: string; w: number; h: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let finalW = targetWidth;
        let finalH = targetHeight;

        if (mode === "percentage") {
          finalW = Math.round(item.originalWidth * (scalePercentage / 100));
          finalH = Math.round(item.originalHeight * (scalePercentage / 100));
        } else if (lockAspect) {
          const aspect = item.originalWidth / item.originalHeight;
          finalW = targetWidth;
          finalH = Math.round(targetWidth / aspect);
        }

        finalW = Math.max(1, finalW);
        finalH = Math.max(1, finalH);

        const canvas = document.createElement("canvas");
        canvas.width = finalW;
        canvas.height = finalH;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to initialize canvas context."));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, finalW, finalH);

        let mimeType = item.originalFile.type || "image/jpeg";
        if (outputFormat !== "original") {
          mimeType = outputFormat;
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to export canvas blob."));
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve({ blob, url, w: finalW, h: finalH });
          },
          mimeType,
          quality / 100
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for resizing."));
      };

      img.src = item.originalUrl;
    });
  };

  const handleResizeAll = async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    let countDone = 0;

    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i];

      setItems((prev) =>
        prev.map((item) =>
          item.id === currentItem.id ? { ...item, status: "resizing", error: null } : item
        )
      );

      try {
        const result = await resizeSingleImage(currentItem);

        if (currentItem.resizedUrl) {
          URL.revokeObjectURL(currentItem.resizedUrl);
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === currentItem.id
              ? {
                  ...item,
                  status: "done",
                  targetWidth: result.w,
                  targetHeight: result.h,
                  resizedBlob: result.blob,
                  resizedSize: result.blob.size,
                  resizedUrl: result.url,
                }
              : item
          )
        );
        countDone++;
      } catch (err: any) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === currentItem.id
              ? { ...item, status: "error", error: err?.message || "Resize failed." }
              : item
          )
        );
      }
    }

    setIsProcessing(false);
    if (countDone > 0) {
      setSuccessMessage(`Successfully resized ${countDone} ${countDone === 1 ? "image" : "images"}!`);
    }
  };

  const getOutputExt = (originalName: string): string => {
    if (outputFormat === "image/jpeg") return ".jpg";
    if (outputFormat === "image/webp") return ".webp";
    if (outputFormat === "image/png") return ".png";
    const dotIdx = originalName.lastIndexOf(".");
    return dotIdx > 0 ? originalName.substring(dotIdx) : ".png";
  };

  const getBaseName = (originalName: string): string => {
    const dotIdx = originalName.lastIndexOf(".");
    return dotIdx > 0 ? originalName.substring(0, dotIdx) : originalName;
  };

  const downloadItem = (item: ResizerItem) => {
    if (!item.resizedUrl && !item.resizedBlob) return;
    const link = document.createElement("a");
    const ext = getOutputExt(item.originalFile.name);
    const baseName = getBaseName(item.originalFile.name);
    link.download = `${baseName}_${item.targetWidth}x${item.targetHeight}${ext}`;
    link.href = item.resizedUrl || URL.createObjectURL(item.resizedBlob!);
    link.click();
  };

  const downloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === "done" && i.resizedBlob);
    if (doneItems.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();

      doneItems.forEach((item) => {
        const ext = getOutputExt(item.originalFile.name);
        const baseName = getBaseName(item.originalFile.name);
        const fileName = `${baseName}_${item.targetWidth}x${item.targetHeight}${ext}`;

        zip.file(fileName, item.resizedBlob!);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = "resized_images.zip";
      link.click();
      URL.revokeObjectURL(zipUrl);
    } catch (err: any) {
      setErrorMessage("Failed to generate ZIP archive.");
    } finally {
      setIsZipping(false);
    }
  };

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center justify-between text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <ShieldCheck className="text-[#7C3AED] shrink-0" size={20} />
          <span>
            🔒 <strong>100% In-Browser Image Resizing:</strong> Canvas resizing runs entirely inside your browser. No photos leave your device.
          </span>
        </div>
      </div>

      {/* Upload Dropzone */}
      <ImageDropzone onFilesSelected={handleFilesAdded} multiple={true} />

      {/* Controls, Live Preview & File List section */}
      {items.length > 0 && (
        <div className="space-y-6 pt-2">
          {/* File selector tabs if multiple */}
          {items.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] shrink-0 mr-1">
                Previewing Image:
              </span>
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedPreviewId(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                    (selectedPreviewId === item.id || (!selectedPreviewId && idx === 0))
                      ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm"
                      : "bg-white dark:bg-[#141829] border-[#E4E0D8] dark:border-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#7C3AED]"
                  }`}
                >
                  <span className="truncate max-w-[120px]">{item.originalFile.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Grid Layout: Controls (Left) + Real-Time Live Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Resize Controls */}
            <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-4">
                <h3 className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                  <Sliders size={18} className="text-[#7C3AED]" />
                  Resize Settings
                </h3>

                {/* Mode Toggle */}
                <div className="flex items-center bg-[#F7F5F0] dark:bg-[#0C0F1E] p-1 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338]">
                  <button
                    onClick={() => setMode("dimensions")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === "dimensions"
                        ? "bg-[#7C3AED] text-white shadow-sm"
                        : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                  >
                    Dimensions (px)
                  </button>
                  <button
                    onClick={() => setMode("percentage")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === "percentage"
                        ? "bg-[#7C3AED] text-white shadow-sm"
                        : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                  >
                    Percentage (%)
                  </button>
                </div>
              </div>

              {/* Input Area */}
              {mode === "dimensions" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Target Width */}
                    <div>
                      <label className="block text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={targetWidth}
                        onChange={(e) => handleWidthChange(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                      />
                    </div>

                    {/* Target Height & Aspect Lock */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                          Height (px)
                        </label>
                        <button
                          onClick={() => setLockAspect(!lockAspect)}
                          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                            lockAspect
                              ? "bg-[#7C3AED]/15 text-[#7C3AED]"
                              : "bg-[#E4E0D8]/50 dark:bg-[#1E2338] text-[#71717A]"
                          }`}
                          title={lockAspect ? "Aspect Ratio Locked" : "Aspect Ratio Unlocked"}
                        >
                          {lockAspect ? <Lock size={12} /> : <Unlock size={12} />}
                          {lockAspect ? "Lock Aspect" : "Freeform"}
                        </button>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={targetHeight}
                        onChange={(e) => handleHeightChange(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                      />
                    </div>
                  </div>

                  {/* Format Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2">
                      Output Format
                    </label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                    >
                      <option value="original">Keep Original Format</option>
                      <option value="image/jpeg">Convert to JPEG (.jpg)</option>
                      <option value="image/webp">Convert to WebP (.webp)</option>
                      <option value="image/png">Convert to PNG (.png)</option>
                    </select>
                  </div>

                  {/* Dimension Presets */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#71717A] dark:text-[#A1A1AA] mb-2">
                      Quick Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => applyPreset(1920, 1080)}
                        className="px-2.5 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#F7F5F0] dark:bg-[#0C0F1E] text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                      >
                        1080p (1920×1080)
                      </button>
                      <button
                        onClick={() => applyPreset(1280, 720)}
                        className="px-2.5 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#F7F5F0] dark:bg-[#0C0F1E] text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                      >
                        720p (1280×720)
                      </button>
                      <button
                        onClick={() => applyPreset(1080, 1080)}
                        className="px-2.5 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#F7F5F0] dark:bg-[#0C0F1E] text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                      >
                        Square (1080×1080)
                      </button>
                      <button
                        onClick={() => applyPreset(500, 500)}
                        className="px-2.5 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#F7F5F0] dark:bg-[#0C0F1E] text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                      >
                        Avatar (500×500)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                        Scale Percentage
                      </label>
                      <span className="text-xs font-extrabold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-md">
                        {scalePercentage}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={scalePercentage}
                      onChange={(e) => setScalePercentage(Number(e.target.value))}
                      className="w-full accent-[#7C3AED] cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[25, 50, 75, 125, 150, 200].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => applyScalePercentage(pct)}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                            scalePercentage === pct
                              ? "bg-[#7C3AED] text-white"
                              : "bg-[#F7F5F0] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] text-[#18181B] dark:text-[#F4F4F5]"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2">
                      Output Format
                    </label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                    >
                      <option value="original">Keep Original Format</option>
                      <option value="image/jpeg">Convert to JPEG (.jpg)</option>
                      <option value="image/webp">Convert to WebP (.webp)</option>
                      <option value="image/png">Convert to PNG (.png)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Right: REAL-TIME LIVE PREVIEW CARD */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-3">
                <h4 className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5 uppercase tracking-wider">
                  <Eye size={16} className="text-[#7C3AED]" />
                  Live Preview
                </h4>

                {previewItem && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#7C3AED]/15 text-[#7C3AED]">
                    Aspect {getAspectRatioStr(livePreviewW, livePreviewH)}
                  </span>
                )}
              </div>

              {/* Canvas Preview Container */}
              {previewItem ? (
                <div className="space-y-3">
                  <div className="relative w-full h-52 rounded-xl bg-[#F7F5F0] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] overflow-hidden flex items-center justify-center p-2">
                    {livePreviewUrl ? (
                      <img
                        src={livePreviewUrl}
                        alt="Live preview"
                        className="max-w-full max-h-full object-contain drop-shadow-sm transition-all duration-200"
                      />
                    ) : (
                      <Loader2 size={24} className="animate-spin text-[#7C3AED]" />
                    )}
                  </div>

                  {/* Live Metrics Comparison */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#F5F3FF]/60 dark:bg-[#2E1065]/20 p-3 rounded-xl border border-[#7C3AED]/20">
                    <div>
                      <p className="text-[10px] font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase">
                        Original
                      </p>
                      <p className="font-extrabold text-[#18181B] dark:text-[#F4F4F5]">
                        {previewItem.originalWidth}×{previewItem.originalHeight} px
                      </p>
                      <p className="text-[11px] font-semibold text-[#71717A]">
                        {formatBytes(previewItem.originalSize)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-[#7C3AED] uppercase">
                        New Resized
                      </p>
                      <p className="font-extrabold text-[#7C3AED]">
                        {livePreviewW}×{livePreviewH} px
                      </p>
                      <p className="text-[11px] font-bold text-[#18181B] dark:text-[#F4F4F5]">
                        ~{livePreviewBytes ? formatBytes(livePreviewBytes) : "Calculating..."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-[#71717A] text-xs">
                  Upload an image to see live preview
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F5F3FF]/60 dark:bg-[#2E1065]/20 p-4 rounded-2xl border border-[#7C3AED]/20">
            <div className="text-xs text-[#18181B] dark:text-[#F4F4F5] font-semibold">
              Selected: <strong>{items.length} {items.length === 1 ? "image" : "images"}</strong>
              {mode === "dimensions" ? (
                <span> • Target Size: <strong>{targetWidth} × {targetHeight} px</strong></span>
              ) : (
                <span> • Scale: <strong>{scalePercentage}% of original</strong></span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={clearAll}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-colors disabled:opacity-50"
              >
                Clear All
              </button>

              <button
                onClick={handleResizeAll}
                disabled={isProcessing || items.length === 0}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-xs bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Resizing...</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={16} />
                    <span>Resize {items.length} {items.length === 1 ? "Image" : "Images"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success / Error Messages */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 size={18} /> {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {/* File Cards with Download */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  item.status === "error"
                    ? "bg-rose-500/5 border-rose-500/30"
                    : item.status === "done"
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-white dark:bg-[#141829] border-[#E4E0D8] dark:border-[#1E2338]"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F7F5F0] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] shrink-0 flex items-center justify-center">
                      <img
                        src={item.resizedUrl || item.originalUrl}
                        alt={item.originalFile.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] truncate max-w-[200px]">
                        {item.originalFile.name}
                      </p>
                      <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                        {item.originalWidth}×{item.originalHeight} • {formatBytes(item.originalSize)}
                        {item.status === "done" && item.resizedSize != null && (
                          <span className="text-[#7C3AED] font-bold"> → {item.targetWidth}×{item.targetHeight} • {formatBytes(item.resizedSize)}</span>
                        )}
                      </p>
                      {item.status === "resizing" && (
                        <p className="text-[11px] text-[#7C3AED] font-semibold flex items-center gap-1 mt-0.5">
                          <Loader2 size={12} className="animate-spin" /> Resizing...
                        </p>
                      )}
                      {item.status === "error" && (
                        <p className="text-[11px] text-rose-500 font-semibold mt-0.5">{item.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === "done" && (
                      <button
                        onClick={() => downloadItem(item)}
                        className="px-3 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Download size={14} /> Download
                      </button>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] hover:text-rose-500 hover:border-rose-300 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Download All ZIP */}
          {doneCount > 1 && (
            <div className="flex justify-center pt-2">
              <button
                onClick={downloadAllZip}
                disabled={isZipping}
                className="px-6 py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm transition-all shadow-lg shadow-[#7C3AED]/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isZipping ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Creating ZIP...
                  </>
                ) : (
                  <>
                    <Archive size={18} /> Download All as ZIP ({doneCount} images)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
