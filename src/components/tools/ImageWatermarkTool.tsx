"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  Trash2,
  Loader2,
  ShieldCheck,
  Stamp,
  Type,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertTriangle,
  Archive,
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
import {
  resolveWatermarkPosition,
  WatermarkPosition,
} from "@/lib/watermark-utils";

type WatermarkMode = "text" | "image";

type GridPosition = Exclude<WatermarkPosition, "tiled">;

const GRID_POSITIONS: { id: GridPosition; label: string }[] = [
  { id: "top-left", label: "↖" },
  { id: "top-center", label: "↑" },
  { id: "top-right", label: "↗" },
  { id: "left-center", label: "←" },
  { id: "center", label: "●" },
  { id: "right-center", label: "→" },
  { id: "bottom-left", label: "↙" },
  { id: "bottom-center", label: "↓" },
  { id: "bottom-right", label: "↘" },
];

export default function ImageWatermarkTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<WatermarkMode>("text");

  // Text watermark options
  const [text, setText] = useState("WATERMARK");
  const [fontSize, setFontSize] = useState(48);
  const [colorHex, setColorHex] = useState("#888888");
  const [opacity, setOpacity] = useState(0.35);
  const [rotationDeg, setRotationDeg] = useState(-30);
  const [position, setPosition] = useState<WatermarkPosition>("center");
  const [tiled, setTiled] = useState(false);

  // Image watermark options
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoScale, setLogoScale] = useState(0.25);
  const [logoOpacity, setLogoOpacity] = useState(0.4);
  const [logoPosition, setLogoPosition] = useState<WatermarkPosition>("bottom-right");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live preview
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderingPreview, setRenderingPreview] = useState(false);

  const handleFilesSelected = (selected: File[]) => {
    setFiles((prev) => [...prev, ...selected]);
    setProcessError(null);
    setSuccessMessage(null);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setSuccessMessage(null);
  };

  const clearAll = () => {
    setFiles([]);
    setLogoFile(null);
    setProcessError(null);
    setSuccessMessage(null);
  };

  const handleLogoSelected = (selected: File[]) => {
    if (selected.length > 0) setLogoFile(selected[0]);
  };

  // ── Apply watermark to a single image ──────────────────────────────────
  const applyWatermark = useCallback(
    async (file: File): Promise<Blob> => {
      const img = await loadImageFromFile(file);
      const { canvas, ctx } = createCanvas(img.naturalWidth, img.naturalHeight);
      ctx.drawImage(img, 0, 0);

      ctx.save();

      if (mode === "text") {
        if (!text.trim()) throw new Error("Watermark text cannot be empty.");

        ctx.globalAlpha = opacity;
        ctx.fillStyle = colorHex;
        ctx.font = `bold ${fontSize}px sans-serif`;

        if (tiled) {
          const metrics = ctx.measureText(text);
          const stepX = metrics.width + 80;
          const stepY = fontSize + 80;

          for (let y = -stepY; y < canvas.height + stepY * 2; y += stepY) {
            for (let x = -stepX; x < canvas.width + stepX * 2; x += stepX) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate((rotationDeg * Math.PI) / 180);
              ctx.fillText(text, 0, 0);
              ctx.restore();
            }
          }
        } else {
          const metrics = ctx.measureText(text);
          const textW = metrics.width;
          const textH = fontSize;

          const pos = resolveWatermarkPosition(
            position,
            canvas.width,
            canvas.height,
            textW,
            textH,
            24
          );

          ctx.translate(pos.x + textW / 2, pos.y + textH / 2);
          ctx.rotate((rotationDeg * Math.PI) / 180);
          ctx.fillText(text, -textW / 2, textH / 3);
        }
      } else {
        // Image/logo watermark
        if (!logoFile) throw new Error("Please upload a logo image.");

        const logo = await loadImageFromFile(logoFile);
        const logoW = logo.naturalWidth * logoScale;
        const logoH = logo.naturalHeight * logoScale;

        ctx.globalAlpha = logoOpacity;

        const pos = resolveWatermarkPosition(
          logoPosition,
          canvas.width,
          canvas.height,
          logoW,
          logoH,
          24
        );

        ctx.drawImage(logo, pos.x, pos.y, logoW, logoH);
      }

      ctx.restore();
      ctx.globalAlpha = 1;

      return canvasToBlob(canvas, file.type || "image/jpeg", 0.92);
    },
    [mode, text, fontSize, colorHex, opacity, rotationDeg, position, tiled, logoFile, logoScale, logoOpacity, logoPosition]
  );

  // ── Update live preview ──────────────────────────────────────────────────
  const updatePreview = useCallback(async () => {
    if (files.length === 0 || !previewCanvasRef.current) return;
    setRenderingPreview(true);

    try {
      const img = await loadImageFromFile(files[0]);

      // Scale down for preview if large
      const maxPreviewW = 600;
      const scale = img.naturalWidth > maxPreviewW ? maxPreviewW / img.naturalWidth : 1;
      const pW = Math.round(img.naturalWidth * scale);
      const pH = Math.round(img.naturalHeight * scale);

      const cvs = previewCanvasRef.current;
      cvs.width = pW;
      cvs.height = pH;
      const ctx = cvs.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, pW, pH);

      // Draw watermark overlay at preview scale
      ctx.save();

      if (mode === "text") {
        if (!text.trim()) return;

        const scaledFontSize = Math.max(12, Math.round(fontSize * scale));
        ctx.globalAlpha = opacity;
        ctx.fillStyle = colorHex;
        ctx.font = `bold ${scaledFontSize}px sans-serif`;

        if (tiled) {
          const metrics = ctx.measureText(text);
          const stepX = metrics.width + 60 * scale;
          const stepY = scaledFontSize + 60 * scale;

          for (let y = -stepY; y < pH + stepY * 2; y += stepY) {
            for (let x = -stepX; x < pW + stepX * 2; x += stepX) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate((rotationDeg * Math.PI) / 180);
              ctx.fillText(text, 0, 0);
              ctx.restore();
            }
          }
        } else {
          const metrics = ctx.measureText(text);
          const textW = metrics.width;
          const textH = scaledFontSize;

          const pos = resolveWatermarkPosition(
            position,
            pW,
            pH,
            textW,
            textH,
            Math.round(24 * scale)
          );

          ctx.translate(pos.x + textW / 2, pos.y + textH / 2);
          ctx.rotate((rotationDeg * Math.PI) / 180);
          ctx.fillText(text, -textW / 2, textH / 3);
        }
      } else if (logoFile) {
        const logo = await loadImageFromFile(logoFile);
        const logoW = logo.naturalWidth * logoScale * scale;
        const logoH = logo.naturalHeight * logoScale * scale;

        ctx.globalAlpha = logoOpacity;

        const pos = resolveWatermarkPosition(
          logoPosition,
          pW,
          pH,
          logoW,
          logoH,
          Math.round(24 * scale)
        );

        ctx.drawImage(logo, pos.x, pos.y, logoW, logoH);
      }

      ctx.restore();
    } catch (e) {
      console.warn("Preview error:", e);
    } finally {
      setRenderingPreview(false);
    }
  }, [files, mode, text, fontSize, colorHex, opacity, rotationDeg, position, tiled, logoFile, logoScale, logoOpacity, logoPosition]);

  // Debounce preview
  useEffect(() => {
    const timer = setTimeout(() => updatePreview(), 150);
    return () => clearTimeout(timer);
  }, [updatePreview]);

  // ── Apply & download ────────────────────────────────────────────────────
  const handleApplyAll = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProcessError(null);
    setSuccessMessage(null);

    try {
      if (files.length === 1) {
        const blob = await applyWatermark(files[0]);
        const baseName = files[0].name.replace(/\.[^/.]+$/, "");
        const ext = (files[0].type || "image/jpeg").split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        downloadBlob(blob, `${baseName}_watermarked.${ext}`);
        setSuccessMessage("Watermarked image downloaded!");
      } else {
        // Bulk: zip all
        const zip = new JSZip();
        for (let i = 0; i < files.length; i++) {
          const blob = await applyWatermark(files[i]);
          const baseName = files[i].name.replace(/\.[^/.]+$/, "");
          const ext = (files[i].type || "image/jpeg").split("/")[1]?.replace("jpeg", "jpg") || "jpg";
          zip.file(`${baseName}_watermarked.${ext}`, blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "watermarked_images.zip");
        setSuccessMessage(`${files.length} watermarked images downloaded as ZIP!`);
      }
    } catch (err: any) {
      setProcessError(err?.message || "Failed to apply watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Privacy Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2.5 text-sm font-medium">
        <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
        <span>
          🔒 <strong>100% client-side.</strong> Your images never leave your browser.
        </span>
      </div>

      {/* Dropzone */}
      {files.length === 0 ? (
        <ImageDropzone multiple={true} onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="space-y-6">
          {/* File list */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#18181B] dark:text-[#F4F4F5]">
                {files.length} image{files.length !== 1 && "s"} selected
              </h3>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-500 cursor-pointer hover:text-violet-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                      e.target.value = "";
                    }}
                  />
                  + Add more
                </label>
                <button
                  onClick={clearAll}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] truncate">
                      {f.name}
                    </p>
                    <p className="text-[10px] text-[#71717A]">{formatBytes(f.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1 rounded-lg text-[#71717A] hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Controls & Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Controls */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-5">
              <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                <Stamp size={18} className="text-[#F5A623]" />
                Watermark Settings
              </h3>

              {/* Mode tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
                <button
                  onClick={() => setMode("text")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mode === "text"
                      ? "bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] shadow-md"
                      : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  <Type size={16} />
                  Text
                </button>
                <button
                  onClick={() => setMode("image")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mode === "image"
                      ? "bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] shadow-md"
                      : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  <ImageIcon size={16} />
                  Logo
                </button>
              </div>

              {mode === "text" ? (
                <div className="space-y-4">
                  {/* Text input */}
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g. © My Brand"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={120}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                      Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                      />
                    </div>
                  </div>

                  {/* Opacity */}
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                      Opacity: {Math.round(opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={Math.round(opacity * 100)}
                      onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                      className="w-full accent-violet-500"
                    />
                  </div>

                  {/* Rotation */}
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                      Rotation: {rotationDeg}°
                    </label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={rotationDeg}
                      onChange={(e) => setRotationDeg(Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>

                  {/* Position Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#71717A]">Position</label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#71717A] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={tiled}
                          onChange={(e) => setTiled(e.target.checked)}
                          className="accent-violet-500 rounded"
                        />
                        Tiled
                      </label>
                    </div>
                    {!tiled && (
                      <div className="grid grid-cols-3 gap-1.5">
                        {GRID_POSITIONS.map((gp) => (
                          <button
                            key={gp.id}
                            onClick={() => setPosition(gp.id)}
                            className={`h-9 rounded-lg text-sm font-bold transition-all ${
                              position === gp.id
                                ? "bg-violet-500 text-white shadow-md"
                                : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] border border-[#E4E0D8] dark:border-[#2A2F48] hover:border-violet-400"
                            }`}
                            title={gp.label}
                          >
                            {gp.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Logo upload */}
                  {!logoFile ? (
                    <div>
                      <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                        Upload Logo (PNG with transparency recommended)
                      </label>
                      <ImageDropzone
                        multiple={false}
                        onFilesSelected={handleLogoSelected}
                        description="Drop your logo here"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] truncate">
                          {logoFile.name}
                        </p>
                        <p className="text-[10px] text-[#71717A]">{formatBytes(logoFile.size)}</p>
                      </div>
                      <button
                        onClick={() => setLogoFile(null)}
                        className="p-1.5 rounded-lg text-[#71717A] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Scale */}
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                      Scale: {Math.round(logoScale * 100)}%
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={200}
                      value={Math.round(logoScale * 100)}
                      onChange={(e) => setLogoScale(Number(e.target.value) / 100)}
                      className="w-full accent-violet-500"
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                      Opacity: {Math.round(logoOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={Math.round(logoOpacity * 100)}
                      onChange={(e) => setLogoOpacity(Number(e.target.value) / 100)}
                      className="w-full accent-violet-500"
                    />
                  </div>

                  {/* Position Grid */}
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                      Position
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {GRID_POSITIONS.map((gp) => (
                        <button
                          key={gp.id}
                          onClick={() => setLogoPosition(gp.id)}
                          className={`h-9 rounded-lg text-sm font-bold transition-all ${
                            logoPosition === gp.id
                              ? "bg-violet-500 text-white shadow-md"
                              : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] border border-[#E4E0D8] dark:border-[#2A2F48] hover:border-violet-400"
                          }`}
                          title={gp.label}
                        >
                          {gp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Live Preview */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-4">
              <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5]">
                Live Preview
                {files.length > 1 && (
                  <span className="text-xs font-medium text-[#71717A] ml-2">
                    (showing first image)
                  </span>
                )}
              </h3>
              <div className="relative flex items-center justify-center min-h-[250px] max-h-[500px] rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-dashed border-[#E4E0D8] dark:border-[#2A2F48] overflow-hidden">
                {renderingPreview && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-[#141829]/60 z-10">
                    <Loader2 size={24} className="animate-spin text-violet-500" />
                  </div>
                )}
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full max-h-[480px] object-contain"
                  style={{ display: files.length > 0 ? "block" : "none" }}
                />
                {files.length === 0 && (
                  <p className="text-sm text-[#71717A]">Upload images to see preview</p>
                )}
              </div>
            </div>
          </div>

          {/* Error / Success */}
          {processError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 text-sm font-medium">
              <AlertTriangle size={16} className="shrink-0" />
              {processError}
            </div>
          )}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-sm font-medium">
              <CheckCircle2 size={16} className="shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Apply button */}
          <button
            onClick={handleApplyAll}
            disabled={isProcessing || files.length === 0}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Applying watermark…
              </>
            ) : files.length > 1 ? (
              <>
                <Archive size={20} />
                Apply & Download All ({files.length} images)
              </>
            ) : (
              <>
                <Download size={20} />
                Apply & Download
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
