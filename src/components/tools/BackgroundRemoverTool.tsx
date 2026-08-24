"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Info,
  Loader2,
  ShieldCheck,
  Layers,
  Wand2,
  Trash2,
  Archive,
  Cpu,
} from "lucide-react";
import JSZip from "jszip";
import ImageDropzone from "./shared/ImageDropzone";

type OutputFormat = "image/png" | "image/jpeg";

interface BatchItem {
  id: string;
  file: File;
  sourceUrl: string;
  previewSourceUrl: string;
  resultBlob: Blob | null;
  resultUrl: string | null;
  previewResultUrl: string | null;
  status: "idle" | "downloading" | "processing" | "done" | "error";
  progress: number | null;
  message: string;
  error: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 1024 * 1024 ? 1 : 2)} MB`;
}

export default function BackgroundRemoverTool() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [globalMessage, setGlobalMessage] = useState("");
  const [batchNotice, setBatchNotice] = useState("");
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  const urlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const devMem = (navigator as any).deviceMemory;
      const cores = navigator.hardwareConcurrency;
      if ((devMem !== undefined && devMem <= 4) || (cores !== undefined && cores <= 4)) {
        setIsLowEndDevice(true);
      }

      if ("connection" in navigator) {
        const conn = (navigator as any).connection;
        if (
          conn?.saveData ||
          conn?.effectiveType === "2g" ||
          conn?.effectiveType === "3g" ||
          conn?.effectiveType === "slow-2g"
        ) {
          setIsSlowConnection(true);
        }
      }
    }
  }, []);

  const maxBatchCap = isLowEndDevice ? 5 : 15;

  const createObjectUrl = (blobOrFile: Blob | File): string => {
    const url = URL.createObjectURL(blobOrFile);
    urlsRef.current.add(url);
    return url;
  };

  const revokeUrl = (url: string | null | undefined) => {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore cleanup error
    }
    urlsRef.current.delete(url);
  };

  const createThumbnailUrl = async (blobOrFile: Blob | File, maxDim = 400): Promise<string> => {
    try {
      const bitmap = await createImageBitmap(blobOrFile);
      const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      if (scale >= 1) {
        bitmap.close();
        return createObjectUrl(blobOrFile);
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        bitmap.close();
        return createObjectUrl(blobOrFile);
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();

      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob(
          (b) => (b ? res(b) : rej(new Error("Thumbnail generation failed"))),
          "image/png"
        )
      );
      return createObjectUrl(blob);
    } catch {
      return createObjectUrl(blobOrFile);
    }
  };

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setBatchNotice("");
    let validFiles = selectedFiles.filter(
      (f) => f.size <= MAX_FILE_SIZE && (f.type.startsWith("image/") || f.name.endsWith(".svg"))
    );

    if (validFiles.length > maxBatchCap) {
      setBatchNotice(
        `Batch cap is ${maxBatchCap} images per run on this device to preserve performance and prevent freezing. The first ${maxBatchCap} images were selected.`
      );
      validFiles = validFiles.slice(0, maxBatchCap);
    }

    if (validFiles.length === 0) return;

    const newItems: BatchItem[] = await Promise.all(
      validFiles.map(async (file, idx) => {
        const sourceUrl = createObjectUrl(file);
        let previewSourceUrl = sourceUrl;
        try {
          previewSourceUrl = await createThumbnailUrl(file, 400);
        } catch {
          previewSourceUrl = sourceUrl;
        }

        return {
          id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          file,
          sourceUrl,
          previewSourceUrl,
          resultBlob: null,
          resultUrl: null,
          previewResultUrl: null,
          status: "idle" as const,
          progress: null,
          message: "",
          error: "",
        };
      })
    );

    setItems((prev) => [...prev, ...newItems]);
  };

  const loadImglyRemoveBackground = async (): Promise<(input: any, config?: any) => Promise<Blob>> => {
    if (typeof window === "undefined") {
      throw new Error("Background removal runs in the browser only.");
    }
    const win = window as any;
    if (win.imgly?.removeBackground) {
      return win.imgly.removeBackground;
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.getElementById("imgly-bg-removal-script");
      if (existing) {
        if (win.imgly?.removeBackground) return resolve();
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Failed to load AI engine")));
        return;
      }

      const script = document.createElement("script");
      script.id = "imgly-bg-removal-script";
      script.src = "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/bundle.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load background removal engine from CDN"));
      document.head.appendChild(script);
    });

    if (win.imgly?.removeBackground) {
      return win.imgly.removeBackground;
    }
    throw new Error("Failed to initialize background removal engine");
  };

  const processSingleItem = async (
    item: BatchItem,
    targetFormat: OutputFormat,
    onProgress: (msg: string, pct: number | null, status: "downloading" | "processing") => void
  ): Promise<Blob> => {
    const runRemoval = await loadImglyRemoveBackground();
    
    // Convert SVG to raster if needed
    const rasterInput = isSvg(item.file) ? await rasterizeSvg(item.file) : item.file;
    
    // Downscale large input before passing to AI model to prevent WASM compute lag
    const input = await downscaleForProcessing(rasterInput, 1800);

    const cdnBase = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";

    const progressCallback = (key: string, current: number, total: number) => {
      if (total > 0) {
        const pct = Math.min(100, Math.round((current / total) * 100));
        onProgress(`Downloading AI model (${pct}%)…`, pct, "downloading");
      } else if (key) {
        onProgress(`Preparing AI engine (${key})…`, null, "downloading");
      }
    };

    let transparentBlob: Blob;

    try {
      transparentBlob = await runRemoval(input, {
        model: "isnet_fp16",
        output: { format: "image/png", quality: 0.95 },
        progress: progressCallback,
        publicPath: cdnBase,
      });
    } catch (firstErr) {
      console.warn("First removal attempt failed, trying default fallback...", firstErr);
      transparentBlob = await runRemoval(input, {
        progress: progressCallback,
        publicPath: cdnBase,
      });
    }

    onProgress("Finalizing background removal…", null, "processing");

    const finalBlob = targetFormat === "image/jpeg" ? await flattenOnWhite(transparentBlob) : transparentBlob;
    return finalBlob;
  };

  const processBatch = async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);

    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i];
      if (currentItem.status === "done") continue; // Skip already finished items

      // Give browser main thread breathing room between heavy WASM inference passes
      if (i > 0) {
        await new Promise((r) => setTimeout(r, 60));
      }

      setCurrentIndex(i);
      setGlobalMessage(`Processing image ${i + 1} of ${items.length} (${currentItem.file.name})…`);

      // Update item status to downloading
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === i ? { ...it, status: "downloading", message: "Starting AI engine…", error: "" } : it
        )
      );

      try {
        const blob = await processSingleItem(
          currentItem,
          outputFormat,
          (msg, pct, st) => {
            setItems((prev) =>
              prev.map((it, idx) =>
                idx === i ? { ...it, status: st, message: msg, progress: pct } : it
              )
            );
          }
        );

        // Free previous results if any
        revokeUrl(currentItem.resultUrl);
        revokeUrl(currentItem.previewResultUrl);

        const resultUrl = createObjectUrl(blob);
        let previewResultUrl = resultUrl;
        try {
          previewResultUrl = await createThumbnailUrl(blob, 400);
        } catch {
          previewResultUrl = resultUrl;
        }

        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  resultBlob: blob,
                  resultUrl,
                  previewResultUrl,
                  status: "done",
                  message: "Background removed successfully!",
                  progress: null,
                }
              : it
          )
        );
      } catch (err: any) {
        console.error(`Error processing ${currentItem.file.name}:`, err);
        const errMsg = err?.message || String(err);
        const formattedErr = errMsg.includes("wasm") || errMsg.includes("WebAssembly")
          ? "Browser could not initialize WebAssembly engine."
          : errMsg || "Background removal failed for this image.";

        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? { ...it, status: "error", error: formattedErr, progress: null }
              : it
          )
        );
      }
    }

    setIsProcessing(false);
    setCurrentIndex(null);
    setGlobalMessage("Batch background removal complete!");
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((it) => it.id === id);
      if (itemToRemove) {
        revokeUrl(itemToRemove.sourceUrl);
        revokeUrl(itemToRemove.previewSourceUrl);
        revokeUrl(itemToRemove.resultUrl);
        revokeUrl(itemToRemove.previewResultUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  const clearAll = () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current.clear();
    setItems([]);
    setBatchNotice("");
    setGlobalMessage("");
    setCurrentIndex(null);
  };

  const downloadSingle = (item: BatchItem) => {
    if (!item.resultBlob) return;
    const url = URL.createObjectURL(item.resultBlob);
    const anchor = document.createElement("a");
    const baseName = item.file.name.replace(/\.[^.]+$/, "") || "image";
    const ext = outputFormat === "image/png" ? "png" : "jpg";
    anchor.href = url;
    anchor.download = `${baseName}-no-bg.${ext}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadZip = async () => {
    const doneItems = items.filter((it) => it.resultBlob !== null);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    const ext = outputFormat === "image/png" ? "png" : "jpg";

    doneItems.forEach((item, idx) => {
      if (item.resultBlob) {
        const baseName = item.file.name.replace(/\.[^.]+$/, "") || `image-${idx + 1}`;
        zip.file(`${baseName}-no-bg.${ext}`, item.resultBlob);
      }
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sajilotools-background-removed-batch.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const doneCount = items.filter((it) => it.status === "done").length;
  const pendingCount = items.length - doneCount;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Network & Device Info Alerts */}
      {isSlowConnection && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 text-rose-500 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Slow Network Detected</p>
            <p className="leading-relaxed">
              Downloading the ~40–80 MB AI model may take longer over slow mobile data connections.
            </p>
          </div>
        </div>
      )}

      {/* Device load notice */}
      <div className="p-4 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#18181B] dark:text-[#F4F4F5] text-xs sm:text-sm flex items-start sm:items-center gap-3 font-medium">
        <ShieldCheck className="text-[#7C3AED] shrink-0 mt-0.5 sm:mt-0" size={20} />
        <div>
          <span>100% client-side AI: Background removal runs directly on your device.</span>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Images are never uploaded to any server. Larger images or older devices may take a moment to compute — keep this tab open during processing.
          </p>
        </div>
      </div>

      {/* Low-end device batch caution */}
      {isLowEndDevice && pendingCount > 3 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
          <Cpu size={18} className="shrink-0 text-amber-500 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Device Optimization Active</p>
            <p className="leading-relaxed">
              You have {pendingCount} images queued. Processing multiple AI models sequentially on this device may cause temporary load. Images are optimized and spaced to preserve responsiveness.
            </p>
          </div>
        </div>
      )}

      {/* General Batch Info */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
        <Info size={18} className="shrink-0 text-amber-500 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5 flex items-center gap-1.5">
            <Layers size={14} /> Batch Background Removal (Sequential Execution)
          </p>
          <p className="leading-relaxed">
            Processes multiple images sequentially directly in your browser. First run downloads the cached AI model (40–80 MB). All photos stay 100% private on your device.
          </p>
        </div>
      </div>

      {/* Batch Cap Warning */}
      {batchNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5 font-semibold">
          <AlertTriangle size={18} className="shrink-0 text-amber-500" />
          <span>{batchNotice}</span>
        </div>
      )}

      {/* Dropzone area */}
      <ImageDropzone
        onFilesSelected={handleFilesSelected}
        multiple={true}
        maxSizeBytes={MAX_FILE_SIZE}
        accept="image/jpeg,image/png,image/webp,image/svg+xml,.svg"
        description={`Select single or multiple images (up to ${maxBatchCap} max per batch)`}
      />

      {/* Controls Bar & Global Actions */}
      {items.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#18181B] dark:text-[#F4F4F5]">
                Batch Queue ({items.length} image{items.length > 1 ? "s" : ""})
              </h3>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                Completed: {doneCount} / {items.length}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                Output Format:
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-xs font-semibold"
                >
                  <option value="image/png">PNG (Transparent)</option>
                  <option value="image/jpeg">JPEG (White Background)</option>
                </select>
              </label>

              <button
                onClick={processBatch}
                disabled={isProcessing || doneCount === items.length}
                className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold disabled:opacity-50 inline-flex items-center gap-2 shadow-sm transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing Batch…
                  </>
                ) : (
                  <>
                    <Wand2 size={16} /> {doneCount > 0 ? "Remove Remaining" : "Remove All Backgrounds"}
                  </>
                )}
              </button>

              {doneCount > 0 && (
                <button
                  onClick={downloadZip}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Archive size={16} /> Download All (ZIP)
                </button>
              )}

              <button
                onClick={clearAll}
                disabled={isProcessing}
                className="px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-rose-600 text-xs font-semibold transition-colors disabled:opacity-50"
                title="Clear all images"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Global Progress Bar */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-sm text-[#18181B] dark:text-[#F4F4F5] font-semibold flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-[#7C3AED] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs">{globalMessage}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#7C3AED]/15">
                  <div
                    className="h-full bg-[#7C3AED] transition-all duration-300"
                    style={{ width: `${Math.round(((doneCount) / items.length) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border bg-white dark:bg-[#141829] space-y-4 shadow-sm transition-all ${
              currentIndex === idx
                ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/20"
                : "border-[#E4E0D8] dark:border-[#1E2338]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-[#18181B] dark:text-[#F4F4F5] truncate">
                  {idx + 1}. {item.file.name}
                </p>
                <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                  {formatBytes(item.file.size)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {item.status === "done" && (
                  <button
                    onClick={() => downloadSingle(item)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={13} /> Save
                  </button>
                )}
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={isProcessing && currentIndex === idx}
                  className="p-1.5 text-[#71717A] hover:text-rose-600 rounded-lg transition-colors disabled:opacity-40"
                  title="Remove image"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Previews Grid (uses lightweight downscaled thumbnails for high performance rendering) */}
            <div className="grid grid-cols-2 gap-3">
              <Preview label="Original" url={item.previewSourceUrl || item.sourceUrl} />
              <Preview
                label="No Background"
                url={item.previewResultUrl || item.resultUrl}
                transparent={!item.resultUrl}
              />
            </div>

            {/* Status message */}
            {item.status === "downloading" || item.status === "processing" ? (
              <div className="p-3 rounded-xl bg-[#7C3AED]/10 text-xs text-[#7C3AED] font-medium flex items-center gap-2">
                <Loader2 size={14} className="animate-spin shrink-0" />
                <span>{item.message}</span>
              </div>
            ) : item.status === "done" ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>Done</span>
              </div>
            ) : item.status === "error" ? (
              <div className="p-3 rounded-xl bg-rose-500/10 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{item.error}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Preview({
  label,
  url,
  transparent = false,
}: {
  label: string;
  url: string | null;
  transparent?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold text-[#71717A] dark:text-[#A1A1AA] mb-1.5">
        {label}
      </p>
      <div
        className={`h-40 rounded-xl overflow-hidden border border-[#E4E0D8] dark:border-[#1E2338] flex items-center justify-center ${
          transparent
            ? "bg-[linear-gradient(45deg,#f1f1f1_25%,transparent_25%),linear-gradient(-45deg,#f1f1f1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f1f1_75%),linear-gradient(-45deg,transparent_75%,#f1f1f1_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] dark:bg-[#0C0F1E]"
            : "bg-[#F7F5F0] dark:bg-[#0C0F1E]"
        }`}
      >
        {url ? (
          <img src={url} alt={label} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center text-[11px] text-[#71717A] dark:text-[#A1A1AA] p-2">
            <ImageIcon className="mx-auto mb-1 opacity-50" size={20} />
            Waiting…
          </div>
        )}
      </div>
    </div>
  );
}

async function downscaleForProcessing(file: File, maxDim = 1800): Promise<File> {
  try {
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      return file;
    }

    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    if (scale >= 1) {
      bitmap.close();
      return file; // already small enough
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob: Blob = await new Promise((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("Downscale failed"))),
        "image/png"
      )
    );
    return new File([blob], file.name, { type: "image/png" });
  } catch (err) {
    console.warn("Could not downscale file before processing, using original", err);
    return file;
  }
}

function isSvg(file: File) {
  return file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
}

async function rasterizeSvg(file: File): Promise<File> {
  const svgUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("The SVG could not be rendered."));
      element.src = svgUrl;
    });
    const maxDimension = 2048;
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth || 1, image.naturalHeight || 1)
    );
    const width = Math.max(1, Math.round((image.naturalWidth || 1024) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || 1024) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable in this browser.");
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((result) =>
        result ? resolve(result) : reject(new Error("SVG conversion failed.")), "image/png"
      )
    );
    return new File([blob], `${file.name.replace(/\.svg$/i, "") || "image"}.png`, {
      type: "image/png",
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

async function flattenOnWhite(blob: Blob): Promise<Blob> {
  const image = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
  image.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("JPEG export failed."))),
      "image/jpeg",
      0.92
    )
  );
}