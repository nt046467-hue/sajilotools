"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Info,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wand2,
  Trash2,
  Archive,
} from "lucide-react";
import JSZip from "jszip";
import ImageDropzone from "./shared/ImageDropzone";

type OutputFormat = "image/png" | "image/jpeg";

interface BatchItem {
  id: string;
  file: File;
  sourceUrl: string;
  resultBlob: Blob | null;
  resultUrl: string | null;
  status: "idle" | "downloading" | "processing" | "done" | "error";
  progress: number | null;
  message: string;
  error: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_BATCH_CAP = 15; // Soft cap for browser performance

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

  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "connection" in navigator) {
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
  }, []);

  const createObjectUrl = (blobOrFile: Blob | File) => {
    const url = URL.createObjectURL(blobOrFile);
    urlsRef.current.push(url);
    return url;
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    setBatchNotice("");
    let validFiles = selectedFiles.filter(
      (f) => f.size <= MAX_FILE_SIZE && (f.type.startsWith("image/") || f.name.endsWith(".svg"))
    );

    if (validFiles.length > MAX_BATCH_CAP) {
      setBatchNotice(
        `Batch cap is ${MAX_BATCH_CAP} images per run to preserve browser memory. The first ${MAX_BATCH_CAP} images were selected.`
      );
      validFiles = validFiles.slice(0, MAX_BATCH_CAP);
    }

    if (validFiles.length === 0) return;

    const newItems: BatchItem[] = validFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      file,
      sourceUrl: createObjectUrl(file),
      resultBlob: null,
      resultUrl: null,
      status: "idle",
      progress: null,
      message: "",
      error: "",
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const processSingleItem = async (
    item: BatchItem,
    targetFormat: OutputFormat,
    onProgress: (msg: string, pct: number | null, status: "downloading" | "processing") => void
  ): Promise<Blob> => {
    const { removeBackground: runRemoval } = await import("@imgly/background-removal");
    const input = isSvg(item.file) ? await rasterizeSvg(item.file) : item.file;

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

        const resultUrl = createObjectUrl(blob);

        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  resultBlob: blob,
                  resultUrl,
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
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearAll = () => {
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Network & Info Alerts */}
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

      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
        <Info size={18} className="shrink-0 text-amber-500 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5 flex items-center gap-1.5">
            <Sparkles size={14} /> Batch Background Removal (Sequential Execution)
          </p>
          <p className="leading-relaxed">
            Processes multiple images sequentially directly in your browser. First run downloads the cached AI model (40–80 MB). All photos stay 100% private on your device.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#18181B] dark:text-[#F4F4F5] text-sm flex items-center gap-2.5 font-medium">
        <ShieldCheck className="text-[#7C3AED] shrink-0" size={20} />
        <span>100% client-side AI: images are processed on your device and never uploaded to any server.</span>
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
        description="Select single or multiple images (up to 15 max per batch)"
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
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Previews Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Preview label="Original" url={item.sourceUrl} />
              <Preview
                label="No Background"
                url={item.resultUrl}
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
    const maxDimension = 4096;
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