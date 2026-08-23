"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Download,
  Trash2,
  Loader2,
  ShieldCheck,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Lock,
  Plus,
  X,
  Star,
  Layers,
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

// ── ICO binary format encoder ─────────────────────────────────────────────────
// Modern ICO = header + directory entries + PNG data blocks
// Spec: https://en.wikipedia.org/wiki/ICO_(file_format)

async function buildIcoFile(pngBlobs: Blob[]): Promise<Blob> {
  const pngBuffers: ArrayBuffer[] = [];
  for (const blob of pngBlobs) {
    pngBuffers.push(await blob.arrayBuffer());
  }

  // ICO Header: 6 bytes
  // reserved (2) + type=1 (2) + image count (2)
  const headerSize = 6;
  const entrySize = 16; // each directory entry
  const directorySize = entrySize * pngBuffers.length;
  let dataOffset = headerSize + directorySize;

  // Build header
  const header = new ArrayBuffer(headerSize);
  const headerView = new DataView(header);
  headerView.setUint16(0, 0, true); // reserved
  headerView.setUint16(2, 1, true); // type = ICO
  headerView.setUint16(4, pngBuffers.length, true); // image count

  // Build directory entries
  const directory = new ArrayBuffer(directorySize);
  const dirView = new DataView(directory);

  for (let i = 0; i < pngBuffers.length; i++) {
    const buf = pngBuffers[i];
    const offset = i * entrySize;

    // Parse PNG dimensions from IHDR chunk (bytes 16-23 of PNG)
    const pngView = new DataView(buf);
    const width = pngView.getUint32(16, false); // big-endian
    const height = pngView.getUint32(20, false);

    // ICO directory entry: width/height 0 means 256
    dirView.setUint8(offset + 0, width >= 256 ? 0 : width);
    dirView.setUint8(offset + 1, height >= 256 ? 0 : height);
    dirView.setUint8(offset + 2, 0); // color palette count
    dirView.setUint8(offset + 3, 0); // reserved
    dirView.setUint16(offset + 4, 1, true); // color planes
    dirView.setUint16(offset + 6, 32, true); // bits per pixel
    dirView.setUint32(offset + 8, buf.byteLength, true); // data size
    dirView.setUint32(offset + 12, dataOffset, true); // data offset

    dataOffset += buf.byteLength;
  }

  // Concatenate: header + directory + all PNG data
  const parts: ArrayBuffer[] = [header, directory, ...pngBuffers];
  return new Blob(parts, { type: "image/x-icon" });
}

// ── Size configurations ──────────────────────────────────────────────────────
const FAVICON_SIZES = [
  { size: 16, name: "favicon-16x16.png", label: "16×16" },
  { size: 32, name: "favicon-32x32.png", label: "32×32" },
  { size: 48, name: "favicon-48x48.png", label: "48×48 (ICO)" },
  { size: 180, name: "apple-touch-icon.png", label: "180×180 Apple" },
  { size: 192, name: "android-chrome-192x192.png", label: "192×192 Android" },
  { size: 512, name: "android-chrome-512x512.png", label: "512×512 Android" },
];

const ICO_SIZES = [16, 32, 48];

const HEAD_SNIPPET = `<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />`;

const WEBMANIFEST = JSON.stringify(
  {
    name: "",
    short_name: "",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  },
  null,
  2
);

