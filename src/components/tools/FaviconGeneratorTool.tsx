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
  const [bgColor, setBgColor] = useState("#ffffff");
  const [padding, setPadding] = useState(0); // percentage 0-20

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

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetSize, targetSize);

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
    [bgColor, padding]
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
              Source image is not square. It will be fitted with background fill — adjust the color below.
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
                <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
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

            {/* Preview: Browser tab & Homescreen mockups */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-5">
              <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5]">
                Preview
              </h3>

              {/* Browser tab mockup */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#71717A]">
                  <Monitor size={14} />
                  Browser Tab
                </div>
                <div className="rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] overflow-hidden">
                  {/* Tab bar */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E4E0D8] dark:border-[#2A2F48] bg-[#F0EDE8] dark:bg-[#191D30]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] min-w-0 flex-1 max-w-[200px]">
                      {preview16Url && (
                        <img
                          src={preview16Url}
                          alt="Favicon 16px"
                          className="w-4 h-4 shrink-0"
                          style={{ imageRendering: "pixelated" }}
                        />
                      )}
                      <span className="text-[10px] text-[#71717A] truncate">
                        Your Website
                      </span>
                    </div>
                  </div>
                  {/* Page area */}
                  <div className="h-16 flex items-center justify-center text-xs text-[#A1A1AA]">
                    Page content
                  </div>
                </div>
              </div>

              {/* Homescreen mockup */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#71717A]">
                  <Smartphone size={14} />
                  App Icon / Homescreen
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
                  {preview180Url && (
                    <div className="space-y-1.5 text-center">
                      <img
                        src={preview180Url}
                        alt="Apple touch icon"
                        className="w-16 h-16 rounded-2xl shadow-md border border-[#E4E0D8] dark:border-[#2A2F48]"
                      />
                      <p className="text-[9px] text-[#71717A]">180×180</p>
                    </div>
                  )}
                  {preview32Url && (
                    <div className="space-y-1.5 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-center shadow-md">
                        <img
                          src={preview32Url}
                          alt="Favicon 32px"
                          className="w-8 h-8"
                          style={{ imageRendering: "auto" }}
                        />
                      </div>
                      <p className="text-[9px] text-[#71717A]">32×32</p>
                    </div>
                  )}
                  {preview16Url && (
                    <div className="space-y-1.5 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-center shadow-md">
                        <img
                          src={preview16Url}
                          alt="Favicon 16px"
                          className="w-4 h-4"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <p className="text-[9px] text-[#71717A]">16×16</p>
                    </div>
                  )}
                </div>
              </div>
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
