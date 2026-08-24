"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Download,
  Loader2,
  ShieldCheck,
  Crop,
  Eye,
  CheckCircle2,
  RotateCcw,
  Archive,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AnimatedTrashIcon, { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";
import JSZip from "jszip";
import ImageDropzone from "./shared/ImageDropzone";

type CropPreset = "free" | "1:1" | "16:9" | "4:3" | "9:16" | "3:2";
type OutputFormat = "original" | "image/jpeg" | "image/webp" | "image/png";

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const PRESETS: { key: CropPreset; label: string; ratio: number | null }[] = [
  { key: "free", label: "✂️ Freeform", ratio: null },
  { key: "1:1", label: "🟦 1:1 Square", ratio: 1 },
  { key: "16:9", label: "📺 16:9 Landscape", ratio: 16 / 9 },
  { key: "4:3", label: "🖼️ 4:3 Photo", ratio: 4 / 3 },
  { key: "3:2", label: "📸 3:2 Standard", ratio: 3 / 2 },
  { key: "9:16", label: "📱 9:16 Story", ratio: 9 / 16 },
];

interface BatchFile {
  id: string;
  file: File;
  url: string;
  natW: number;
  natH: number;
  croppedUrl: string | null;
  croppedW: number;
  croppedH: number;
  croppedSize: number;
}

export default function ImageCropperTool() {
  // Batch state
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Derived from active file
  const activeFile = batchFiles[activeIndex] ?? null;
  const file = activeFile?.file ?? null;
  const imageUrl = activeFile?.url ?? null;
  const imgNatW = activeFile?.natW ?? 0;
  const imgNatH = activeFile?.natH ?? 0;

  const [cropPreset, setCropPreset] = useState<CropPreset>("free");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");

  // Crop region in percentages (0-100)
  const [cropLeft, setCropLeft] = useState(10);
  const [cropTop, setCropTop] = useState(10);
  const [cropWidth, setCropWidth] = useState(80);
  const [cropHeight, setCropHeight] = useState(80);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"move" | "nw" | "ne" | "sw" | "se" | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragInitCrop, setDragInitCrop] = useState({ l: 0, t: 0, w: 0, h: 0 });

  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [croppedW, setCroppedW] = useState(0);
  const [croppedH, setCroppedH] = useState(0);
  const [croppedSize, setCroppedSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isZipping, setIsZipping] = useState(false);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      batchFiles.forEach((bf) => {
        URL.revokeObjectURL(bf.url);
        if (bf.croppedUrl) URL.revokeObjectURL(bf.croppedUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilesAdded = async (files: File[]) => {
    if (files.length === 0) return;

    const newEntries: BatchFile[] = [];
    for (const f of files) {
      const url = URL.createObjectURL(f);
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 0, h: 0 });
        img.src = url;
      });
      newEntries.push({
        id: crypto.randomUUID(),
        file: f,
        url,
        natW: dims.w,
        natH: dims.h,
        croppedUrl: null,
        croppedW: 0,
        croppedH: 0,
        croppedSize: 0,
      });
    }

    setBatchFiles((prev) => {
      const updated = [...prev, ...newEntries];
      if (prev.length === 0 && newEntries.length > 0) {
        resetCropRegion("free", newEntries[0].natW, newEntries[0].natH);
      }
      return updated;
    });
    if (batchFiles.length === 0) setActiveIndex(0);
  };

  const resetCropRegion = (preset: CropPreset, natW: number, natH: number) => {
    const presetDef = PRESETS.find((p) => p.key === preset);
    const targetRatio = presetDef?.ratio;

    if (!targetRatio) {
      setCropLeft(10);
      setCropTop(10);
      setCropWidth(80);
      setCropHeight(80);
      return;
    }

    const imgRatio = natW / natH;
    let cw: number, ch: number;

    if (targetRatio > imgRatio) {
      // Wider than image — fit width
      cw = 90;
      ch = (cw / 100 * natW) / (targetRatio * natH) * 100;
    } else {
      // Taller than image — fit height
      ch = 90;
      cw = (ch / 100 * natH * targetRatio) / natW * 100;
    }

    cw = Math.min(cw, 95);
    ch = Math.min(ch, 95);

    setCropLeft(Math.max(0, (100 - cw) / 2));
    setCropTop(Math.max(0, (100 - ch) / 2));
    setCropWidth(cw);
    setCropHeight(ch);
  };

  const handlePresetChange = (preset: CropPreset) => {
    setCropPreset(preset);
    if (imgNatW && imgNatH) {
      resetCropRegion(preset, imgNatW, imgNatH);
    }
    setCroppedUrl(null);
    setIsDone(false);
  };

  // Get displayed image bounds inside the container
  const getImageBounds = useCallback(() => {
    const img = imgRef.current;
    if (!img) return { x: 0, y: 0, w: 0, h: 0 };
    const rect = img.getBoundingClientRect();
    return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
  }, []);

  // Mouse/touch handlers for interactive crop
  const handlePointerDown = (e: React.PointerEvent, type: "move" | "nw" | "ne" | "sw" | "se") => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragInitCrop({ l: cropLeft, t: cropTop, w: cropWidth, h: cropHeight });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragType) return;
    const bounds = getImageBounds();
    if (bounds.w === 0 || bounds.h === 0) return;

    const dx = ((e.clientX - dragStart.x) / bounds.w) * 100;
    const dy = ((e.clientY - dragStart.y) / bounds.h) * 100;

    const presetDef = PRESETS.find((p) => p.key === cropPreset);
    const lockedRatio = presetDef?.ratio || null;

    if (dragType === "move") {
      let newL = Math.max(0, Math.min(100 - dragInitCrop.w, dragInitCrop.l + dx));
      let newT = Math.max(0, Math.min(100 - dragInitCrop.h, dragInitCrop.t + dy));
      setCropLeft(newL);
      setCropTop(newT);
    } else {
      let { l, t, w, h } = dragInitCrop;

      if (dragType === "se") {
        w = Math.max(10, Math.min(100 - l, w + dx));
        if (lockedRatio) {
          h = (w / 100 * imgNatW) / (lockedRatio * imgNatH) * 100;
        } else {
          h = Math.max(10, Math.min(100 - t, h + dy));
        }
      } else if (dragType === "sw") {
        const newW = Math.max(10, w - dx);
        const newL = l + (w - newW);
        if (newL >= 0) { l = newL; w = newW; }
        if (lockedRatio) {
          h = (w / 100 * imgNatW) / (lockedRatio * imgNatH) * 100;
        } else {
          h = Math.max(10, Math.min(100 - t, h + dy));
        }
      } else if (dragType === "ne") {
        w = Math.max(10, Math.min(100 - l, w + dx));
        if (lockedRatio) {
          const newH = (w / 100 * imgNatW) / (lockedRatio * imgNatH) * 100;
          const newT = t + (h - newH);
          if (newT >= 0) { t = newT; h = newH; }
        } else {
          const newH = Math.max(10, h - dy);
          const newT = t + (h - newH);
          if (newT >= 0) { t = newT; h = newH; }
        }
      } else if (dragType === "nw") {
        const newW = Math.max(10, w - dx);
        const newL = l + (w - newW);
        if (newL >= 0) { l = newL; w = newW; }
        if (lockedRatio) {
          const newH = (w / 100 * imgNatW) / (lockedRatio * imgNatH) * 100;
          const newT = t + (h - newH);
          if (newT >= 0) { t = newT; h = newH; }
        } else {
          const newH = Math.max(10, h - dy);
          const newT = t + (h - newH);
          if (newT >= 0) { t = newT; h = newH; }
        }
      }

      // Clamp
      w = Math.min(w, 100 - l);
      h = Math.min(h, 100 - t);

      setCropLeft(l);
      setCropTop(t);
      setCropWidth(w);
      setCropHeight(h);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  // Helper: crop a single batch file with the current crop region
  const cropSingleFile = async (bf: BatchFile): Promise<{ blob: Blob; w: number; h: number }> => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = bf.url;
    });

    const srcX = Math.round(img.naturalWidth * (cropLeft / 100));
    const srcY = Math.round(img.naturalHeight * (cropTop / 100));
    const srcW = Math.round(img.naturalWidth * (cropWidth / 100));
    const srcH = Math.round(img.naturalHeight * (cropHeight / 100));

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, srcW);
    canvas.height = Math.max(1, srcH);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context failed");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    let mimeType = bf.file.type || "image/jpeg";
    if (outputFormat !== "original") mimeType = outputFormat;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Blob export failed"))),
        mimeType,
        0.92
      );
    });
    return { blob, w: srcW, h: srcH };
  };

  // Crop the active image
  const handleCrop = async () => {
    if (!activeFile || isProcessing) return;

    setIsProcessing(true);
    setCroppedUrl(null);
    setIsDone(false);

    try {
      const { blob, w, h } = await cropSingleFile(activeFile);
      const url = URL.createObjectURL(blob);
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);

      setCroppedUrl(url);
      setCroppedW(w);
      setCroppedH(h);
      setCroppedSize(blob.size);
      setIsDone(true);

      // Update batch file record
      setBatchFiles((prev) =>
        prev.map((bf) =>
          bf.id === activeFile.id
            ? { ...bf, croppedUrl: url, croppedW: w, croppedH: h, croppedSize: blob.size }
            : bf
        )
      );
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Crop ALL images with the current crop region
  const handleCropAll = async () => {
    if (batchFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const updated = await Promise.all(
        batchFiles.map(async (bf) => {
          const { blob, w, h } = await cropSingleFile(bf);
          if (bf.croppedUrl) URL.revokeObjectURL(bf.croppedUrl);
          const url = URL.createObjectURL(blob);
          return { ...bf, croppedUrl: url, croppedW: w, croppedH: h, croppedSize: blob.size };
        })
      );
      setBatchFiles(updated);
      setIsDone(true);

      // Update active preview
      const active = updated[activeIndex];
      if (active) {
        setCroppedUrl(active.croppedUrl);
        setCroppedW(active.croppedW);
        setCroppedH(active.croppedH);
        setCroppedSize(active.croppedSize);
      }
    } catch (err) {
      console.error("Crop all failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileExt = (f: File) => {
    if (outputFormat === "image/jpeg") return ".jpg";
    if (outputFormat === "image/webp") return ".webp";
    if (outputFormat === "image/png") return ".png";
    return f.name.substring(f.name.lastIndexOf(".")) || ".png";
  };

  const handleDownload = () => {
    if (!croppedUrl || !file) return;
    const link = document.createElement("a");
    const ext = getFileExt(file);
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    link.download = `${baseName}_cropped_${croppedW}x${croppedH}${ext}`;
    link.href = croppedUrl;
    link.click();
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    const cropped = batchFiles.filter((bf) => bf.croppedUrl);
    if (cropped.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const bf of cropped) {
        const { blob, w, h } = await cropSingleFile(bf);
        const ext = getFileExt(bf.file);
        const baseName = bf.file.name.substring(0, bf.file.name.lastIndexOf(".")) || bf.file.name;
        zip.file(`${baseName}_cropped_${w}x${h}${ext}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.download = "cropped_images.zip";
      link.href = URL.createObjectURL(zipBlob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("ZIP error:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleClear = () => {
    batchFiles.forEach((bf) => {
      URL.revokeObjectURL(bf.url);
      if (bf.croppedUrl) URL.revokeObjectURL(bf.croppedUrl);
    });
    setBatchFiles([]);
    setActiveIndex(0);
    setCroppedUrl(null);
    setIsDone(false);
    setCropPreset("free");
  };

  const removeFile = (id: string) => {
    setBatchFiles((prev) => {
      const item = prev.find((bf) => bf.id === id);
      if (item) {
        URL.revokeObjectURL(item.url);
        if (item.croppedUrl) URL.revokeObjectURL(item.croppedUrl);
      }
      const updated = prev.filter((bf) => bf.id !== id);
      if (activeIndex >= updated.length) setActiveIndex(Math.max(0, updated.length - 1));
      return updated;
    });
  };

  const navigateImage = (dir: number) => {
    const next = activeIndex + dir;
    if (next >= 0 && next < batchFiles.length) {
      setActiveIndex(next);
      const bf = batchFiles[next];
      if (bf.croppedUrl) {
        setCroppedUrl(bf.croppedUrl);
        setCroppedW(bf.croppedW);
        setCroppedH(bf.croppedH);
        setCroppedSize(bf.croppedSize);
        setIsDone(true);
      } else {
        setCroppedUrl(null);
        setIsDone(false);
      }
    }
  };

  const cropPixelW = Math.round(imgNatW * (cropWidth / 100));
  const cropPixelH = Math.round(imgNatH * (cropHeight / 100));
  const isBatch = batchFiles.length > 1;
  const allCropped = batchFiles.every((bf) => bf.croppedUrl);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Privacy Banner */}
      <div className="p-4 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2.5 text-sm font-medium">
        <ShieldCheck className="text-[#7C3AED] shrink-0" size={20} />
        <span>🔒 <strong>100% In-Browser Cropping:</strong> Your images never leave your device.</span>
      </div>

      {/* Upload */}
      {batchFiles.length === 0 && <ImageDropzone onFilesSelected={handleFilesAdded} multiple={true} />}

      {/* Cropper UI */}
      {activeFile && (
        <div className="space-y-5">
          {/* Batch Navigation Bar */}
          {isBatch && (
            <div className="p-3 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateImage(-1)}
                  disabled={activeIndex === 0}
                  className="p-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:text-[#7C3AED] disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                  Image {activeIndex + 1} of {batchFiles.length}
                </span>
                <button
                  onClick={() => navigateImage(1)}
                  disabled={activeIndex === batchFiles.length - 1}
                  className="p-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:text-[#7C3AED] disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => document.getElementById("crop-add-more")?.click()}
                  className="px-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-semibold text-[#71717A] hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors"
                >
                  + Add More
                </button>
                <input
                  id="crop-add-more"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFilesAdded(Array.from(e.target.files));
                    e.target.value = "";
                  }}
                />
                <AnimatedTrashButton
                  onDelete={handleClear}
                  className="p-1.5 rounded-lg text-[#71717A] hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                  title="Clear all"
                  iconSize={14}
                />
              </div>
            </div>
          )}

          {/* Thumbnail strip for batch */}
          {isBatch && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {batchFiles.map((bf, idx) => (
                <button
                  key={bf.id}
                  onClick={() => {
                    setActiveIndex(idx);
                    if (bf.croppedUrl) {
                      setCroppedUrl(bf.croppedUrl);
                      setCroppedW(bf.croppedW);
                      setCroppedH(bf.croppedH);
                      setCroppedSize(bf.croppedSize);
                      setIsDone(true);
                    } else {
                      setCroppedUrl(null);
                      setIsDone(false);
                    }
                  }}
                  className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    idx === activeIndex
                      ? "border-[#7C3AED] shadow-md"
                      : bf.croppedUrl
                        ? "border-emerald-400"
                        : "border-[#E4E0D8] dark:border-[#2A2F48]"
                  }`}
                >
                  <img src={bf.url} alt={bf.file.name} className="w-full h-full object-cover" />
                  {bf.croppedUrl && (
                    <div className="absolute bottom-0 right-0 p-0.5 bg-emerald-500 rounded-tl-md">
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(bf.id); }}
                    className="absolute top-0 right-0 p-0.5 bg-black/50 rounded-bl-md opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </button>
              ))}
            </div>
          )}
          {/* Preset Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E4E0D8] dark:border-[#1E2338] pb-3">
              <Crop size={18} className="text-[#7C3AED]" />
              <h3 className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">Crop Aspect Ratio</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePresetChange(p.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${cropPreset === p.key
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "bg-[#F7F5F0] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#7C3AED]"
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Format */}
            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs font-bold text-[#71717A] shrink-0">Output:</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
              >
                <option value="original">Keep Original</option>
                <option value="image/jpeg">JPEG (.jpg)</option>
                <option value="image/webp">WebP (.webp)</option>
                <option value="image/png">PNG (.png)</option>
              </select>
            </div>
          </div>

          {/* Interactive Crop Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Interactive crop area */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5 uppercase tracking-wider">
                  <Crop size={14} className="text-[#7C3AED]" />
                  Drag to Crop
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#7C3AED]/15 text-[#7C3AED]">
                  {cropPixelW}×{cropPixelH} px
                </span>
              </div>

              <div
                ref={containerRef}
                className="relative w-full rounded-xl overflow-hidden bg-[#F7F5F0] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] select-none touch-none"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Source"
                  className="w-full h-auto block"
                  draggable={false}
                />

                {/* Dark overlay outside crop */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Top */}
                  <div className="absolute bg-black/50" style={{ top: 0, left: 0, right: 0, height: `${cropTop}%` }} />
                  {/* Bottom */}
                  <div className="absolute bg-black/50" style={{ bottom: 0, left: 0, right: 0, height: `${100 - cropTop - cropHeight}%` }} />
                  {/* Left */}
                  <div className="absolute bg-black/50" style={{ top: `${cropTop}%`, left: 0, width: `${cropLeft}%`, height: `${cropHeight}%` }} />
                  {/* Right */}
                  <div className="absolute bg-black/50" style={{ top: `${cropTop}%`, right: 0, width: `${100 - cropLeft - cropWidth}%`, height: `${cropHeight}%` }} />
                </div>

                {/* Crop selection box */}
                <div
                  className="absolute border-2 border-white shadow-lg cursor-move"
                  style={{
                    left: `${cropLeft}%`,
                    top: `${cropTop}%`,
                    width: `${cropWidth}%`,
                    height: `${cropHeight}%`,
                    boxShadow: "0 0 0 1px rgba(124,58,237,0.6)",
                  }}
                  onPointerDown={(e) => handlePointerDown(e, "move")}
                >
                  {/* Grid lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                    <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                  </div>

                  {/* Corner handles */}
                  {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                    <div
                      key={corner}
                      className="absolute w-4 h-4 bg-white border-2 border-[#7C3AED] rounded-sm z-10"
                      style={{
                        top: corner.includes("n") ? -6 : undefined,
                        bottom: corner.includes("s") ? -6 : undefined,
                        left: corner.includes("w") ? -6 : undefined,
                        right: corner.includes("e") ? -6 : undefined,
                        cursor: corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
                      }}
                      onPointerDown={(e) => handlePointerDown(e, corner)}
                    />
                  ))}
                </div>
              </div>

              {/* Info bar */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-[#F7F5F0] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338]">
                  <p className="text-[10px] font-bold text-[#71717A] uppercase">Original</p>
                  <p className="font-extrabold text-[#18181B] dark:text-[#F4F4F5]">{imgNatW}×{imgNatH}</p>
                  <p className="text-[10px] text-[#71717A]">{file ? formatBytes(file.size) : ""}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#F5F3FF] dark:bg-[#2E1065]/20 border border-[#7C3AED]/20">
                  <p className="text-[10px] font-bold text-[#7C3AED] uppercase">Crop Region</p>
                  <p className="font-extrabold text-[#7C3AED]">{cropPixelW}×{cropPixelH}</p>
                  <p className="text-[10px] text-[#71717A]">{cropPreset === "free" ? "Freeform" : cropPreset}</p>
                </div>
              </div>
            </div>

            {/* Right: Preview result */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5 uppercase tracking-wider">
                <Eye size={14} className="text-[#7C3AED]" />
                Cropped Result
              </h4>

              <div className="relative w-full min-h-[200px] rounded-xl bg-[#F7F5F0] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] overflow-hidden flex items-center justify-center p-3">
                {croppedUrl ? (
                  <img
                    src={croppedUrl}
                    alt="Cropped result"
                    className="max-w-full max-h-[350px] object-contain drop-shadow-md rounded-lg"
                  />
                ) : (
                  <p className="text-xs text-[#71717A] text-center py-10">
                    Adjust the crop area and click<br /><strong>&quot;Crop Image&quot;</strong> to see the result
                  </p>
                )}
              </div>

              {isDone && croppedUrl && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 size={14} /> Cropped successfully!
                  </div>
                  <p className="text-[#71717A]">
                    Size: <strong className="text-[#18181B] dark:text-[#F4F4F5]">{croppedW}×{croppedH} px</strong> • {formatBytes(croppedSize)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F5F3FF]/60 dark:bg-[#2E1065]/20 p-4 rounded-2xl border border-[#7C3AED]/20">
            <div className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">
              <span className="truncate max-w-[200px] inline-block align-bottom">{file?.name}</span>
              <span className="text-[#71717A]"> • Crop: {cropPixelW}×{cropPixelH} px</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {!isBatch && (
                <AnimatedTrashButton
                  onDelete={handleClear}
                  className="px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                  iconSize={14}
                >
                  Remove
                </AnimatedTrashButton>
              )}

              {isDone && croppedUrl ? (
                <>
                  <button
                    onClick={() => { setCroppedUrl(null); setIsDone(false); }}
                    className="px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] text-xs font-semibold hover:bg-[#F7F5F0] dark:hover:bg-[#0C0F1E] transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} /> Re-crop
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Download Cropped
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCrop}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <><Loader2 size={16} className="animate-spin" /> Cropping...</>
                    ) : (
                      <><Crop size={16} /> Crop This Image</>
                    )}
                  </button>
                  {isBatch && (
                    <button
                      onClick={handleCropAll}
                      disabled={isProcessing}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#7C3AED] to-purple-600 hover:from-[#6D28D9] hover:to-purple-500 text-white disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <><Loader2 size={16} className="animate-spin" /> Cropping All...</>
                      ) : (
                        <><Crop size={16} /> Crop All ({batchFiles.length})</>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Batch ZIP Download */}
          {isBatch && allCropped && (
            <button
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isZipping ? (
                <><Loader2 size={20} className="animate-spin" /> Creating ZIP...</>
              ) : (
                <><Archive size={20} /> Download All {batchFiles.length} Cropped Images as ZIP</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
