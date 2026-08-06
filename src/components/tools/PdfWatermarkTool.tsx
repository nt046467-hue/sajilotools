"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Lock,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Stamp,
  Type,
  Image as ImageIcon,
  X,
  Grid,
} from "lucide-react";
import PdfDropzone from "./shared/PdfDropzone";
import ImageDropzone from "./shared/ImageDropzone";
import {
  loadPdfFile,
  addTextWatermark,
  addImageWatermark,
  downloadBlob,
  formatBytes,
  EncryptedPdfError,
  InvalidPdfError,
  TextWatermarkOptions,
} from "@/lib/pdf-utils";

type WatermarkType = "text" | "image";
type GridPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export default function PdfWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [wmType, setWmType] = useState<WatermarkType>("text");

  // Text watermark options
  const [textOptions, setTextOptions] = useState<TextWatermarkOptions>({
    text: "CONFIDENTIAL",
    fontSize: 48,
    opacity: 0.3,
    rotationDeg: -45,
    colorHex: "#888888",
    tiled: false,
  });

  // Image watermark options
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageOptions, setImageOptions] = useState({
    scale: 0.5,
    opacity: 0.3,
    position: "center" as GridPosition,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live preview canvas ref
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderingPreview, setRenderingPreview] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setFile(selectedFile);
    setLoadingFile(true);
    setFileError(null);
    setProcessError(null);
    setSuccessMessage(null);
    setPageCount(null);

    try {
      const doc = await loadPdfFile(selectedFile);
      setPageCount(doc.getPageCount());
    } catch (err: any) {
      let errStr = "Failed to load PDF.";
      if (err instanceof EncryptedPdfError) {
        errStr = err.message;
      } else if (err instanceof InvalidPdfError) {
        errStr = err.message;
      }
      setFileError(errStr);
    } finally {
      setLoadingFile(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPageCount(null);
    setFileError(null);
    setProcessError(null);
    setSuccessMessage(null);
    setImageFile(null);
  };

  // Render live preview on canvas
  const updatePreview = useCallback(async () => {
    if (!file || !previewCanvasRef.current) return;

    setRenderingPreview(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdfDoc.getPage(1);

      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = previewCanvasRef.current;
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Render PDF page
      await page.render({ canvasContext: ctx, viewport }).promise;

      // 2. Draw watermark overlay
      ctx.save();
      if (wmType === "text") {
        if (!textOptions.text.trim()) return;

        ctx.globalAlpha = textOptions.opacity;
        ctx.fillStyle = textOptions.colorHex;
        ctx.font = `bold ${textOptions.fontSize}px sans-serif`;

        if (!textOptions.tiled) {
          const metrics = ctx.measureText(textOptions.text);
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((textOptions.rotationDeg * Math.PI) / 180);
          ctx.fillText(
            textOptions.text,
            -metrics.width / 2,
            textOptions.fontSize / 3
          );
        } else {
          const metrics = ctx.measureText(textOptions.text);
          const stepX = metrics.width + 80;
          const stepY = textOptions.fontSize + 80;

          for (let y = 0; y < canvas.height + stepY; y += stepY) {
            for (let x = 0; x < canvas.width + stepX; x += stepX) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate((textOptions.rotationDeg * Math.PI) / 180);
              ctx.fillText(textOptions.text, 0, 0);
              ctx.restore();
            }
          }
        }
      } else if (wmType === "image" && imageFile) {
        const img = new Image();
        const imgUrl = URL.createObjectURL(imageFile);
        img.onload = () => {
          ctx.globalAlpha = imageOptions.opacity;
          const w = img.width * imageOptions.scale;
          const h = img.height * imageOptions.scale;
          const padding = 20;

          let posX = (canvas.width - w) / 2;
          let posY = (canvas.height - h) / 2;

          switch (imageOptions.position) {
            case "top-left":
              posX = padding;
              posY = padding;
              break;
            case "top-center":
              posX = (canvas.width - w) / 2;
              posY = padding;
              break;
            case "top-right":
              posX = canvas.width - w - padding;
              posY = padding;
              break;
            case "center-left":
              posX = padding;
              posY = (canvas.height - h) / 2;
              break;
            case "center":
              posX = (canvas.width - w) / 2;
              posY = (canvas.height - h) / 2;
              break;
            case "center-right":
              posX = canvas.width - w - padding;
              posY = (canvas.height - h) / 2;
              break;
            case "bottom-left":
              posX = padding;
              posY = canvas.height - h - padding;
              break;
            case "bottom-center":
              posX = (canvas.width - w) / 2;
              posY = canvas.height - h - padding;
              break;
            case "bottom-right":
              posX = canvas.width - w - padding;
              posY = canvas.height - h - padding;
              break;
          }

          ctx.drawImage(img, posX, posY, w, h);
          URL.revokeObjectURL(imgUrl);
          ctx.restore();
        };
        img.src = imgUrl;
      }
      ctx.restore();
    } catch (e) {
      console.warn("Error rendering preview canvas", e);
    } finally {
      setRenderingPreview(false);
    }
  }, [file, wmType, textOptions, imageFile, imageOptions]);

  // Debounce preview update
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 150);
    return () => clearTimeout(timer);
  }, [updatePreview]);

  const handleApply = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProcessError(null);
    setSuccessMessage(null);

    try {
      let outputBlob: Blob;
      if (wmType === "text") {
        if (!textOptions.text.trim()) {
          throw new Error("Watermark text cannot be empty.");
        }
        outputBlob = await addTextWatermark(file, textOptions);
      } else {
        if (!imageFile) {
          throw new Error("Please upload an image file for the watermark.");
        }
        outputBlob = await addImageWatermark(file, imageFile, imageOptions);
      }

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const outputName = `${baseName}_watermarked.pdf`;
      downloadBlob(outputBlob, outputName);
      setSuccessMessage(`Watermarked PDF downloaded as "${outputName}"!`);
    } catch (err: any) {
      setProcessError(err?.message || "Failed to apply watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  const gridPositions: { id: GridPosition; label: string }[] = [
    { id: "top-left", label: "Top Left" },
    { id: "top-center", label: "Top Center" },
    { id: "top-right", label: "Top Right" },
    { id: "center-left", label: "Center Left" },
    { id: "center", label: "Center" },
    { id: "center-right", label: "Center Right" },
    { id: "bottom-left", label: "Bottom Left" },
    { id: "bottom-center", label: "Bottom Center" },
    { id: "bottom-right", label: "Bottom Right" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Privacy Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center justify-between text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <Lock className="text-[#F5A623] shrink-0" size={18} />
          <span>
            🔒 <strong>Your files are processed entirely in your browser.</strong> Nothing is uploaded to any server.
          </span>
        </div>
      </div>

      {/* Dropzone or active file info */}
      {!file ? (
        <PdfDropzone multiple={false} onFilesSelected={handleFileSelected} />
      ) : (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#F5A623] flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5] truncate">
                {file.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                {loadingFile ? (
                  <span className="flex items-center gap-1 text-[#F5A623]">
                    <Loader2 size={12} className="animate-spin" /> Reading document...
                  </span>
                ) : fileError ? (
                  <span className="text-rose-500 font-semibold">{fileError}</span>
                ) : (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {pageCount} {pageCount === 1 ? "page" : "pages"} total
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={clearFile}
            className="p-2.5 rounded-xl text-[#71717A] hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0"
            title="Remove file"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Watermark Controls & Live Preview */}
      {file && pageCount && !loadingFile && !fileError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Controls Form */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-6">
            <h3 className="font-extrabold text-lg text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
              <Stamp size={20} className="text-[#F5A623]" />
              Watermark Type
            </h3>

            {/* Segmented control / Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
              <button
                onClick={() => setWmType("text")}
                className={`py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                  wmType === "text"
                    ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                    : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                }`}
              >
                <Type size={16} />
                <span>Text Watermark</span>
              </button>

              <button
                onClick={() => setWmType("image")}
                className={`py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                  wmType === "image"
                    ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                    : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                }`}
              >
                <ImageIcon size={16} />
                <span>Image Watermark</span>
              </button>
            </div>

            {/* Text Watermark Form */}
            {wmType === "text" && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={textOptions.text}
                    onChange={(e) =>
                      setTextOptions((prev) => ({ ...prev, text: e.target.value }))
                    }
                    placeholder="e.g. CONFIDENTIAL"
                    className="w-full px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                      Font Size ({textOptions.fontSize}px)
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={100}
                      value={textOptions.fontSize}
                      onChange={(e) =>
                        setTextOptions((prev) => ({
                          ...prev,
                          fontSize: parseInt(e.target.value) || 48,
                        }))
                      }
                      className="w-full accent-[#F5A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                      Opacity ({Math.round(textOptions.opacity * 100)}%)
                    </label>
                    <input
                      type="range"
                      min={0.05}
                      max={1.0}
                      step={0.05}
                      value={textOptions.opacity}
                      onChange={(e) =>
                        setTextOptions((prev) => ({
                          ...prev,
                          opacity: parseFloat(e.target.value) || 0.3,
                        }))
                      }
                      className="w-full accent-[#F5A623]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                      Rotation ({textOptions.rotationDeg}°)
                    </label>
                    <input
                      type="range"
                      min={-90}
                      max={90}
                      value={textOptions.rotationDeg}
                      onChange={(e) =>
                        setTextOptions((prev) => ({
                          ...prev,
                          rotationDeg: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full accent-[#F5A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textOptions.colorHex}
                        onChange={(e) =>
                          setTextOptions((prev) => ({
                            ...prev,
                            colorHex: e.target.value,
                          }))
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer border border-[#E4E0D8] dark:border-[#2A2F48] bg-transparent p-0.5"
                      />
                      <span className="font-mono text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
                        {textOptions.colorHex}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                    Position Mode
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setTextOptions((prev) => ({ ...prev, tiled: false }))
                      }
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                        !textOptions.tiled
                          ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A]"
                      }`}
                    >
                      Single Center
                    </button>
                    <button
                      onClick={() =>
                        setTextOptions((prev) => ({ ...prev, tiled: true }))
                      }
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                        textOptions.tiled
                          ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A]"
                      }`}
                    >
                      Tiled Grid
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Image Watermark Form */}
            {wmType === "image" && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                    Upload Logo / Image (PNG or JPG)
                  </label>
                  {!imageFile ? (
                    <ImageDropzone
                      multiple={false}
                      onFilesSelected={(files) => setImageFile(files[0] || null)}
                    />
                  ) : (
                    <div className="p-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] truncate">
                        {imageFile.name}
                      </span>
                      <button
                        onClick={() => setImageFile(null)}
                        className="text-xs font-bold text-rose-500 hover:underline ml-2"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                      Image Scale ({Math.round(imageOptions.scale * 100)}%)
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={2.0}
                      step={0.05}
                      value={imageOptions.scale}
                      onChange={(e) =>
                        setImageOptions((prev) => ({
                          ...prev,
                          scale: parseFloat(e.target.value) || 0.5,
                        }))
                      }
                      className="w-full accent-[#F5A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                      Opacity ({Math.round(imageOptions.opacity * 100)}%)
                    </label>
                    <input
                      type="range"
                      min={0.05}
                      max={1.0}
                      step={0.05}
                      value={imageOptions.opacity}
                      onChange={(e) =>
                        setImageOptions((prev) => ({
                          ...prev,
                          opacity: parseFloat(e.target.value) || 0.3,
                        }))
                      }
                      className="w-full accent-[#F5A623]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                    Position (9-Point Grid)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto p-2 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
                    {gridPositions.map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() =>
                          setImageOptions((prev) => ({
                            ...prev,
                            position: pos.id,
                          }))
                        }
                        className={`h-10 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center border ${
                          imageOptions.position === pos.id
                            ? "bg-[#F5A623] text-[#0C0F1E] border-transparent shadow-sm"
                            : "bg-white dark:bg-[#141829] border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:text-[#18181B]"
                        }`}
                        title={pos.label}
                      >
                        •
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="pt-4">
              <button
                onClick={handleApply}
                disabled={
                  isProcessing ||
                  (wmType === "text" && !textOptions.text.trim()) ||
                  (wmType === "image" && !imageFile)
                }
                className="w-full py-3.5 rounded-2xl font-extrabold text-base bg-[#F5A623] hover:bg-[#E0961F] text-[#0C0F1E] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Applying Watermark...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Apply to all {pageCount} pages</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Live Canvas Preview */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex flex-col items-center justify-start space-y-4">
            <div className="w-full flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#1E2338] pb-3">
              <h4 className="font-extrabold text-sm text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
                <Grid size={16} className="text-[#F5A623]" /> Live Preview (Page 1)
              </h4>
              {renderingPreview && (
                <span className="text-xs text-[#F5A623] flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Updating...
                </span>
              )}
            </div>

            <div className="w-full max-h-[480px] overflow-auto flex items-center justify-center p-3 bg-[#FAFAF8] dark:bg-[#0C0F1E] rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48]">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full h-auto rounded shadow-md border border-[#E4E0D8] dark:border-[#1E2338]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Processing Error Message */}
      {processError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2.5">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{processError}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