export default function FaviconGeneratorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imgDims, setImgDims] = useState({ w: 0, h: 0 });
  const [transparentBg, setTransparentBg] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [padding, setPadding] = useState(0); // percentage 0-20
  const [browserTheme, setBrowserTheme] = useState<"dark" | "light">("dark");
  const [previewTab, setPreviewTab] = useState<"browser" | "mobile" | "assets">("browser");

  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Preview URLs for browser tab and homescreen mockups
  const [preview16Url, setPreview16Url] = useState<string | null>(null);
  const [preview32Url, setPreview32Url] = useState<string | null>(null);
  const [preview180Url, setPreview180Url] = useState<string | null>(null);
  const [previewOrigUrl, setPreviewOrigUrl] = useState<string | null>(null);

  const isSmallSource = imgDims.w > 0 && (imgDims.w < 260 || imgDims.h < 260);
  const isNonSquare = imgDims.w > 0 && imgDims.w !== imgDims.h;

  const subtleCheckerboard: React.CSSProperties = transparentBg
    ? {
        backgroundImage:
          "linear-gradient(45deg, rgba(140, 140, 140, 0.2) 25%, transparent 25%), linear-gradient(-45deg, rgba(140, 140, 140, 0.2) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(140, 140, 140, 0.2) 75%), linear-gradient(-45deg, transparent 75%, rgba(140, 140, 140, 0.2) 75%)",
        backgroundSize: "8px 8px",
        backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
      }
    : {};

  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    setProcessError(null);
    setSuccessMessage(null);

    const url = URL.createObjectURL(f);
    setPreviewOrigUrl(url);

    // Read dimensions
    const img = new Image();
    img.onload = () => {
      setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = url;
  };

  const handleClear = () => {
    if (previewOrigUrl) URL.revokeObjectURL(previewOrigUrl);
    if (preview16Url) URL.revokeObjectURL(preview16Url);
    if (preview32Url) URL.revokeObjectURL(preview32Url);
    if (preview180Url) URL.revokeObjectURL(preview180Url);
    setFile(null);
    setImgDims({ w: 0, h: 0 });
    setPreviewOrigUrl(null);
    setPreview16Url(null);
    setPreview32Url(null);
    setPreview180Url(null);
    setProcessError(null);
    setSuccessMessage(null);
  };

  // ── Resize with padding/background for non-square ──────────────────────
  const resizeToSquare = useCallback(
    async (img: HTMLImageElement, targetSize: number): Promise<Blob> => {
      const padFraction = padding / 100;
      const innerSize = Math.round(targetSize * (1 - padFraction * 2));
      const { canvas, ctx } = createCanvas(targetSize, targetSize);

      // Fill background if not transparent
      if (!transparentBg) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetSize, targetSize);
      }

      // Fit the image into the inner area, preserving aspect ratio
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const scale = Math.min(innerSize / srcW, innerSize / srcH);
      const drawW = Math.round(srcW * scale);
      const drawH = Math.round(srcH * scale);
      const drawX = Math.round((targetSize - drawW) / 2);
      const drawY = Math.round((targetSize - drawH) / 2);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      return canvasToBlob(canvas, "image/png", 1);
    },
    [bgColor, padding, transparentBg]
  );

  // ── Generate preview thumbnails ─────────────────────────────────────────
  const generatePreviews = useCallback(async () => {
    if (!file) return;
    try {
      const img = await loadImageFromFile(file);

      const blob16 = await resizeToSquare(img, 16);
      const blob32 = await resizeToSquare(img, 32);
      const blob180 = await resizeToSquare(img, 180);

      if (preview16Url) URL.revokeObjectURL(preview16Url);
      if (preview32Url) URL.revokeObjectURL(preview32Url);
      if (preview180Url) URL.revokeObjectURL(preview180Url);

      setPreview16Url(URL.createObjectURL(blob16));
      setPreview32Url(URL.createObjectURL(blob32));
      setPreview180Url(URL.createObjectURL(blob180));
    } catch (e) {
      console.warn("Preview gen error:", e);
    }
  }, [file, resizeToSquare]);

  useEffect(() => {
    const timer = setTimeout(() => generatePreviews(), 200);
    return () => clearTimeout(timer);
  }, [generatePreviews]);

  // ── Generate & download zip ─────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProcessError(null);
    setSuccessMessage(null);

    try {
      const img = await loadImageFromFile(file);
      const zip = new JSZip();

      // Generate all PNG sizes
      const pngMap = new Map<number, Blob>();
      for (const { size, name } of FAVICON_SIZES) {
        const blob = await resizeToSquare(img, size);
        pngMap.set(size, blob);
        zip.file(name, blob);
      }

      // Build ICO from 16, 32, 48
      const icoBlobs = ICO_SIZES.map((s) => pngMap.get(s)!);
      const icoBlob = await buildIcoFile(icoBlobs);
      zip.file("favicon.ico", icoBlob);

      // site.webmanifest
      zip.file("site.webmanifest", WEBMANIFEST);

      // Download zip
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "favicon-bundle.zip");
      setSuccessMessage("Favicon bundle downloaded!");
    } catch (err: any) {
      setProcessError(err?.message || "Failed to generate favicons.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy snippet
  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(HEAD_SNIPPET);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = HEAD_SNIPPET;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Privacy Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2.5 text-sm font-medium">
        <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
        <span>
          🔒 <strong>100% client-side.</strong> Your images never leave your browser.
        </span>
      </div>

      {/* Dropzone or file loaded */}
      {!file ? (
        <ImageDropzone
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Upload a high-res image (ideally 512×512 or larger)"
        />
      ) : (
        <div className="space-y-6">
          {/* File info */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {previewOrigUrl && (
                <img
                  src={previewOrigUrl}
                  alt="Source"
                  className="w-12 h-12 rounded-xl object-cover border border-[#E4E0D8] dark:border-[#2A2F48]"
                />
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-[#18181B] dark:text-[#F4F4F5] truncate">
                  {file.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>{imgDims.w} × {imgDims.h}px</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-2 rounded-xl text-[#71717A] hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0"
              title="Remove file"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Warnings */}
          {isSmallSource && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-2.5 text-sm">
              <AlertTriangle size={16} className="shrink-0" />
              Source image is small ({imgDims.w}×{imgDims.h}). Larger sizes (192px, 512px) may appear blurry.
            </div>
          )}
          {isNonSquare && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center gap-2.5 text-sm">
              <AlertTriangle size={16} className="shrink-0" />
              <span>
                Source image is not square. It will be centered
                {transparentBg
                  ? " with transparent padding."
                  : " — adjust the background color below."}
              </span>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Background & Padding */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-4">
              <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5]">
                Options
              </h3>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                    className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
                  />
                  <span>No background (transparent PNG)</span>
                </label>

                {transparentBg && (file?.type === "image/jpeg" || file?.type === "image/jpg") && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-2 leading-relaxed">
                    JPEGs have no transparency — only the padding around your image will be transparent.
                  </p>
                )}

                <div className={`transition-opacity ${transparentBg ? "opacity-40 pointer-events-none" : ""}`}>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      disabled={transparentBg}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] cursor-pointer disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      disabled={transparentBg}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                  Padding: {padding}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              {/* Generated sizes list */}
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-2">
                  Files included in bundle
                </label>
                <div className="space-y-1.5">
                  {[
                    "favicon.ico (16+32+48px)",
                    ...FAVICON_SIZES.filter((s) => !ICO_SIZES.includes(s.size) || s.size <= 32).map(
                      (s) => `${s.name} (${s.label})`
                    ),
                    "site.webmanifest",
                  ].map((name) => (
                    <div
                      key={name}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
                    >
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span className="font-mono">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview: Authentic Browser tab, Homescreen & Asset Inspection */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5]">
                  Live Preview
                </h3>

                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("browser")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewTab === "browser"
                        ? "bg-white dark:bg-[#2A2F48] text-violet-600 dark:text-violet-400 shadow-sm"
                        : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                  >
                    <Monitor size={13} />
                    <span>Browser</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("mobile")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewTab === "mobile"
                        ? "bg-white dark:bg-[#2A2F48] text-violet-600 dark:text-violet-400 shadow-sm"
                        : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                  >
                    <Smartphone size={13} />
                    <span>Mobile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("assets")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewTab === "assets"
                        ? "bg-white dark:bg-[#2A2F48] text-violet-600 dark:text-violet-400 shadow-sm"
                        : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                  >
                    <Layers size={13} />
                    <span>Assets</span>
                  </button>
                </div>
              </div>

              {/* BROWSER TAB MOCKUP */}
              {previewTab === "browser" && (
                <div className="space-y-2.5">
                  {/* Theme Switcher for Browser */}
                  <div className="flex items-center justify-between text-xs text-[#71717A]">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Monitor size={13} /> Chrome / Edge Tab View
                    </span>
                    <div className="flex items-center gap-1 bg-[#FAFAF8] dark:bg-[#1E2338] p-0.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48]">
                      <button
                        type="button"
                        onClick={() => setBrowserTheme("light")}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          browserTheme === "light"
                            ? "bg-white dark:bg-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] shadow-xs font-semibold"
                            : "text-[#71717A] hover:text-[#18181B]"
                        }`}
                      >
                        <Sun size={11} className="text-amber-500" />
                        <span>Light</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrowserTheme("dark")}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          browserTheme === "dark"
                            ? "bg-white dark:bg-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] shadow-xs font-semibold"
                            : "text-[#71717A] hover:text-[#18181B]"
                        }`}
                      >
                        <Moon size={11} className="text-violet-400" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>

                  {/* Authentic Browser Window */}
                  <div
                    className={`rounded-2xl border overflow-hidden shadow-xl transition-colors duration-200 ${
                      browserTheme === "dark"
                        ? "bg-[#1f2023] border-[#323639] text-[#e8eaed]"
                        : "bg-[#dfe1e5] border-[#c4c7cc] text-[#202124]"
                    }`}
                  >
                    {/* Top Tab Bar */}
                    <div className="flex items-center gap-2 pt-2.5 px-3">
                      {/* Window Controls */}
                      <div className="flex items-center gap-1.5 mr-1 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40" />
                      </div>

                      {/* Active Tab */}
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-t-xl min-w-[140px] max-w-[220px] flex-1 text-xs font-medium relative transition-colors ${
                          browserTheme === "dark"
                            ? "bg-[#292a2d] text-[#e8eaed] shadow-xs"
                            : "bg-[#ffffff] text-[#202124] shadow-sm"
                        }`}
                      >
                        {preview16Url ? (
                          <img
                            src={preview16Url}
                            alt="Favicon"
                            className="w-4 h-4 shrink-0 object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-sm bg-violet-500/20 shrink-0" />
                        )}
                        <span className="truncate flex-1 text-[11px] select-none">
                          {file?.name ? file.name.replace(/\.[^/.]+$/, "") : "Your Website"}
                        </span>
                        <X
                          size={12}
                          className="opacity-50 hover:opacity-100 cursor-pointer shrink-0 transition-opacity"
                        />
                      </div>

                      {/* Inactive Tab Mockup */}
                      <div
                        className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-[11px] opacity-60 select-none ${
                          browserTheme === "dark"
                            ? "text-[#9aa0a6] hover:bg-[#292a2d]/50"
                            : "text-[#5f6368] hover:bg-white/50"
                        } transition-colors`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-current opacity-30 shrink-0" />
                        <span className="truncate max-w-[80px]">New Tab</span>
                      </div>

                      {/* Add Tab Button */}
                      <div
                        className={`p-1 rounded-full opacity-60 hover:opacity-100 cursor-pointer transition-opacity ${
                          browserTheme === "dark" ? "hover:bg-[#35363a]" : "hover:bg-white/60"
                        }`}
                      >
                        <Plus size={13} />
                      </div>
                    </div>

                    {/* Navigation & Address Bar Toolbar */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2 border-t ${
                        browserTheme === "dark"
                          ? "bg-[#292a2d] border-[#323639]"
                          : "bg-[#ffffff] border-[#d3d7de]"
                      }`}
                    >
                      <div className="flex items-center gap-1 text-current opacity-60 shrink-0">
                        <ArrowLeft size={13} className="hover:opacity-100 cursor-pointer" />
                        <ArrowRight size={13} className="opacity-40" />
                        <RotateCw size={12} className="hover:opacity-100 cursor-pointer ml-0.5" />
                      </div>

                      {/* Omnibox / URL bar */}
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full flex-1 text-[11px] font-sans ${
                          browserTheme === "dark"
                            ? "bg-[#202124] text-[#9aa0a6] border border-[#3c4043]"
                            : "bg-[#f1f3f4] text-[#3c4043] border border-[#e0e3e7]"
                        }`}
                      >
                        <Lock size={10} className="text-emerald-500 shrink-0" />
                        <span className="truncate flex-1">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">https://</span>
                          <span>yoursite.com</span>
                        </span>
                        <Star size={11} className="opacity-40 hover:opacity-80 cursor-pointer shrink-0" />
                      </div>
                    </div>

                    {/* Mock Webpage Viewport */}
                    <div
                      className={`h-28 flex flex-col items-center justify-center p-4 text-center select-none ${
                        browserTheme === "dark" ? "bg-[#18191c]" : "bg-[#f8f9fa]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center mb-2">
                        {preview32Url ? (
                          <img
                            src={preview32Url}
                            alt="Logo"
                            className="w-5 h-5 object-contain"
                          />
                        ) : (
                          <Monitor size={16} className="text-violet-500" />
                        )}
                      </div>
                      <p className={`text-xs font-semibold ${browserTheme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {file?.name ? file.name.replace(/\.[^/.]+$/, "") : "Your Awesome Website"}
                      </p>
                      <p className="text-[10px] opacity-60 mt-0.5">
                        Favicon is live &amp; {transparentBg ? "transparently rendered" : `filled with ${bgColor}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MOBILE HOMESCREEN MOCKUP */}
              {previewTab === "mobile" && (
                <div className="space-y-2.5">
                  <div className="text-xs text-[#71717A] font-semibold flex items-center gap-1.5">
                    <Smartphone size={13} /> iOS &amp; Android Homescreen Display
                  </div>

                  <div className="rounded-2xl bg-gradient-to-b from-[#181a29] via-[#10121d] to-[#0c0d14] border border-[#2A2F48] p-6 text-white overflow-hidden shadow-xl">
                    <div className="max-w-xs mx-auto space-y-5">
                      <div className="text-[10px] text-center text-[#71717A] uppercase tracking-widest font-mono">
                        Homescreen Preview
                      </div>

                      <div className="flex items-center justify-around gap-4 pt-1">
                        {/* iOS Touch Icon (180x180) */}
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-16 h-16 rounded-[22%] shadow-2xl p-1 flex items-center justify-center overflow-hidden border border-white/10"
                            style={subtleCheckerboard}
                          >
                            {preview180Url && (
                              <img
                                src={preview180Url}
                                alt="Apple Touch Icon"
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-white/90 truncate max-w-[70px]">
                            iOS App
                          </span>
                          <span className="text-[9px] text-[#71717A]">180×180</span>
                        </div>

                        {/* Android Adaptive Icon */}
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-16 h-16 rounded-full shadow-2xl p-2 flex items-center justify-center overflow-hidden border border-white/10"
                            style={subtleCheckerboard}
                          >
                            {preview180Url && (
                              <img
                                src={preview180Url}
                                alt="Android Icon"
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-white/90 truncate max-w-[70px]">
                            Android
                          </span>
                          <span className="text-[9px] text-[#71717A]">Adaptive</span>
                        </div>

                        {/* 32px Web Shortcut */}
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden"
                            style={subtleCheckerboard}
                          >
                            {preview32Url && (
                              <img
                                src={preview32Url}
                                alt="Favicon 32px"
                                className="w-8 h-8 object-contain"
                              />
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-white/90 truncate max-w-[70px]">
                            Bookmark
                          </span>
                          <span className="text-[9px] text-[#71717A]">32×32</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ASSET TILES INSPECTION */}
              {previewTab === "assets" && (
                <div className="space-y-2.5">
                  <div className="text-xs text-[#71717A] font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers size={13} /> Generated PNG Assets
                    </span>
                    {transparentBg && (
                      <span className="text-[10px] text-violet-500 font-medium">
                        Alpha checkerboard active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* 180px */}
                    <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] flex flex-col items-center text-center">
                      <div
                        className="w-14 h-14 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-center p-1 overflow-hidden"
                        style={subtleCheckerboard}
                      >
                        {preview180Url && (
                          <img
                            src={preview180Url}
                            alt="180px"
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#18181B] dark:text-[#F4F4F5] mt-2">
                        180×180
                      </span>
                      <span className="text-[9px] text-[#71717A]">Apple Touch</span>
                    </div>

                    {/* 32px */}
                    <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] flex flex-col items-center text-center">
                      <div
                        className="w-14 h-14 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-center p-1 overflow-hidden"
                        style={subtleCheckerboard}
                      >
                        {preview32Url && (
                          <img
                            src={preview32Url}
                            alt="32px"
                            className="w-8 h-8 object-contain"
                          />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#18181B] dark:text-[#F4F4F5] mt-2">
                        32×32
                      </span>
                      <span className="text-[9px] text-[#71717A]">Retina Favicon</span>
                    </div>

                    {/* 16px */}
                    <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] flex flex-col items-center text-center">
                      <div
                        className="w-14 h-14 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-center p-1 overflow-hidden"
                        style={subtleCheckerboard}
                      >
                        {preview16Url && (
                          <img
                            src={preview16Url}
                            alt="16px"
                            className="w-4 h-4 shrink-0"
                            style={{ imageRendering: "pixelated" }}
                          />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#18181B] dark:text-[#F4F4F5] mt-2">
                        16×16
                      </span>
                      <span className="text-[9px] text-[#71717A]">Classic Favicon</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Head snippet */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#18181B] dark:text-[#F4F4F5]">
                HTML &lt;head&gt; Snippet
              </h3>
              <button
                onClick={handleCopySnippet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-500 hover:bg-violet-500/10 transition-colors"
              >
                {copiedSnippet ? (
                  <>
                    <CheckCircle2 size={13} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs text-[#18181B] dark:text-[#F4F4F5] font-mono overflow-x-auto whitespace-pre">
              {HEAD_SNIPPET}
            </pre>
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

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating favicons…
              </>
            ) : (
              <>
                <Archive size={20} />
                Generate &amp; Download All
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
