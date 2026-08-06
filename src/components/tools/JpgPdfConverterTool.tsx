"use client";

import { useState, useRef } from "react";
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
} from "@/lib/pdf-utils";

type ConversionDirection = "imgToPdf" | "pdfToImg";

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function JpgPdfConverterTool() {
  const [direction, setDirection] = useState<ConversionDirection>("imgToPdf");

  // ── JPG -> PDF States ──
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSizeMode, setPageSizeMode] = useState<"fit" | "a4">("fit");
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

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

    const newItems: ImageItem[] = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newItems]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearImages = () => {
    images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setImages([]);
    setProcessError(null);
    setSuccessMessage(null);
  };

  // Drag and drop reordering for images
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

  const handleConvertImagesToPdf = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setProcessError(null);
    setSuccessMessage(null);

    try {
      const rawFiles = images.map((i) => i.file);
      const pdfBlob = await imagesToPdf(rawFiles, pageSizeMode);
      downloadBlob(pdfBlob, "images-to-pdf.pdf");
      setSuccessMessage(`Converted ${images.length} images into "images-to-pdf.pdf"!`);
    } catch (err: any) {
      const msg = err?.message || "Failed to convert images to PDF.";
      setProcessError(msg);
      trackError("jpg-pdf-converter", msg);
    } finally {
      setIsProcessing(false);
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Privacy Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center justify-between text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <Lock className="text-[#F5A623] shrink-0" size={18} />
          <span>
            🔒 <strong>Your files are processed entirely in your browser.</strong> Nothing is uploaded to any server.
          </span>
        </div>
      </div>

      {/* Top Direction Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
        <button
          onClick={() => {
            setDirection("imgToPdf");
            setProcessError(null);
            setSuccessMessage(null);
          }}
          className={`py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
            direction === "imgToPdf"
              ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
              : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          <ImageIcon size={18} />
          <span>JPG → PDF</span>
        </button>

        <button
          onClick={() => {
            setDirection("pdfToImg");
            setProcessError(null);
            setSuccessMessage(null);
          }}
          className={`py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
            direction === "pdfToImg"
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
            <ImageDropzone multiple={true} onFilesSelected={handleImagesSelected} />
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                  <FileImage size={20} className="text-[#F5A623]" />
                  Uploaded Images ({images.length})
                </h3>

                <div className="flex items-center gap-2">
                  <ImageDropzone
                    multiple={true}
                    onFilesSelected={handleImagesSelected}
                    className="!p-2 !border-solid !rounded-xl"
                  />
                  <button
                    onClick={clearImages}
                    className="p-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grid of uploaded images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable={images.length > 1}
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative group rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-2 bg-white/80 dark:bg-[#141829]/80 flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#2A2F48]">
                      <div className="flex items-center gap-1">
                        {images.length > 1 && (
                          <GripVertical
                            size={14}
                            className="text-[#71717A] cursor-grab active:cursor-grabbing"
                          />
                        )}
                        <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                          Page {idx + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => removeImage(item.id)}
                        className="text-[#71717A] hover:text-rose-500"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="p-2 flex items-center justify-center min-h-[120px] max-h-[160px] overflow-hidden">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="max-h-[140px] object-contain rounded"
                      />
                    </div>

                    <div className="p-2 bg-white dark:bg-[#141829] border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                      <p className="text-[11px] font-semibold text-[#18181B] dark:text-[#F4F4F5] truncate">
                        {item.file.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A]">
                  Page Size & Layout
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPageSizeMode("fit")}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold border transition-all ${
                      pageSizeMode === "fit"
                        ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent"
                        : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A]"
                    }`}
                  >
                    Fit to Image Aspect Ratio
                  </button>
                  <button
                    onClick={() => setPageSizeMode("a4")}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold border transition-all ${
                      pageSizeMode === "a4"
                        ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent"
                        : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A]"
                    }`}
                  >
                    Standard A4 Page (Centered)
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleConvertImagesToPdf}
                  disabled={isProcessing || images.length === 0}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-base bg-[#F5A623] hover:bg-[#E0961F] text-[#0C0F1E] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Converting Images to PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Convert to PDF</span>
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
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#F5A623] flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5] truncate">
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
                onClick={clearPdf}
                className="p-2.5 rounded-xl text-[#71717A] hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0"
                title="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {pdfFile && pdfPageCount && !loadingPdf && !pdfError && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-2">
                  JPEG Output Quality ({Math.round(quality * 100)}%)
                </label>
                <input
                  type="range"
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value) || 0.9)}
                  className="w-full accent-[#F5A623]"
                />
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1">
                  Higher quality produces sharper images with slightly larger file sizes.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleConvertPdfToJpg}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-base bg-[#F5A623] hover:bg-[#E0961F] text-[#0C0F1E] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2"
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
