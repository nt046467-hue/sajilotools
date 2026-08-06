"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  Trash2,
  Loader2,
  RefreshCw,
  Archive,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Maximize2,
  FileArchive,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import JSZip from "jszip";
import imageCompression from "browser-image-compression";
import ImageDropzone from "./shared/ImageDropzone";

interface CompressedItem {
  id: string;
  originalFile: File;
  originalSize: number;
  originalUrl: string;
  compressedBlob: Blob | File | null;
  compressedSize: number | null;
  compressedUrl: string | null;
  status: "idle" | "compressing" | "done" | "error";
  error: string | null;
  reductionPercentage: number | null;
}

type CompressionMode = "quality" | "targetSize";
type OutputFormat = "original" | "image/jpeg" | "image/webp" | "image/png";

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function ImageCompressorTool() {
  const [items, setItems] = useState<CompressedItem[]>([]);
  const [mode, setMode] = useState<CompressionMode>("quality");
  const [quality, setQuality] = useState<number>(80); // 0 to 100
  const [targetSizeKB, setTargetSizeKB] = useState<number>(200); // target size in KB
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
  const [enableResize, setEnableResize] = useState<boolean>(false);
  const [maxDimension, setMaxDimension] = useState<number>(1920);

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
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      });
    };
  }, []);

  const handleFilesAdded = (files: File[]) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    const newItems: CompressedItem[] = files.map((file) => {
      const origUrl = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).substring(2, 9),
        originalFile: file,
        originalSize: file.size,
        originalUrl: origUrl,
        compressedBlob: null,
        compressedSize: null,
        compressedUrl: null,
        status: "idle",
        error: null,
        reductionPercentage: null,
      };
    });

    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((i) => i.id === id);
      if (itemToRemove) {
        if (itemToRemove.originalUrl) URL.revokeObjectURL(itemToRemove.originalUrl);
        if (itemToRemove.compressedUrl) URL.revokeObjectURL(itemToRemove.compressedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
    setSuccessMessage(null);
  };

  const clearAll = () => {
    items.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
    setItems([]);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const compressSingleItem = async (item: CompressedItem) => {
    const options: any = {
      useWebWorker: true,
      initialQuality: quality / 100,
    };

    if (mode === "quality") {
      // Calculate target maxSizeMB based on quality percentage to ensure real compression ratio
      const proportionalTargetMB = (item.originalSize / (1024 * 1024)) * (quality / 100);
      options.maxSizeMB = Math.max(0.005, proportionalTargetMB);
    } else if (mode === "targetSize" && targetSizeKB > 0) {
      options.maxSizeMB = targetSizeKB / 1024;
    }

    if (enableResize && maxDimension > 0) {
      options.maxWidthOrHeight = maxDimension;
    }

    if (outputFormat !== "original") {
      options.fileType = outputFormat;
    }

    let compressedBlob: Blob | File = await imageCompression(item.originalFile, options);
    let compressedSize = compressedBlob.size;

    // Fallback: If compressed file is larger than original and no format conversion/resizing was requested,
    // keep the original file so we never bloat the image!
    const isFormatOrResizeChanged = outputFormat !== "original" || enableResize;
    if (compressedSize >= item.originalSize && !isFormatOrResizeChanged) {
      compressedBlob = item.originalFile;
      compressedSize = item.originalSize;
    }

    const compressedUrl = URL.createObjectURL(compressedBlob);

    let reductionPct = 0;
    if (compressedSize < item.originalSize) {
      reductionPct = Math.round(((item.originalSize - compressedSize) / item.originalSize) * 100);
    } else {
      reductionPct = 0;
    }

    return {
      compressedBlob,
      compressedSize,
      compressedUrl,
      reductionPercentage: reductionPct,
    };
  };

  const handleCompressAll = async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    let countDone = 0;

    // Process files sequentially to maintain responsive UI and bound memory
    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i];

      // Mark current file as compressing
      setItems((prev) =>
        prev.map((item) =>
          item.id === currentItem.id ? { ...item, status: "compressing", error: null } : item
        )
      );

      try {
        const result = await compressSingleItem(currentItem);
        
        // Clean up previous compressedUrl if re-compressing
        if (currentItem.compressedUrl) {
          URL.revokeObjectURL(currentItem.compressedUrl);
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === currentItem.id
              ? {
                  ...item,
                  status: "done",
                  compressedBlob: result.compressedBlob,
                  compressedSize: result.compressedSize,
                  compressedUrl: result.compressedUrl,
                  reductionPercentage: result.reductionPercentage,
                }
              : item
          )
        );
        countDone++;
      } catch (err: any) {
        console.error("Compression failed for", currentItem.originalFile.name, err);
        setItems((prev) =>
          prev.map((item) =>
            item.id === currentItem.id
              ? { ...item, status: "error", error: err?.message || "Failed to compress image." }
              : item
          )
        );
      }
    }

    setIsProcessing(false);
    if (countDone > 0) {
      setSuccessMessage(`Successfully compressed ${countDone} ${countDone === 1 ? "image" : "images"}!`);
    }
  };

  const downloadItem = (item: CompressedItem) => {
    if (!item.compressedUrl && !item.compressedBlob) return;
    const link = document.createElement("a");

    let ext = item.originalFile.name.substring(item.originalFile.name.lastIndexOf("."));
    if (outputFormat === "image/jpeg") ext = ".jpg";
    if (outputFormat === "image/webp") ext = ".webp";
    if (outputFormat === "image/png") ext = ".png";

    const baseName = item.originalFile.name.substring(0, item.originalFile.name.lastIndexOf(".")) || item.originalFile.name;
    link.download = `${baseName}_compressed${ext}`;
    link.href = item.compressedUrl || URL.createObjectURL(item.compressedBlob!);
    link.click();
  };

  const downloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === "done" && i.compressedBlob);
    if (doneItems.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();

      doneItems.forEach((item) => {
        let ext = item.originalFile.name.substring(item.originalFile.name.lastIndexOf("."));
        if (outputFormat === "image/jpeg") ext = ".jpg";
        if (outputFormat === "image/webp") ext = ".webp";
        if (outputFormat === "image/png") ext = ".png";

        const baseName = item.originalFile.name.substring(0, item.originalFile.name.lastIndexOf(".")) || item.originalFile.name;
        const fileName = `${baseName}_compressed${ext}`;

        zip.file(fileName, item.compressedBlob!);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = "compressed_images.zip";
      link.click();
      URL.revokeObjectURL(zipUrl);
    } catch (err: any) {
      setErrorMessage("Failed to generate ZIP archive.");
    } finally {
      setIsZipping(false);
    }
  };

  const totalOriginalSize = items.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalCompressedSize = items.reduce(
    (acc, curr) => acc + (curr.compressedSize || curr.originalSize),
    0
  );
  const doneCount = items.filter((i) => i.status === "done").length;
  const overallReduction =
    totalOriginalSize > 0 && doneCount > 0
      ? Math.max(0, Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100))
      : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center justify-between text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <ShieldCheck className="text-[#7C3AED] shrink-0" size={20} />
          <span>
            🔒 <strong>100% Client-Side Compression:</strong> Your photos are processed using Web Workers right inside your browser. No data ever leaves your device.
          </span>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <ImageDropzone onFilesSelected={handleFilesAdded} multiple={true} />

      {/* Controls & File List section */}
      {items.length > 0 && (
        <div className="space-y-6 pt-2">
          {/* Compression Configuration Panel */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-4">
              <h3 className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                <Sliders size={18} className="text-[#7C3AED]" />
                Compression Settings
              </h3>

              {/* Mode Toggle */}
              <div className="flex items-center bg-[#F7F5F0] dark:bg-[#0C0F1E] p-1 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338]">
                <button
                  onClick={() => setMode("quality")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === "quality"
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  By Quality
                </button>
                <button
                  onClick={() => setMode("targetSize")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === "targetSize"
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  Target File Size
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Option 1: Quality Slider or Target Size Input */}
              {mode === "quality" ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      Image Quality
                    </label>
                    <span className="text-xs font-extrabold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-md">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-[#7C3AED] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#71717A] dark:text-[#A1A1AA] mt-1 font-medium">
                    <span>Smaller file</span>
                    <span>Best quality</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2">
                    Max Target Size (KB)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={targetSizeKB}
                      onChange={(e) => setTargetSizeKB(Math.max(10, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                    />
                    <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA]">KB</span>
                  </div>
                  <p className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] mt-1 font-medium">
                    Iterates quality to keep file size under ~{targetSizeKB} KB
                  </p>
                </div>
              )}

              {/* Option 2: Output Format */}
              <div>
                <label className="block text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                >
                  <option value="original">Keep Original Format</option>
                  <option value="image/jpeg">Convert to JPEG (.jpg)</option>
                  <option value="image/webp">Convert to WebP (.webp)</option>
                  <option value="image/png">Convert to PNG (.png)</option>
                </select>
                <p className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] mt-1 font-medium">
                  WebP offers best compression efficiency
                </p>
              </div>

              {/* Option 3: Optional Resize */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="enableResize"
                    checked={enableResize}
                    onChange={(e) => setEnableResize(e.target.checked)}
                    className="rounded border-[#E4E0D8] text-[#7C3AED] focus:ring-[#7C3AED]/40"
                  />
                  <label htmlFor="enableResize" className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] cursor-pointer">
                    Resize Max Dimension
                  </label>
                </div>

                {enableResize ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="100"
                      max="10000"
                      step="100"
                      value={maxDimension}
                      onChange={(e) => setMaxDimension(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                    />
                    <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA]">px</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] mt-2 font-medium">
                    Maintain original image width &amp; height dimensions
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F5F3FF]/60 dark:bg-[#2E1065]/20 p-4 rounded-2xl border border-[#7C3AED]/20">
            <div className="text-xs text-[#18181B] dark:text-[#F4F4F5] font-semibold">
              Selected: <strong>{items.length} {items.length === 1 ? "image" : "images"}</strong> • Total Original: <strong>{formatBytes(totalOriginalSize)}</strong>
              {doneCount > 0 && (
                <span className="ml-2 text-[#7C3AED]">
                  (Compressed Total: {formatBytes(totalCompressedSize)} — <span className="font-extrabold">{overallReduction}% saved</span>)
                </span>
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
                onClick={handleCompressAll}
                disabled={isProcessing || items.length === 0}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-xs bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Compress {items.length} {items.length === 1 ? "Image" : "Images"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* List of Files with Before/After Cards */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  item.status === "error"
                    ? "bg-rose-500/5 border-rose-500/30"
                    : "bg-white dark:bg-[#141829] border-[#E4E0D8] dark:border-[#1E2338]"
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Image info & previews */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Thumbnail preview */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F7F5F0] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] shrink-0 flex items-center justify-center">
                      <img
                        src={item.compressedUrl || item.originalUrl}
                        alt={item.originalFile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#18181B] dark:text-[#F4F4F5] truncate">
                          {item.originalFile.name}
                        </p>
                        {item.reductionPercentage !== null && (
                          item.reductionPercentage > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#7C3AED]/15 text-[#7C3AED]">
                              ↓ {item.reductionPercentage}% smaller
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              Already Minimal Size
                            </span>
                          )
                        )}
                      </div>

                      {/* Size metrics */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA]">
                        <span>Original: {formatBytes(item.originalSize)}</span>

                        {item.status === "done" && item.compressedSize !== null && (
                          <>
                            <ArrowRight size={12} className="text-[#7C3AED]" />
                            <span className="text-[#18181B] dark:text-[#F4F4F5] font-bold">
                              Compressed: {formatBytes(item.compressedSize)} {item.compressedSize >= item.originalSize ? "(Optimal)" : ""}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Status indicator */}
                      <div className="pt-0.5">
                        {item.status === "idle" && (
                          <span className="text-[11px] font-medium text-[#71717A] dark:text-[#A1A1AA]">
                            Ready to compress
                          </span>
                        )}
                        {item.status === "compressing" && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C3AED]">
                            <Loader2 size={12} className="animate-spin" /> Compressing in background worker...
                          </span>
                        )}
                        {item.status === "done" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} /> Completed
                          </span>
                        )}
                        {item.status === "error" && (
                          <span className="text-xs font-bold text-rose-500">
                            {item.error || "Compression failed"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {item.status === "done" && (
                      <button
                        onClick={() => downloadItem(item)}
                        className="px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-opacity flex items-center gap-1.5 shadow-sm"
                      >
                        <Download size={14} /> Download
                      </button>
                    )}

                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isProcessing}
                      className="p-2 rounded-xl text-[#71717A] hover:text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Batch Download ZIP button if items done */}
          {doneCount > 0 && (
            <div className="pt-4 flex flex-col items-center space-y-3">
              <button
                onClick={downloadAllZip}
                disabled={isZipping || isProcessing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm bg-[#1F2544] dark:bg-[#7C3AED] hover:opacity-90 text-white shadow-lg transition-all flex items-center justify-center gap-2.5"
              >
                {isZipping ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Packaging ZIP...</span>
                  </>
                ) : (
                  <>
                    <Archive size={18} />
                    <span>Download All as ZIP ({doneCount} {doneCount === 1 ? "File" : "Files"})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global Success / Error notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2.5">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
