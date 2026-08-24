"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  FileText,
  Lock,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  FileImage,
  Image as ImageIcon,
  GripVertical,
  X,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import PdfDropzone from "./shared/PdfDropzone";
import ImageDropzone from "./shared/ImageDropzone";
import { trackError } from "@/lib/analytics";
import {
  loadPdfFile,
  imagesToPdf,
  pdfPagesToJpgs,
  zipBlobs,
  downloadBlob,
  formatBytes,
  EncryptedPdfError,
  InvalidPdfError,
  PdfPageOrientation,
  PdfMargin,
} from "@/lib/pdf-utils";

type ConversionDirection = "imgToPdf" | "pdfToImg";

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface ConvertedPdfResult {
  blob: Blob;
  filename: string;
  size: number;
  pageCount: number;
}

export default function JpgPdfConverterTool() {
  const [direction, setDirection] = useState<ConversionDirection>("imgToPdf");

  // ── JPG -> PDF States ──
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSizeMode, setPageSizeMode] = useState<PdfPageOrientation>("fit");
  const [pageMargin, setPageMargin] = useState<PdfMargin>("none");
  const [pdfResult, setPdfResult] = useState<ConvertedPdfResult | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  // ── PDF -> JPG States ──
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(0.9);

  // Common action states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle image files added for JPG -> PDF
  const handleImagesSelected = (newFiles: File[]) => {
    setProcessError(null);
    setSuccessMessage(null);
    setPdfResult(null);

    const newItems: ImageItem[] = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newItems]);
  };

  const handleAddMoreChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImagesSelected(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      const updated = prev.filter((i) => i.id !== id);
      if (updated.length === 0) {
        setPdfResult(null);
      }
      return updated;
    });
  };

  const clearImages = () => {
    images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setImages([]);
    setPdfResult(null);
    setProcessError(null);
    setSuccessMessage(null);
  };

  // Reorder by index (useful for mobile touch devices)
  const moveImage = (fromIndex: number, directionOffset: number) => {
    const toIndex = fromIndex + directionOffset;
    if (toIndex < 0 || toIndex >= images.length) return;

    setImages((prev) => {
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
  };

  // Drag and drop reordering for images (desktop)
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (
      dragItem.current === null ||
      dragOverItem.current === null ||
      dragItem.current === dragOverItem.current
    ) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const updated = [...images];
    const draggedContent = updated[dragItem.current];
    updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, draggedContent);

    dragItem.current = null;
    dragOverItem.current = null;
    setImages(updated);
  };

  // Calculate total file size of uploaded images
  const totalImagesSize = images.reduce((acc, curr) => acc + curr.file.size, 0);

  const handleConvertImagesToPdf = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setProcessError(null);
    setSuccessMessage(null);
    setProgressText(`Processing 1 of ${images.length} images...`);

    try {
      const rawFiles = images.map((i) => i.file);
      const pdfBlob = await imagesToPdf(rawFiles, pageSizeMode, pageMargin, (curr, total) => {
        setProgressText(`Converting image ${curr} of ${total}...`);
      });

      const filename = images.length === 1
        ? `${images[0].file.name.replace(/\.[^/.]+$/, "")}.pdf`
        : "images-to-pdf.pdf";

      downloadBlob(pdfBlob, filename);

      setPdfResult({
        blob: pdfBlob,
        filename,
        size: pdfBlob.size,
        pageCount: images.length,
      });

      setSuccessMessage(`Successfully created "${filename}" with ${images.length} page${images.length > 1 ? "s" : ""}!`);
    } catch (err: any) {
      const msg = err?.message || "Failed to convert images to PDF.";
      setProcessError(msg);
      trackError("jpg-pdf-converter", msg);
    } finally {
      setIsProcessing(false);
      setProgressText(null);
    }
  };

  // Handle PDF file selection for PDF -> JPG
  const handlePdfSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setPdfFile(selectedFile);
    setLoadingPdf(true);
    setPdfError(null);
    setProcessError(null);
    setSuccessMessage(null);
    setPdfPageCount(null);

    try {
      const doc = await loadPdfFile(selectedFile);
      setPdfPageCount(doc.getPageCount());
    } catch (err: any) {
      let errStr = "Failed to load PDF.";
      if (err instanceof EncryptedPdfError) {
        errStr = err.message;
      } else if (err instanceof InvalidPdfError) {
        errStr = err.message;
      }
      setPdfError(errStr);
    } finally {
      setLoadingPdf(false);
    }
  };

  const clearPdf = () => {
    setPdfFile(null);
    setPdfPageCount(null);
    setPdfError(null);
    setProcessError(null);
    setSuccessMessage(null);
  };

  const handleConvertPdfToJpg = async () => {
    if (!pdfFile || !pdfPageCount) return;

    setIsProcessing(true);
    setProcessError(null);
    setSuccessMessage(null);
    setProgressText(`Preparing conversion...`);

    try {
      const outputs = await pdfPagesToJpgs(pdfFile, quality, (curr, total) => {
        setProgressText(`Converting page ${curr} of ${total}...`);
      });

      const baseName = pdfFile.name.replace(/\.[^/.]+$/, "");

      if (outputs.length === 1) {
        downloadBlob(outputs[0].blob, outputs[0].name);
        setSuccessMessage(`Downloaded extracted JPG page as "${outputs[0].name}"!`);
      } else {
        setProgressText("Zipping extracted images...");
        const zipBlob = await zipBlobs(outputs, `${baseName}_pages.zip`);
        downloadBlob(zipBlob, `${baseName}_pages.zip`);
        setSuccessMessage(
          `Bundled and downloaded all ${outputs.length} pages as "${baseName}_pages.zip"!`
        );
      }
    } catch (err: any) {
      setProcessError(err?.message || "Failed to convert PDF to JPG images.");
    } finally {
      setIsProcessing(false);
      setProgressText(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2 sm:px-0">
      {/* Privacy Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#18181B] dark:text-[#F4F4F5] text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <Lock className="text-[#F5A623] shrink-0" size={18} />
          <span>
            🔒 <strong>Your files are processed 100% locally in your browser.</strong> No images or documents are ever uploaded to any server.
          </span>
        </div>
      </div>

      {/* Top Direction Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm">
        <button
          onClick={() => {
            setDirection("imgToPdf");
            setProcessError(null);
            setSuccessMessage(null);
          }}
          className={`py-3 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${direction === "imgToPdf"
              ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
              : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
        >
          <ImageIcon size={18} />
          <span>JPG / Image → PDF</span>
        </button>

        <button
          onClick={() => {
            setDirection("pdfToImg");
            setProcessError(null);
            setSuccessMessage(null);
          }}
          className={`py-3 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${direction === "pdfToImg"
              ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
              : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
        >
          <FileText size={18} />
          <span>PDF → JPG</span>
        </button>
      </div>

      {/* Error & Success Banners */}
      {processError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2.5">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{processError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── MODE 1: JPG -> PDF ── */}
      {direction === "imgToPdf" && (
        <div className="space-y-6">
          {images.length === 0 ? (
            <ImageDropzone
              multiple={true}
              onFilesSelected={handleImagesSelected}
              description="Supports JPG, PNG, WebP, SVG, GIF, AVIF, HEIC"
            />
          ) : (
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-6">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E0D8] dark:border-[#1E2338] pb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#F5A623] flex items-center justify-center shrink-0">
                    <FileImage size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
                      Uploaded Images
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1F2544]/10 dark:bg-white/10 font-bold text-[#7C3AED] dark:text-[#F5A623]">
                        {images.length}
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                      Total size: {formatBytes(totalImagesSize)}
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2">
                  <input
                    ref={addMoreInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/svg+xml,.svg"
                    onChange={handleAddMoreChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => addMoreInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:hover:bg-[#7C3AED]/30 transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={15} />
                    <span>Add More</span>
                  </button>

                  <button
                    type="button"
                    onClick={clearImages}
                    disabled={isProcessing}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                </div>
              </div>

              {/* Grid of uploaded images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {images.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable={images.length > 1}
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="group relative rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#181C2E] overflow-hidden flex flex-col justify-between shadow-sm transition-all hover:border-[#7C3AED]/40"
                  >
                    {/* Card Top Action Bar */}
                    <div className="p-2 bg-white/90 dark:bg-[#141829]/90 flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#2A2F48]">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-extrabold text-[#18181B] dark:text-[#F4F4F5] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                          #{idx + 1}
                        </span>
                        {images.length > 1 && (
                          <span title="Drag to reorder" className="hidden sm:inline-flex items-center">
                            <GripVertical
                              size={14}
                              className="text-[#71717A] cursor-grab active:cursor-grabbing hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                            />
                          </span>
                        )}
                      </div>

                      {/* Mobile & Desktop Reorder & Delete Controls */}
                      <div className="flex items-center gap-0.5">
                        {images.length > 1 && (
                          <>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveImage(idx, -1)}
                              className="p-1 text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] disabled:opacity-20 disabled:cursor-not-allowed rounded"
                              title="Move back"
                            >
                              <ArrowLeft size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === images.length - 1}
                              onClick={() => moveImage(idx, 1)}
                              className="p-1 text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] disabled:opacity-20 disabled:cursor-not-allowed rounded"
                              title="Move forward"
                            >
                              <ArrowRight size={12} />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(item.id)}
                          className="p-1 text-[#71717A] hover:text-rose-500 rounded"
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Image Preview Container */}
                    <div className="p-2.5 flex items-center justify-center h-36 sm:h-44 overflow-hidden bg-[#FAFAF8] dark:bg-[#181C2E]">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                        loading="lazy"
                      />
                    </div>

                    {/* Card Bottom Info */}
                    <div className="p-2 bg-white dark:bg-[#141829] border-t border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between gap-1 text-[10px]">
                      <p className="font-semibold text-[#18181B] dark:text-[#F4F4F5] truncate max-w-[100px] sm:max-w-[120px]" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <span className="text-[#71717A] dark:text-[#A1A1AA] shrink-0 font-medium">
                        {formatBytes(item.file.size)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add More Slot Box */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => addMoreInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      addMoreInputRef.current?.click();
                    }
                  }}
                  className="rounded-2xl border-2 border-dashed border-[#E4E0D8] dark:border-[#2A2F48] hover:border-[#7C3AED] dark:hover:border-[#7C3AED] flex flex-col items-center justify-center p-4 text-center cursor-pointer min-h-[160px] transition-all hover:bg-[#7C3AED]/5 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                  <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">Add Photos</span>
                  <span className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">JPG, PNG, WebP</span>
                </div>
              </div>

              {/* PDF Settings */}
              <div className="pt-4 border-t border-[#E4E0D8] dark:border-[#1E2338] space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-2.5">
                    Page Layout & Sizing
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPageSizeMode("fit")}
                      className={`p-3 rounded-xl text-xs font-extrabold border transition-all text-left flex flex-col gap-1 ${pageSizeMode === "fit"
                          ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent shadow-sm"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:border-[#7C3AED]"
                        }`}
                    >
                      <span>Fit Image (Original Size)</span>
                      <span className="text-[10px] opacity-80 font-normal">Matches photo dimensions exactly</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPageSizeMode("a4-portrait")}
                      className={`p-3 rounded-xl text-xs font-extrabold border transition-all text-left flex flex-col gap-1 ${pageSizeMode === "a4-portrait"
                          ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent shadow-sm"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:border-[#7C3AED]"
                        }`}
                    >
                      <span>A4 Portrait</span>
                      <span className="text-[10px] opacity-80 font-normal">Standard vertical page centered</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPageSizeMode("a4-landscape")}
                      className={`p-3 rounded-xl text-xs font-extrabold border transition-all text-left flex flex-col gap-1 ${pageSizeMode === "a4-landscape"
                          ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent shadow-sm"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:border-[#7C3AED]"
                        }`}
                    >
                      <span>A4 Landscape</span>
                      <span className="text-[10px] opacity-80 font-normal">Horizontal document format</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPageSizeMode("a4-auto")}
                      className={`p-3 rounded-xl text-xs font-extrabold border transition-all text-left flex flex-col gap-1 ${pageSizeMode === "a4-auto"
                          ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent shadow-sm"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:border-[#7C3AED]"
                        }`}
                    >
                      <span>Auto A4 Orientation</span>
                      <span className="text-[10px] opacity-80 font-normal">Smart portrait/landscape per image</span>
                    </button>
                  </div>
                </div>

                {pageSizeMode !== "fit" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-2">
                      Page Margin
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPageMargin("none")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${pageMargin === "none"
                            ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent"
                            : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A]"
                          }`}
                      >
                        No Margin
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageMargin("small")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${pageMargin === "small"
                            ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent"
                            : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A]"
                          }`}
                      >
                        Small Margin
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageMargin("normal")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${pageMargin === "normal"
                            ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent"
                            : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A]"
                          }`}
                      >
                        Normal Margin
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Converted Success Result Card */}
              {pdfResult && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-sm text-[#18181B] dark:text-[#F4F4F5] truncate">
                        {pdfResult.filename}
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                        {pdfResult.pageCount} {pdfResult.pageCount === 1 ? "page" : "pages"} • {formatBytes(pdfResult.size)} • PDF Ready
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => downloadBlob(pdfResult.blob, pdfResult.filename)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Download size={14} />
                      <span>Download Again</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit / Convert Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleConvertImagesToPdf}
                  disabled={isProcessing || images.length === 0}
                  className="w-full sm:w-auto min-w-[240px] px-8 py-4 rounded-2xl font-extrabold text-base bg-[#F5A623] hover:bg-[#E0961F] text-[#0C0F1E] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#F5A623]/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>{progressText || "Generating PDF..."}</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>
                        Convert {images.length} {images.length === 1 ? "Image" : "Images"} to PDF
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODE 2: PDF -> JPG ── */}
      {direction === "pdfToImg" && (
        <div className="space-y-6">
          {!pdfFile ? (
            <PdfDropzone multiple={false} onFilesSelected={handlePdfSelected} />
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#F5A623] flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#18181B] dark:text-[#F4F4F5] truncate">
                    {pdfFile.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                    <span>{formatBytes(pdfFile.size)}</span>
                    <span>•</span>
                    {loadingPdf ? (
                      <span className="flex items-center gap-1 text-[#F5A623]">
                        <Loader2 size={12} className="animate-spin" /> Reading document...
                      </span>
                    ) : pdfError ? (
                      <span className="text-rose-500 font-semibold">{pdfError}</span>
                    ) : (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {pdfPageCount} {pdfPageCount === 1 ? "page" : "pages"} total
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={clearPdf}
                className="p-2.5 rounded-xl text-[#71717A] hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0"
                title="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {pdfFile && pdfPageCount && !loadingPdf && !pdfError && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    JPEG Output Quality
                  </label>
                  <span className="px-2 py-0.5 rounded-md bg-[#F5A623]/10 text-[#F5A623] text-xs font-extrabold">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value) || 0.9)}
                  className="w-full accent-[#F5A623] h-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
                />
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1.5">
                  Higher quality produces crisp, high-resolution images with slightly larger file sizes.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleConvertPdfToJpg}
                  disabled={isProcessing}
                  className="w-full sm:w-auto min-w-[240px] px-8 py-4 rounded-2xl font-extrabold text-base bg-[#F5A623] hover:bg-[#E0961F] text-[#0C0F1E] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#F5A623]/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{progressText || "Converting..."}</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>
                        Convert {pdfPageCount} {pdfPageCount === 1 ? "page" : "pages"} to JPG
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
