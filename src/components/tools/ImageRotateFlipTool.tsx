"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Trash2,
  Loader2,
  ShieldCheck,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Undo2,
  Archive,
  X,
  CopyCheck,
  Check,
} from "lucide-react";
import JSZip from "jszip";
import ImageDropzone from "./shared/ImageDropzone";
import {
  loadImageFromFile,
  createCanvas,
  canvasToBlob,
  downloadBlob,
  formatBytes,
} from "@/lib/image-utils";

type RotationDeg = 0 | 90 | 180 | 270;

interface BatchItem {
  id: string;
  file: File;
  originalUrl: string;
  previewUrl: string | null;
  previewDims: { w: number; h: number };
  originalDims: { w: number; h: number };
  rotationDeg: RotationDeg;
  flipH: boolean;
  flipV: boolean;
}

export default function ImageRotateFlipTool() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [appliedToAllNotice, setAppliedToAllNotice] = useState(false);

  // Active item reference
  const activeItem = items.find((i) => i.id === activeId) || items[0] || null;

  // Handle file selection (supports multiple)
  const handleFilesSelected = (files: File[]) => {
    if (!files.length) return;
    const newItems: BatchItem[] = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      originalUrl: URL.createObjectURL(f),
      previewUrl: null,
      previewDims: { w: 0, h: 0 },
      originalDims: { w: 0, h: 0 },
      rotationDeg: 0,
      flipH: false,
      flipV: false,
    }));
    setItems((prev) => {
      const next = [...prev, ...newItems];
      if (!activeId && next.length > 0) {
        setActiveId(next[0].id);
      }
      return next;
    });
  };

  // Remove single item
  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.originalUrl);
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
      const next = prev.filter((i) => i.id !== id);

      if (activeId === id) {
        setActiveId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  // Clear everything
  const handleClear = () => {
    items.forEach((item) => {
      URL.revokeObjectURL(item.originalUrl);
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setItems([]);
    setActiveId(null);
  };

  // Reset transforms for active item
  const handleResetActive = () => {
    if (!activeItem) return;
    updateActiveTransform({ rotationDeg: 0, flipH: false, flipV: false });
  };

  // Reset transforms for a specific item ID
  const handleResetSingleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rotationDeg: 0, flipH: false, flipV: false } : item
      )
    );
  };

  // Helper to update active item's transform
  const updateActiveTransform = (
    update: Partial<Pick<BatchItem, "rotationDeg" | "flipH" | "flipV">>
  ) => {
    if (!activeItem) return;
    setItems((prev) =>
      prev.map((item) => (item.id === activeItem.id ? { ...item, ...update } : item))
    );
  };

  // Rotation helpers for active item
  const rotateLeftActive = () => {
    if (!activeItem) return;
    const nextDeg = (((activeItem.rotationDeg - 90) % 360 + 360) % 360) as RotationDeg;
    updateActiveTransform({ rotationDeg: nextDeg });
  };

  const rotateRightActive = () => {
    if (!activeItem) return;
    const nextDeg = (((activeItem.rotationDeg + 90) % 360) as RotationDeg);
    updateActiveTransform({ rotationDeg: nextDeg });
  };

  const toggleFlipHActive = () => {
    if (!activeItem) return;
    updateActiveTransform({ flipH: !activeItem.flipH });
  };

  const toggleFlipVActive = () => {
    if (!activeItem) return;
    updateActiveTransform({ flipV: !activeItem.flipV });
  };

  // Apply active transform to all images in batch
  const handleApplyToAll = () => {
    if (!activeItem || items.length <= 1) return;

    const hasOtherEdits = items.some(
      (i) =>
        i.id !== activeItem.id &&
        (i.rotationDeg !== 0 || i.flipH || i.flipV)
    );

    if (hasOtherEdits) {
      const confirmed = window.confirm(
        "Some images already have custom transforms. Are you sure you want to overwrite all images with the current active image's transform?"
      );
      if (!confirmed) return;
    }

    const { rotationDeg, flipH, flipV } = activeItem;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        rotationDeg,
        flipH,
        flipV,
      }))
    );

    setAppliedToAllNotice(true);
    setTimeout(() => setAppliedToAllNotice(false), 2500);
  };

  // Generate preview for a single item
  const generateItemPreview = useCallback(
    async (item: BatchItem): Promise<BatchItem> => {
      const img = await loadImageFromFile(item.file);
      const swapDims = item.rotationDeg === 90 || item.rotationDeg === 270;
      const w = swapDims ? img.naturalHeight : img.naturalWidth;
      const h = swapDims ? img.naturalWidth : img.naturalHeight;

      const { canvas, ctx } = createCanvas(w, h);
      ctx.translate(w / 2, h / 2);
      ctx.rotate((item.rotationDeg * Math.PI) / 180);
      ctx.scale(item.flipH ? -1 : 1, item.flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const blob = await canvasToBlob(canvas, item.file.type || "image/png", 0.95);
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      const url = URL.createObjectURL(blob);

      return {
        ...item,
        previewUrl: url,
        previewDims: { w, h },
        originalDims: { w: img.naturalWidth, h: img.naturalHeight },
      };
    },
    []
  );

  // Generate previews for all items (debounced)
  useEffect(() => {
    if (items.length === 0) return;

    // Fast check if any item needs preview generation or update
    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const updated = await Promise.all(items.map((item) => generateItemPreview(item)));
        setItems(updated);
      } catch (err) {
        console.error("Preview error:", err);
      } finally {
        setIsProcessing(false);
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    items.map((i) => `${i.id}_${i.rotationDeg}_${i.flipH}_${i.flipV}`).join("|"),
  ]);

  // Download single item
  const handleDownloadSingle = async (item: BatchItem) => {
    setIsDownloading(true);
    try {
      const img = await loadImageFromFile(item.file);
      const swapDims = item.rotationDeg === 90 || item.rotationDeg === 270;
      const w = swapDims ? img.naturalHeight : img.naturalWidth;
      const h = swapDims ? img.naturalWidth : img.naturalHeight;

      const { canvas, ctx } = createCanvas(w, h);
      ctx.translate(w / 2, h / 2);
      ctx.rotate((item.rotationDeg * Math.PI) / 180);
      ctx.scale(item.flipH ? -1 : 1, item.flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const mimeType = item.file.type || "image/png";
      const blob = await canvasToBlob(canvas, mimeType, 0.95);
      const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "png";
      const baseName = item.file.name.replace(/\.[^/.]+$/, "");
      downloadBlob(blob, `${baseName}_transformed.${ext}`);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Download all as ZIP
  const handleDownloadAll = async () => {
    if (items.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const item of items) {
        const img = await loadImageFromFile(item.file);
        const swapDims = item.rotationDeg === 90 || item.rotationDeg === 270;
        const w = swapDims ? img.naturalHeight : img.naturalWidth;
        const h = swapDims ? img.naturalWidth : img.naturalHeight;

        const { canvas, ctx } = createCanvas(w, h);
        ctx.translate(w / 2, h / 2);
        ctx.rotate((item.rotationDeg * Math.PI) / 180);
        ctx.scale(item.flipH ? -1 : 1, item.flipV ? -1 : 1);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        const mimeType = item.file.type || "image/png";
        const blob = await canvasToBlob(canvas, mimeType, 0.95);
        const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "png";
        const baseName = item.file.name.replace(/\.[^/.]+$/, "");
        zip.file(`${baseName}_transformed.${ext}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "transformed_images.zip");
    } catch (err) {
      console.error("ZIP error:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const activeRotationLabel = activeItem
    ? activeItem.rotationDeg === 0
      ? "0°"
      : activeItem.rotationDeg === 90
      ? "90° CW"
      : activeItem.rotationDeg === 180
      ? "180°"
      : "270° CW"
    : "0°";

  const activeHasTransforms =
    activeItem && (activeItem.rotationDeg !== 0 || activeItem.flipH || activeItem.flipV);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Privacy Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2.5 text-sm font-medium">
        <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
        <span>
          🔒 <strong>100% client-side.</strong> Your images never leave your browser.
        </span>
      </div>

      {/* Dropzone — visible when no items */}
      {items.length === 0 ? (
        <ImageDropzone multiple={true} onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="space-y-6">
          {/* Batch info bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                <FlipHorizontal size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-[#18181B] dark:text-[#F4F4F5]">
                  {items.length} image{items.length !== 1 ? "s" : ""} loaded
                </h3>
                <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                  {formatBytes(items.reduce((sum, i) => sum + i.file.size, 0))} total
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => document.getElementById("add-more-input")?.click()}
                className="px-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-semibold text-[#71717A] hover:text-violet-500 hover:border-violet-400 transition-colors"
              >
                + Add More
              </button>
              <input
                id="add-more-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  e.target.value = "";
                }}
              />
              <button
                onClick={handleClear}
                className="p-2 rounded-xl text-[#71717A] hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0"
                title="Remove all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Transform Controls Panel (Edits Active Image) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5]">
                  Transform Controls
                </h3>
                {activeItem && (
                  <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                    Editing: <span className="font-bold text-violet-500">{activeItem.file.name}</span>
                  </p>
                )}
              </div>

              {items.length > 1 && (
                <button
                  onClick={handleApplyToAll}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    appliedToAllNotice
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20"
                  }`}
                  title="Apply current rotation & flip to all images in batch"
                >
                  {appliedToAllNotice ? <Check size={14} /> : <CopyCheck size={14} />}
                  <span>{appliedToAllNotice ? "Applied to All!" : "Apply to All Images"}</span>
                </button>
              )}
            </div>

            {/* Rotate & Flip buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={rotateLeftActive}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-500/5 transition-all group"
              >
                <RotateCcw size={24} className="text-[#71717A] group-hover:text-violet-500 transition-colors" />
                <span className="text-xs font-semibold text-[#71717A] group-hover:text-violet-500 transition-colors">
                  Rotate Left
                </span>
              </button>

              <button
                onClick={rotateRightActive}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-500/5 transition-all group"
              >
                <RotateCw size={24} className="text-[#71717A] group-hover:text-violet-500 transition-colors" />
                <span className="text-xs font-semibold text-[#71717A] group-hover:text-violet-500 transition-colors">
                  Rotate Right
                </span>
              </button>

              <button
                onClick={toggleFlipHActive}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group ${
                  activeItem?.flipH
                    ? "border-violet-400 dark:border-violet-500 bg-violet-500/10"
                    : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-500/5"
                }`}
              >
                <FlipHorizontal
                  size={24}
                  className={`transition-colors ${activeItem?.flipH ? "text-violet-500" : "text-[#71717A] group-hover:text-violet-500"}`}
                />
                <span className={`text-xs font-semibold transition-colors ${activeItem?.flipH ? "text-violet-500" : "text-[#71717A] group-hover:text-violet-500"}`}>
                  Flip H
                </span>
              </button>

              <button
                onClick={toggleFlipVActive}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group ${
                  activeItem?.flipV
                    ? "border-violet-400 dark:border-violet-500 bg-violet-500/10"
                    : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-500/5"
                }`}
              >
                <FlipVertical
                  size={24}
                  className={`transition-colors ${activeItem?.flipV ? "text-violet-500" : "text-[#71717A] group-hover:text-violet-500"}`}
                />
                <span className={`text-xs font-semibold transition-colors ${activeItem?.flipV ? "text-violet-500" : "text-[#71717A] group-hover:text-violet-500"}`}>
                  Flip V
                </span>
              </button>
            </div>

            {/* Current state summary */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-sm flex-wrap gap-2">
              <div className="flex items-center gap-3 text-[#71717A] dark:text-[#A1A1AA] text-xs sm:text-sm">
                <span>
                  Rotation: <strong className="text-[#18181B] dark:text-[#F4F4F5]">{activeRotationLabel}</strong>
                </span>
                <span>•</span>
                <span>
                  Flip H: <strong className={activeItem?.flipH ? "text-violet-500" : "text-[#18181B] dark:text-[#F4F4F5]"}>{activeItem?.flipH ? "On" : "Off"}</strong>
                </span>
                <span>•</span>
                <span>
                  Flip V: <strong className={activeItem?.flipV ? "text-violet-500" : "text-[#18181B] dark:text-[#F4F4F5]"}>{activeItem?.flipV ? "On" : "Off"}</strong>
                </span>
              </div>
              {activeHasTransforms && (
                <button
                  onClick={handleResetActive}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Undo2 size={13} />
                  Reset Active
                </button>
              )}
            </div>
          </div>

          {/* Active Image Large Preview */}
          {activeItem && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-[#18181B] dark:text-[#F4F4F5]">
                  Active Image Preview
                </h4>
                <button
                  onClick={() => handleDownloadSingle(activeItem)}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <Download size={13} />
                  Download Active
                </button>
              </div>

              <div className="relative h-64 sm:h-80 w-full rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] flex items-center justify-center p-4 overflow-hidden border border-[#E4E0D8] dark:border-[#2A2F48]">
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-[#141829]/60 z-10">
                    <Loader2 size={24} className="animate-spin text-violet-500" />
                  </div>
                )}
                <img
                  src={activeItem.previewUrl || activeItem.originalUrl}
                  alt={activeItem.file.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Thumbnails Grid (Selection & Per-Item Transforms) */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-[#18181B] dark:text-[#F4F4F5]">
              Batch Images ({items.length}) — Click thumbnail to edit
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item) => {
                const isActive = item.id === activeItem?.id;
                const itemHasTransforms =
                  item.rotationDeg !== 0 || item.flipH || item.flipV;

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`group relative rounded-2xl border bg-white dark:bg-[#141829] overflow-hidden cursor-pointer transition-all ${
                      isActive
                        ? "border-violet-500 ring-2 ring-violet-500 shadow-md"
                        : "border-[#E4E0D8] dark:border-[#1E2338] hover:border-violet-300 dark:hover:border-violet-700"
                    }`}
                  >
                    <div className="relative aspect-square flex items-center justify-center bg-[#FAFAF8] dark:bg-[#1E2338] overflow-hidden">
                      <img
                        src={item.previewUrl || item.originalUrl}
                        alt={item.file.name}
                        className="max-w-full max-h-full object-contain"
                      />
                      {/* Active Indicator Badge */}
                      {isActive && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-violet-600 text-white text-[10px] font-extrabold shadow">
                          Active
                        </span>
                      )}
                      {/* Transform Summary Badge */}
                      {itemHasTransforms && (
                        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-semibold backdrop-blur-sm">
                          {item.rotationDeg}° {item.flipH ? "H" : ""}{item.flipV ? "V" : ""}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] truncate">
                          {item.file.name}
                        </p>
                        <p className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
                          {formatBytes(item.file.size)}
                        </p>
                      </div>
                      {itemHasTransforms && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetSingleItem(item.id);
                          }}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                          title="Reset this image's transform"
                        >
                          <Undo2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Overlay action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingle(item);
                        }}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-[#141829]/90 text-violet-500 hover:text-violet-600 border border-[#E4E0D8] dark:border-[#2A2F48] transition-colors"
                        title="Download this image"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-[#141829]/90 text-rose-500 hover:text-rose-600 border border-[#E4E0D8] dark:border-[#2A2F48] transition-colors"
                        title="Remove image"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Download Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.length === 1 ? (
              <button
                onClick={() => handleDownloadSingle(items[0])}
                disabled={isDownloading || isProcessing}
                className="sm:col-span-2 w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <><Loader2 size={20} className="animate-spin" /> Processing…</>
                ) : (
                  <><Download size={20} /> Download Transformed Image</>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleDownloadAll}
                  disabled={isZipping || isProcessing}
                  className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isZipping ? (
                    <><Loader2 size={20} className="animate-spin" /> Creating ZIP…</>
                  ) : (
                    <><Archive size={20} /> Download All as ZIP</>
                  )}
                </button>
                <button
                  onClick={() => document.getElementById("add-more-input")?.click()}
                  className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl border-2 border-dashed border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:text-violet-500 hover:border-violet-400 font-bold text-base transition-all"
                >
                  + Add More Images
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
