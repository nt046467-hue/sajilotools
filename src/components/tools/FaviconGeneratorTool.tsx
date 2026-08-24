"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Download,
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
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Lock,
  Plus,
  Minus,
  X,
  Star,
  Layers,
  Crop,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
} from "lucide-react";
import AnimatedTrashIcon, { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";
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
async function buildIcoFile(pngBlobs: Blob[]): Promise<Blob> {
  const pngBuffers: ArrayBuffer[] = [];
  for (const blob of pngBlobs) {
    pngBuffers.push(await blob.arrayBuffer());
  }

  const headerSize = 6;
  const entrySize = 16;
  const directorySize = entrySize * pngBuffers.length;
  let dataOffset = headerSize + directorySize;

  const header = new ArrayBuffer(headerSize);
  const headerView = new DataView(header);
  headerView.setUint16(0, 0, true);
  headerView.setUint16(2, 1, true);
  headerView.setUint16(4, pngBuffers.length, true);

  const directory = new ArrayBuffer(directorySize);
  const dirView = new DataView(directory);

  for (let i = 0; i < pngBuffers.length; i++) {
    const buf = pngBuffers[i];
    const offset = i * entrySize;

    const pngView = new DataView(buf);
    const width = pngView.getUint32(16, false);
    const height = pngView.getUint32(20, false);

    dirView.setUint8(offset + 0, width >= 256 ? 0 : width);
    dirView.setUint8(offset + 1, height >= 256 ? 0 : height);
    dirView.setUint8(offset + 2, 0);
    dirView.setUint8(offset + 3, 0);
    dirView.setUint16(offset + 4, 1, true);
    dirView.setUint16(offset + 6, 32, true);
    dirView.setUint32(offset + 8, buf.byteLength, true);
    dirView.setUint32(offset + 12, dataOffset, true);

    dataOffset += buf.byteLength;
  }

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

interface CropRect {
  x: number;
  y: number;
  size: number;
}

export default function FaviconGeneratorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imgDims, setImgDims] = useState({ w: 0, h: 0 });
  const [fitMode, setFitMode] = useState<"crop" | "fit">("crop");
  const [transparentBg, setTransparentBg] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [padding, setPadding] = useState(0); // percentage 0-20
  const [browserTheme, setBrowserTheme] = useState<"dark" | "light">("dark");
  const [previewTab, setPreviewTab] = useState<"browser" | "mobile" | "assets">("browser");

  // ── Crop & Pan/Zoom State ──
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, size: 0 });
  const [zoomLevel, setZoomLevel] = useState(1); // 1 to 3

  // Dragging state for crop box
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<"move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCropRect, setInitialCropRect] = useState<CropRect>({ x: 0, y: 0, size: 0 });

  // Pinch-to-zoom touch state
  const touchDistanceRef = useRef<number | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Preview URLs
  const [preview16Url, setPreview16Url] = useState<string | null>(null);
  const [preview32Url, setPreview32Url] = useState<string | null>(null);
  const [preview180Url, setPreview180Url] = useState<string | null>(null);
  const [preview512Url, setPreview512Url] = useState<string | null>(null);
  const [previewOrigUrl, setPreviewOrigUrl] = useState<string | null>(null);

  // DOM Refs
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);
  const loadedImageObjRef = useRef<HTMLImageElement | null>(null);

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

  // Reset crop to center 1:1 default
  const resetCropToCenter = useCallback((natW: number, natH: number) => {
    if (!natW || !natH) return;
    const minDim = Math.min(natW, natH);
    const newRect = {
      x: Math.round((natW - minDim) / 2),
      y: Math.round((natH - minDim) / 2),
      size: Math.round(minDim),
    };
    setCropRect(newRect);
    setZoomLevel(1);
  }, []);

  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    setProcessError(null);
    setSuccessMessage(null);

    const url = URL.createObjectURL(f);
    setPreviewOrigUrl(url);

    const img = new Image();
    img.onload = () => {
      loadedImageObjRef.current = img;
      setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
      resetCropToCenter(img.naturalWidth, img.naturalHeight);
    };
    img.src = url;
  };

  const handleClear = () => {
    if (previewOrigUrl) URL.revokeObjectURL(previewOrigUrl);
    if (preview16Url) URL.revokeObjectURL(preview16Url);
    if (preview32Url) URL.revokeObjectURL(preview32Url);
    if (preview180Url) URL.revokeObjectURL(preview180Url);
    if (preview512Url) URL.revokeObjectURL(preview512Url);
    setFile(null);
    setImgDims({ w: 0, h: 0 });
    setPreviewOrigUrl(null);
    setPreview16Url(null);
    setPreview32Url(null);
    setPreview180Url(null);
    setPreview512Url(null);
    setProcessError(null);
    setSuccessMessage(null);
    setCropRect({ x: 0, y: 0, size: 0 });
    setZoomLevel(1);
    loadedImageObjRef.current = null;
  };

  // ── Render 1:1 square canvas at target size with multi-step downsampling ───
  const renderSquareBlob = useCallback(
    async (img: HTMLImageElement, targetSize: number): Promise<Blob> => {
      const padFraction = padding / 100;
      const innerSize = Math.max(1, Math.round(targetSize * (1 - padFraction * 2)));
      const innerOffset = Math.round(targetSize * padFraction);
      const { canvas, ctx } = createCanvas(targetSize, targetSize);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Background
      if (!transparentBg) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetSize, targetSize);
      }

      // Step-down helper for high-quality, razor-sharp downscaling
      const drawSharp = (
        sourceImg: HTMLImageElement,
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        dx: number,
        dy: number,
        dw: number,
        dh: number
      ) => {
        let curW = sw;
        let curH = sh;

        // Create temporary canvas for step-down
        let curCanvas = document.createElement("canvas");
        curCanvas.width = curW;
        curCanvas.height = curH;
        let curCtx = curCanvas.getContext("2d");
        if (!curCtx) {
          ctx.drawImage(sourceImg, sx, sy, sw, sh, dx, dy, dw, dh);
          return;
        }
        curCtx.imageSmoothingEnabled = true;
        curCtx.imageSmoothingQuality = "high";
        curCtx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, curW, curH);

        // Step-down halve dimensions if more than 2x target size to avoid aliasing and blur
        while (curW > dw * 2 && curH > dh * 2) {
          const nextW = Math.max(Math.floor(curW / 2), dw);
          const nextH = Math.max(Math.floor(curH / 2), dh);
          const nextCanvas = document.createElement("canvas");
          nextCanvas.width = nextW;
          nextCanvas.height = nextH;
          const nextCtx = nextCanvas.getContext("2d");
          if (!nextCtx) break;
          nextCtx.imageSmoothingEnabled = true;
          nextCtx.imageSmoothingQuality = "high";
          nextCtx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);

          curCanvas = nextCanvas;
          curW = nextW;
          curH = nextH;
        }

        ctx.drawImage(curCanvas, 0, 0, curW, curH, dx, dy, dw, dh);
      };

      if (fitMode === "crop" && cropRect.size > 0) {
        // Draw cropped 1:1 sub-rectangle
        drawSharp(
          img,
          cropRect.x,
          cropRect.y,
          cropRect.size,
          cropRect.size,
          innerOffset,
          innerOffset,
          innerSize,
          innerSize
        );
      } else {
        // Fit & Pad (letterbox)
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;
        const scale = Math.min(innerSize / srcW, innerSize / srcH);
        const drawW = Math.max(1, Math.round(srcW * scale));
        const drawH = Math.max(1, Math.round(srcH * scale));
        const drawX = Math.round((targetSize - drawW) / 2);
        const drawY = Math.round((targetSize - drawH) / 2);

        drawSharp(img, 0, 0, srcW, srcH, drawX, drawY, drawW, drawH);
      }

      return canvasToBlob(canvas, "image/png", 1);
    },
    [bgColor, cropRect, fitMode, padding, transparentBg]
  );

  // ── Generate preview thumbnails in real time ────────────────────────────────
  const generatePreviews = useCallback(async () => {
    if (!file) return;
    try {
      let img = loadedImageObjRef.current;
      if (!img) {
        img = await loadImageFromFile(file);
        loadedImageObjRef.current = img;
      }

      const [blob16, blob32, blob180, blob512] = await Promise.all([
        renderSquareBlob(img, 16),
        renderSquareBlob(img, 32),
        renderSquareBlob(img, 180),
        renderSquareBlob(img, 512),
      ]);

      if (preview16Url) URL.revokeObjectURL(preview16Url);
      if (preview32Url) URL.revokeObjectURL(preview32Url);
      if (preview180Url) URL.revokeObjectURL(preview180Url);
      if (preview512Url) URL.revokeObjectURL(preview512Url);

      setPreview16Url(URL.createObjectURL(blob16));
      setPreview32Url(URL.createObjectURL(blob32));
      setPreview180Url(URL.createObjectURL(blob180));
      setPreview512Url(URL.createObjectURL(blob512));
    } catch (e) {
      console.warn("Preview gen error:", e);
    }
  }, [file, preview16Url, preview32Url, preview180Url, preview512Url, renderSquareBlob]);

  useEffect(() => {
    const timer = setTimeout(() => generatePreviews(), 120);
    return () => clearTimeout(timer);
  }, [cropRect, fitMode, transparentBg, bgColor, padding]);

  // ── Zoom Adjustment ────────────────────────────────────────────────────────
  const handleZoomChange = (newZoom: number) => {
    if (!imgDims.w || !imgDims.h) return;
    const clampedZoom = Math.max(1, Math.min(3, newZoom));
    setZoomLevel(clampedZoom);

    const minDim = Math.min(imgDims.w, imgDims.h);
    const newSize = Math.max(16, Math.round(minDim / clampedZoom));

    // Keep center of current crop
    const currentCenterX = cropRect.x + cropRect.size / 2;
    const currentCenterY = cropRect.y + cropRect.size / 2;

    let newX = Math.round(currentCenterX - newSize / 2);
    let newY = Math.round(currentCenterY - newSize / 2);

    newX = Math.max(0, Math.min(imgDims.w - newSize, newX));
    newY = Math.max(0, Math.min(imgDims.h - newSize, newY));

    setCropRect({ x: newX, y: newY, size: newSize });
  };

  // ── Drag & Resize Interaction Logic ─────────────────────────────────────────
  const getScaleFactor = () => {
    if (!imageElementRef.current || !imgDims.w) return 1;
    const rect = imageElementRef.current.getBoundingClientRect();
    return rect.width / imgDims.w;
  };

  const handlePointerDown = (
    e: React.MouseEvent | React.TouchEvent,
    action: "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"
  ) => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    setIsDragging(true);
    setDragAction(action);
    setDragStart({ x: clientX, y: clientY });
    setInitialCropRect({ ...cropRect });
  };

  useEffect(() => {
    if (!isDragging || !dragAction) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      // Handle pinch zoom if 2 touches
      if ("touches" in e && (e as TouchEvent).touches.length === 2) {
        const t1 = (e as TouchEvent).touches[0];
        const t2 = (e as TouchEvent).touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

        if (touchDistanceRef.current !== null) {
          const delta = (dist - touchDistanceRef.current) * 0.01;
          handleZoomChange(zoomLevel + delta);
        }
        touchDistanceRef.current = dist;
        return;
      }

      const clientX = "touches" in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      const scale = getScaleFactor();
      if (!scale || !imgDims.w || !imgDims.h) return;

      const dx = (clientX - dragStart.x) / scale;
      const dy = (clientY - dragStart.y) / scale;

      if (dragAction === "move") {
        let newX = Math.round(initialCropRect.x + dx);
        let newY = Math.round(initialCropRect.y + dy);

        newX = Math.max(0, Math.min(imgDims.w - initialCropRect.size, newX));
        newY = Math.max(0, Math.min(imgDims.h - initialCropRect.size, newY));

        setCropRect({
          x: newX,
          y: newY,
          size: initialCropRect.size,
        });
      } else {
        // Corner & Edge 1:1 Resizing
        let delta = 0;
        let newX = initialCropRect.x;
        let newY = initialCropRect.y;
        let newSize = initialCropRect.size;

        if (dragAction === "se" || dragAction === "e" || dragAction === "s") {
          delta = Math.max(dx, dy);
          newSize = Math.max(24, Math.min(imgDims.w - initialCropRect.x, imgDims.h - initialCropRect.y, initialCropRect.size + delta));
        } else if (dragAction === "nw") {
          delta = Math.min(dx, dy);
          const potentialSize = initialCropRect.size - delta;
          if (potentialSize >= 24) {
            const shift = initialCropRect.size - potentialSize;
            newX = Math.max(0, initialCropRect.x + shift);
            newY = Math.max(0, initialCropRect.y + shift);
            newSize = Math.min(initialCropRect.x + initialCropRect.size - newX, initialCropRect.y + initialCropRect.size - newY);
          }
        } else if (dragAction === "ne" || dragAction === "n") {
          delta = Math.max(dx, -dy);
          const potentialSize = Math.max(24, initialCropRect.size + delta);
          const allowedSize = Math.min(potentialSize, imgDims.w - initialCropRect.x, initialCropRect.y + initialCropRect.size);
          newY = initialCropRect.y + initialCropRect.size - allowedSize;
          newSize = allowedSize;
        } else if (dragAction === "sw" || dragAction === "w") {
          delta = Math.max(-dx, dy);
          const potentialSize = Math.max(24, initialCropRect.size + delta);
          const allowedSize = Math.min(potentialSize, initialCropRect.x + initialCropRect.size, imgDims.h - initialCropRect.y);
          newX = initialCropRect.x + initialCropRect.size - allowedSize;
          newSize = allowedSize;
        }

        setCropRect({
          x: Math.round(newX),
          y: Math.round(newY),
          size: Math.round(newSize),
        });

        // Update zoomLevel display according to size
        const minDim = Math.min(imgDims.w, imgDims.h);
        if (newSize > 0) {
          setZoomLevel(parseFloat((minDim / newSize).toFixed(2)));
        }
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setDragAction(null);
      touchDistanceRef.current = null;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: false });
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isDragging, dragAction, dragStart, initialCropRect, imgDims, zoomLevel]);

  // ── Generate & download zip bundle ──────────────────────────────────────────
  const handleGenerate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProcessError(null);
    setSuccessMessage(null);

    try {
      let img = loadedImageObjRef.current;
      if (!img) {
        img = await loadImageFromFile(file);
        loadedImageObjRef.current = img;
      }

      const zip = new JSZip();

      // Generate all PNG sizes
      const pngMap = new Map<number, Blob>();
      for (const { size, name } of FAVICON_SIZES) {
        const blob = await renderSquareBlob(img, size);
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
      setSuccessMessage("Favicon bundle successfully generated and downloaded!");
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

  // Crop Box percentage calculations for screen rendering
  const cropLeftPct = imgDims.w ? (cropRect.x / imgDims.w) * 100 : 0;
  const cropTopPct = imgDims.h ? (cropRect.y / imgDims.h) * 100 : 0;
  const cropWidthPct = imgDims.w ? (cropRect.size / imgDims.w) * 100 : 100;
  const cropHeightPct = imgDims.h ? (cropRect.size / imgDims.h) * 100 : 100;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Privacy Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2.5 text-sm font-medium">
        <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
        <span>
          🔒 <strong>100% Client-Side Processing.</strong> Your images are cropped and rendered entirely in your browser.
        </span>
      </div>

      {/* Dropzone or file loaded */}
      {!file ? (
        <ImageDropzone
          multiple={false}
          onFilesSelected={handleFilesSelected}
          description="Upload any logo, icon, or photo (square, landscape, or portrait)"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info Bar */}
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
                  <span>
                    {imgDims.w} × {imgDims.h}px
                  </span>
                  {isNonSquare && (
                    <span className="px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-500 text-[10px] font-bold">
                      Non-Square
                    </span>
                  )}
                </div>
              </div>
            </div>
            <AnimatedTrashButton
              onDelete={handleClear}
              className="p-2 rounded-xl text-[#71717A] hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0"
              title="Remove file"
              iconSize={16}
            />
          </div>

          {/* Small source warning */}
          {isSmallSource && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-2.5 text-xs">
              <AlertTriangle size={15} className="shrink-0" />
              Source image is small ({imgDims.w}×{imgDims.h}px). Larger sizes (192px, 512px) may appear pixelated.
            </div>
          )}

          {/* Mode Switcher Banner */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                Cropping &amp; Framing Mode
              </span>
              <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                {fitMode === "crop"
                  ? "Drag and resize the square box or use the zoom slider to select the exact favicon area."
                  : "Fits the entire image inside a square canvas with optional padding and background color."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-[#FAFAF8] dark:bg-[#1E2338] rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] shrink-0">
              <button
                type="button"
                onClick={() => setFitMode("crop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  fitMode === "crop"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                }`}
              >
                <Crop size={13} />
                <span>Manual 1:1 Crop</span>
              </button>
              <button
                type="button"
                onClick={() => setFitMode("fit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  fitMode === "fit"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                }`}
              >
                <Maximize2 size={13} />
                <span>Fit with Padding</span>
              </button>
            </div>
          </div>

          {/* ── INTERACTIVE 1:1 CROP WORKSPACE ───────────────────────────────── */}
          {fitMode === "crop" && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                    <Crop size={16} className="text-violet-500" />
                    Interactive 1:1 Square Crop &amp; Reposition
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] font-bold">
                    {Math.round(cropRect.size)} × {Math.round(cropRect.size)}px
                  </span>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => resetCropToCenter(imgDims.w, imgDims.h)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] hover:bg-violet-500/10 hover:text-violet-500 transition-colors"
                    title="Center and reset crop area"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Crop</span>
                  </button>
                </div>
              </div>

              {/* Crop Canvas Viewport */}
              <div
                ref={editorContainerRef}
                className="relative rounded-2xl overflow-hidden bg-[#0C0F1E] border border-[#2A2F48] flex items-center justify-center select-none touch-none min-h-[300px] sm:min-h-[380px] max-h-[500px]"
                style={{ cursor: isDragging ? "grabbing" : "default" }}
              >
                {previewOrigUrl && (
                  <div className="relative inline-block max-w-full max-h-[480px]">
                    {/* The Source Image */}
                    <img
                      ref={imageElementRef}
                      src={previewOrigUrl}
                      alt="Source for cropping"
                      draggable={false}
                      className="block max-w-full max-h-[460px] object-contain select-none pointer-events-none mx-auto"
                    />

                    {/* Darkened Mask Overlays Outside Crop Box */}
                    {/* Top Mask */}
                    <div
                      className="absolute left-0 top-0 right-0 bg-black/60 backdrop-blur-[1px] pointer-events-none transition-[top,height]"
                      style={{ height: `${cropTopPct}%` }}
                    />
                    {/* Bottom Mask */}
                    <div
                      className="absolute left-0 right-0 bottom-0 bg-black/60 backdrop-blur-[1px] pointer-events-none"
                      style={{ top: `${cropTopPct + cropHeightPct}%` }}
                    />
                    {/* Left Mask */}
                    <div
                      className="absolute left-0 bg-black/60 backdrop-blur-[1px] pointer-events-none"
                      style={{
                        top: `${cropTopPct}%`,
                        height: `${cropHeightPct}%`,
                        width: `${cropLeftPct}%`,
                      }}
                    />
                    {/* Right Mask */}
                    <div
                      className="absolute right-0 bg-black/60 backdrop-blur-[1px] pointer-events-none"
                      style={{
                        top: `${cropTopPct}%`,
                        height: `${cropHeightPct}%`,
                        left: `${cropLeftPct + cropWidthPct}%`,
                      }}
                    />

                    {/* 1:1 Interactive Draggable Crop Box */}
                    <div
                      onMouseDown={(e) => handlePointerDown(e, "move")}
                      onTouchStart={(e) => handlePointerDown(e, "move")}
                      className="absolute border-2 border-violet-400 dark:border-violet-400 shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_0_20px_rgba(139,92,246,0.35)] cursor-move group"
                      style={{
                        left: `${cropLeftPct}%`,
                        top: `${cropTopPct}%`,
                        width: `${cropWidthPct}%`,
                        height: `${cropHeightPct}%`,
                      }}
                    >
                      {/* Rule-of-Thirds Grid Lines */}
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                        <div className="border-r border-b border-white/25" />
                        <div className="border-r border-b border-white/25" />
                        <div className="border-b border-white/25" />
                        <div className="border-r border-b border-white/25" />
                        <div className="border-r border-b border-white/25" />
                        <div className="border-b border-white/25" />
                        <div className="border-r border-white/25" />
                        <div className="border-r border-white/25" />
                        <div />
                      </div>

                      {/* Center Crosshair Indicator */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity">
                        <Move size={20} className="text-white drop-shadow" />
                      </div>

                      {/* 4 Corner Resize Handles */}
                      {/* NW Handle */}
                      <div
                        onMouseDown={(e) => handlePointerDown(e, "nw")}
                        onTouchStart={(e) => handlePointerDown(e, "nw")}
                        className="absolute -top-2 -left-2 w-5 h-5 bg-white border-2 border-violet-600 rounded-sm shadow-md cursor-nwse-resize z-10"
                      />
                      {/* NE Handle */}
                      <div
                        onMouseDown={(e) => handlePointerDown(e, "ne")}
                        onTouchStart={(e) => handlePointerDown(e, "ne")}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-white border-2 border-violet-600 rounded-sm shadow-md cursor-nesw-resize z-10"
                      />
                      {/* SW Handle */}
                      <div
                        onMouseDown={(e) => handlePointerDown(e, "sw")}
                        onTouchStart={(e) => handlePointerDown(e, "sw")}
                        className="absolute -bottom-2 -left-2 w-5 h-5 bg-white border-2 border-violet-600 rounded-sm shadow-md cursor-nesw-resize z-10"
                      />
                      {/* SE Handle */}
                      <div
                        onMouseDown={(e) => handlePointerDown(e, "se")}
                        onTouchStart={(e) => handlePointerDown(e, "se")}
                        className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-violet-600 rounded-sm shadow-md cursor-nwse-resize z-10"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Zoom & Scale Slider Control */}
              <div className="p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <ZoomIn size={16} className="text-violet-500" />
                  <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                    Zoom / Crop Scale
                  </span>
                  <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 min-w-[36px]">
                    {zoomLevel.toFixed(1)}×
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-1 w-full">
                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoomLevel - 0.2)}
                    disabled={zoomLevel <= 1}
                    className="p-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-white dark:hover:bg-[#2A2F48] text-[#71717A] disabled:opacity-40"
                    title="Zoom out"
                  >
                    <Minus size={13} />
                  </button>

                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoomLevel}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoomLevel + 0.2)}
                    disabled={zoomLevel >= 3}
                    className="p-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-white dark:hover:bg-[#2A2F48] text-[#71717A] disabled:opacity-40"
                    title="Zoom in"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleZoomChange(1)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                      zoomLevel === 1
                        ? "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400"
                        : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A]"
                    }`}
                  >
                    1.0×
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoomChange(1.5)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                      Math.abs(zoomLevel - 1.5) < 0.1
                        ? "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400"
                        : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A]"
                    }`}
                  >
                    1.5×
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoomChange(2.0)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                      Math.abs(zoomLevel - 2.0) < 0.1
                        ? "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400"
                        : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A]"
                    }`}
                  >
                    2.0×
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Options & Previews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Background & Padding Options */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-4">
              <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                <Sliders size={16} className="text-violet-500" />
                Color &amp; Inset Settings
              </h3>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                    className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
                  />
                  <span>Transparent background (PNG/ICO alpha channel)</span>
                </label>

                {transparentBg && (file?.type === "image/jpeg" || file?.type === "image/jpg") && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-2 leading-relaxed">
                    JPEGs have no transparency — only inset margins will be transparent.
                  </p>
                )}

                <div className={`transition-opacity ${transparentBg ? "opacity-40 pointer-events-none" : ""}`}>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                    Background Color Fill
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      disabled={transparentBg}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] cursor-pointer disabled:cursor-not-allowed"
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
                <div className="flex items-center justify-between text-xs font-semibold text-[#71717A] mb-1.5">
                  <span>Edge Inset Padding</span>
                  <span className="font-mono text-violet-500">{padding}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
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

            {/* Live Preview: Browser tab, Homescreen & Asset Inspection */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                  <Monitor size={16} className="text-violet-500" />
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

                  <div
                    className={`rounded-2xl border overflow-hidden shadow-xl transition-colors duration-200 ${
                      browserTheme === "dark"
                        ? "bg-[#1f2023] border-[#323639] text-[#e8eaed]"
                        : "bg-[#dfe1e5] border-[#c4c7cc] text-[#202124]"
                    }`}
                  >
                    {/* Top Tab Bar */}
                    <div className="flex items-center gap-2 pt-2.5 px-3">
                      <div className="flex items-center gap-1.5 mr-1 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40" />
                      </div>

                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-t-xl min-w-[140px] max-w-[220px] flex-1 text-xs font-medium relative transition-colors ${
                          browserTheme === "dark"
                            ? "bg-[#292a2d] text-[#e8eaed] shadow-xs"
                            : "bg-[#ffffff] text-[#202124] shadow-sm"
                        }`}
                      >
                        {preview512Url || preview180Url || previewOrigUrl ? (
                          <img
                            src={preview512Url || preview180Url || previewOrigUrl || ""}
                            alt="Favicon"
                            className="w-4 h-4 shrink-0 object-cover rounded-xs"
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

                      <div
                        className={`p-1 rounded-full opacity-60 hover:opacity-100 cursor-pointer transition-opacity ${
                          browserTheme === "dark" ? "hover:bg-[#35363a]" : "hover:bg-white/60"
                        }`}
                      >
                        <Plus size={13} />
                      </div>
                    </div>

                    {/* Navigation Bar */}
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

                    {/* Mock Page Viewport */}
                    <div
                      className={`h-28 flex flex-col items-center justify-center p-4 text-center select-none ${
                        browserTheme === "dark" ? "bg-[#18191c]" : "bg-[#f8f9fa]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center mb-2">
                        {preview512Url || preview180Url || previewOrigUrl ? (
                          <img
                            src={preview512Url || preview180Url || previewOrigUrl || ""}
                            alt="Logo"
                            className="w-6 h-6 object-cover rounded-md"
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
                        {/* iOS Touch Icon */}
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-16 h-16 rounded-[22%] shadow-2xl p-1 flex items-center justify-center overflow-hidden border border-white/10"
                            style={subtleCheckerboard}
                          >
                            {preview512Url || preview180Url ? (
                              <img
                                src={preview512Url || preview180Url || ""}
                                alt="Apple Touch Icon"
                                className="w-full h-full object-cover"
                              />
                            ) : null}
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
                            {preview512Url || preview180Url ? (
                              <img
                                src={preview512Url || preview180Url || ""}
                                alt="Android Icon"
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>
                          <span className="text-[11px] font-medium text-white/90 truncate max-w-[70px]">
                            Android
                          </span>
                          <span className="text-[9px] text-[#71717A]">Adaptive</span>
                        </div>

                        {/* 32px Web Bookmark */}
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden"
                            style={subtleCheckerboard}
                          >
                            {preview512Url || preview180Url || preview32Url ? (
                              <img
                                src={preview512Url || preview180Url || preview32Url || ""}
                                alt="Favicon 32px"
                                className="w-8 h-8 object-cover rounded-sm"
                              />
                            ) : null}
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
                            className="w-4 h-4 shrink-0 object-contain"
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

          {/* Error / Success Alerts */}
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

          {/* Generate & Download All Button */}
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
                Generate &amp; Download All Favicons (.ZIP)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
