import { PDFDocument, degrees, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";

/**
 * Custom error types for PDF loading
 */
export class EncryptedPdfError extends Error {
  constructor() {
    super("This PDF is password-protected. Please remove the password first.");
    this.name = "EncryptedPdfError";
  }
}

export class InvalidPdfError extends Error {
  constructor() {
    super("This file doesn't look like a valid PDF.");
    this.name = "InvalidPdfError";
  }
}

/**
 * Loads a File into a pdf-lib PDFDocument
 */
export async function loadPdfFile(file: File): Promise<PDFDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // ignoreEncryption: false by default in pdf-lib so encrypted files throw
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    return pdfDoc;
  } catch (err: any) {
    const msg = String(err?.message || "").toLowerCase();
    if (msg.includes("encrypted") || msg.includes("password") || err?.name === "EncryptedPDFError") {
      throw new EncryptedPdfError();
    }
    throw new InvalidPdfError();
  }
}

/**
 * Gets total page count of a PDF file
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const doc = await loadPdfFile(file);
  return doc.getPageCount();
}

/**
 * Merges multiple PDF files into one single PDF Blob in the provided order
 */
export async function mergePdfs(files: File[]): Promise<Blob> {
  if (files.length === 0) {
    throw new Error("At least one PDF file is required to merge.");
  }

  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const srcDoc = await loadPdfFile(file);
    const indices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, indices);
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }

  const pdfBytes = await mergedDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export interface PageRange {
  start: number; // 1-based index
  end: number;   // 1-based index
  label?: string;
}

/**
 * Parses user range string (e.g. "1, 3, 5-7") into array of 1-based PageRanges
 */
export function parsePageRanges(input: string, totalPages: number): PageRange[] {
  const cleanInput = input.trim();
  if (!cleanInput) {
    throw new Error("Range string cannot be empty.");
  }

  const parts = cleanInput.split(",").map((p) => p.trim()).filter(Boolean);
  const ranges: PageRange[] = [];

  for (const part of parts) {
    if (part.includes("-")) {
      const subParts = part.split("-").map((s) => s.trim());
      if (subParts.length !== 2) {
        throw new Error(`Invalid range format: "${part}"`);
      }

      const start = parseInt(subParts[0], 10);
      const end = parseInt(subParts[1], 10);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid numbers in range: "${part}"`);
      }

      if (start > end) {
        throw new Error(`Start page (${start}) cannot be greater than end page (${end}) in range "${part}".`);
      }

      if (start < 1 || end > totalPages) {
        throw new Error(`Page range "${part}" is out of bounds (1 to ${totalPages}).`);
      }

      ranges.push({ start, end, label: `pages_${start}_to_${end}` });
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum)) {
        throw new Error(`Invalid page number: "${part}"`);
      }

      if (pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Page number ${pageNum} is out of bounds (1 to ${totalPages}).`);
      }

      ranges.push({ start: pageNum, end: pageNum, label: `page_${pageNum}` });
    }
  }

  return ranges;
}

/**
 * Splits a PDF file into multiple Blobs corresponding to ranges
 */
export async function splitPdfByRanges(
  file: File,
  ranges: PageRange[]
): Promise<{ name: string; blob: Blob }[]> {
  const srcDoc = await loadPdfFile(file);
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const results: { name: string; blob: Blob }[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const newDoc = await PDFDocument.create();

    // 0-based page indices for pdf-lib
    const pageIndices: number[] = [];
    for (let p = range.start; p <= range.end; p++) {
      pageIndices.push(p - 1);
    }

    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const name = `${baseName}_${range.label || `part_${i + 1}`}.pdf`;

    results.push({ name, blob });
  }

  return results;
}

/**
 * Splits PDF every N pages
 */
export async function splitPdfEveryN(
  file: File,
  n: number
): Promise<{ name: string; blob: Blob }[]> {
  const totalPages = await getPdfPageCount(file);
  const ranges: PageRange[] = [];

  for (let i = 1; i <= totalPages; i += n) {
    const start = i;
    const end = Math.min(i + n - 1, totalPages);
    ranges.push({ start, end, label: `pages_${start}_to_${end}` });
  }

  return splitPdfByRanges(file, ranges);
}

/**
 * Splits PDF into individual single-page PDFs
 */
export async function splitPdfIndividualPages(
  file: File
): Promise<{ name: string; blob: Blob }[]> {
  return splitPdfEveryN(file, 1);
}

/**
 * Bundles multiple Blobs into one ZIP file
 */
export async function zipBlobs(
  items: { name: string; blob: Blob }[],
  zipFilename = "split-files.zip"
): Promise<Blob> {
  const zip = new JSZip();

  for (const item of items) {
    zip.file(item.name, item.blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}

/**
 * Triggers a browser file download for a given Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to format bytes to readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ─── PDF ORGANIZER ───────────────────────────────────────────────────────────

export interface OrganizerPageState {
  originalIndex: number; // 0-based index into source doc
  rotation: 0 | 90 | 180 | 270; // delta to apply on top of original rotation
  deleted: boolean;
}

export async function applyPdfOrganizerChanges(
  file: File,
  pageStates: OrganizerPageState[]
): Promise<Blob> {
  const srcDoc = await loadPdfFile(file);
  const newDoc = await PDFDocument.create();
  const keep = pageStates.filter((p) => !p.deleted);

  if (keep.length === 0) {
    throw new Error("Keep at least one page.");
  }

  const indices = keep.map((p) => p.originalIndex);
  const copiedPages = await newDoc.copyPages(srcDoc, indices);

  copiedPages.forEach((page, i) => {
    if (keep[i].rotation !== 0) {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + keep[i].rotation) % 360));
    }
    newDoc.addPage(page);
  });

  const bytes = await newDoc.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

// ─── PDF WATERMARK ───────────────────────────────────────────────────────────

export interface TextWatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number; // 0–1
  rotationDeg: number;
  colorHex: string;
  tiled: boolean;
}

function hexToRgbFraction(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 0.5, g: 0.5, b: 0.5 };
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

export async function addTextWatermark(
  file: File,
  options: TextWatermarkOptions
): Promise<Blob> {
  const doc = await loadPdfFile(file);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const { r, g, b } = hexToRgbFraction(options.colorHex);

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    if (!options.tiled) {
      const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
      page.drawText(options.text, {
        x: width / 2 - textWidth / 2,
        y: height / 2,
        size: options.fontSize,
        font,
        color: rgb(r, g, b),
        opacity: options.opacity,
        rotate: degrees(options.rotationDeg),
      });
    } else {
      const stepX = font.widthOfTextAtSize(options.text, options.fontSize) + 80;
      const stepY = options.fontSize + 80;
      for (let y = 0; y < height + stepY; y += stepY) {
        for (let x = 0; x < width + stepX; x += stepX) {
          page.drawText(options.text, {
            x,
            y,
            size: options.fontSize,
            font,
            color: rgb(r, g, b),
            opacity: options.opacity,
            rotate: degrees(options.rotationDeg),
          });
        }
      }
    }
  }

  const bytes = await doc.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

function resolvePosition(
  position: string,
  pageSize: { width: number; height: number },
  imgSize: { width: number; height: number }
): { x: number; y: number } {
  const padding = 20;
  let x = (pageSize.width - imgSize.width) / 2;
  let y = (pageSize.height - imgSize.height) / 2;

  switch (position) {
    case "top-left":
      x = padding;
      y = pageSize.height - imgSize.height - padding;
      break;
    case "top-center":
      x = (pageSize.width - imgSize.width) / 2;
      y = pageSize.height - imgSize.height - padding;
      break;
    case "top-right":
      x = pageSize.width - imgSize.width - padding;
      y = pageSize.height - imgSize.height - padding;
      break;
    case "center-left":
      x = padding;
      y = (pageSize.height - imgSize.height) / 2;
      break;
    case "center":
      x = (pageSize.width - imgSize.width) / 2;
      y = (pageSize.height - imgSize.height) / 2;
      break;
    case "center-right":
      x = pageSize.width - imgSize.width - padding;
      y = (pageSize.height - imgSize.height) / 2;
      break;
    case "bottom-left":
      x = padding;
      y = padding;
      break;
    case "bottom-center":
      x = (pageSize.width - imgSize.width) / 2;
      y = padding;
      break;
    case "bottom-right":
      x = pageSize.width - imgSize.width - padding;
      y = padding;
      break;
  }

  return { x, y };
}

export async function addImageWatermark(
  file: File,
  imageFile: File,
  options: { scale: number; opacity: number; position: string }
): Promise<Blob> {
  const doc = await loadPdfFile(file);
  const imgBytes = await imageFile.arrayBuffer();
  const isPng =
    imageFile.type === "image/png" || imageFile.name.toLowerCase().endsWith(".png");
  const img = isPng ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);
  const dims = img.scale(options.scale);

  for (const page of doc.getPages()) {
    const { x, y } = resolvePosition(options.position, page.getSize(), dims);
    page.drawImage(img, {
      x,
      y,
      width: dims.width,
      height: dims.height,
      opacity: options.opacity,
    });
  }

  const bytes = await doc.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

// ─── JPG ↔ PDF CONVERTER ──────────────────────────────────────────────────────

/**
 * Safely decodes and embeds an image file (JPEG, PNG, WebP, SVG, GIF, AVIF, HEIC, etc.) into a pdf-lib PDFDocument
 */
async function embedImageInPdfDoc(doc: PDFDocument, imgFile: File) {
  const isPng = imgFile.type === "image/png" || imgFile.name.toLowerCase().endsWith(".png");
  const isJpg = imgFile.type === "image/jpeg" || imgFile.type === "image/jpg" || /\.(jpe?g)$/i.test(imgFile.name);

  if (isPng) {
    try {
      const bytes = await imgFile.arrayBuffer();
      return await doc.embedPng(bytes);
    } catch {
      // Direct embedding failed, will convert with canvas below
    }
  } else if (isJpg) {
    try {
      const bytes = await imgFile.arrayBuffer();
      return await doc.embedJpg(bytes);
    } catch {
      // Direct embedding failed (e.g. CMYK or progressive JPEG), will convert with canvas below
    }
  }

  // Convert image to JPEG using Canvas for maximum format compatibility (WebP, SVG, GIF, AVIF, HEIC, etc.)
  return new Promise<any>((resolve, reject) => {
    const url = URL.createObjectURL(imgFile);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        if (!width || !height) {
          URL.revokeObjectURL(url);
          throw new Error(`Invalid image dimensions for "${imgFile.name}"`);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          throw new Error("Unable to create canvas context");
        }

        // Fill white background for transparent images
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error(`Failed to process image "${imgFile.name}"`));
              return;
            }
            try {
              const buffer = await blob.arrayBuffer();
              const embedded = await doc.embedJpg(buffer);
              resolve(embedded);
            } catch (err) {
              reject(err);
            }
          },
          "image/jpeg",
          0.92
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not decode image file "${imgFile.name}". Please ensure it is a valid image.`));
    };
    img.src = url;
  });
}

export type PdfPageOrientation = "fit" | "a4" | "a4-portrait" | "a4-landscape" | "a4-auto";
export type PdfMargin = "none" | "small" | "normal";

export async function imagesToPdf(
  images: File[],
  mode: PdfPageOrientation = "fit",
  margin: PdfMargin = "none",
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  if (images.length === 0) {
    throw new Error("At least one image is required.");
  }

  const doc = await PDFDocument.create();

  for (let i = 0; i < images.length; i++) {
    const imgFile = images[i];
    if (onProgress) {
      onProgress(i + 1, images.length);
    }

    const img = await embedImageInPdfDoc(doc, imgFile);

    if (mode === "fit") {
      const page = doc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    } else {
      // Standard A4 dimensions in points: 595.28 x 841.89
      const standardA4Width = 595.28;
      const standardA4Height = 841.89;

      let a4Width = standardA4Width;
      let a4Height = standardA4Height;

      if (mode === "a4-landscape") {
        a4Width = standardA4Height;
        a4Height = standardA4Width;
      } else if (mode === "a4-auto") {
        if (img.width > img.height) {
          a4Width = standardA4Height;
          a4Height = standardA4Width;
        } else {
          a4Width = standardA4Width;
          a4Height = standardA4Height;
        }
      }

      // Margins in points
      let marginPoints = 0;
      if (margin === "small") marginPoints = 20;
      else if (margin === "normal") marginPoints = 36;
      else if (mode === "a4") marginPoints = 20;

      const availWidth = Math.max(10, a4Width - marginPoints * 2);
      const availHeight = Math.max(10, a4Height - marginPoints * 2);

      const page = doc.addPage([a4Width, a4Height]);
      const scale = Math.min(availWidth / img.width, availHeight / img.height);
      const w = img.width * scale;
      const h = img.height * scale;

      page.drawImage(img, {
        x: (a4Width - w) / 2,
        y: (a4Height - h) / 2,
        width: w,
        height: h,
      });
    }
  }

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export async function pdfPagesToJpgs(
  file: File,
  quality: number,
  onProgress?: (current: number, total: number) => void
): Promise<{ name: string; blob: Blob }[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const results: { name: string; blob: Blob }[] = [];
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(i, numPages);
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");

    if (ctx) {
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
      });

      if (blob) {
        results.push({
          name: numPages === 1 ? `${baseName}.jpg` : `${baseName}_page_${i}.jpg`,
          blob,
        });
      }
    }
  }

  return results;
}

// ─── PDF COMPRESSOR ──────────────────────────────────────────────────────────

export type CompressionLevel = "low" | "medium" | "high";

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  reduced: boolean;
}

export async function compressPdf(
  file: File,
  level: CompressionLevel,
  onProgress?: (current: number, total: number) => void
): Promise<CompressionResult> {
  const originalSize = file.size;

  // Scale and quality maps per level
  const settings = {
    low: { scale: 1.5, quality: 0.75 },
    medium: { scale: 1.2, quality: 0.6 },
    high: { scale: 1.0, quality: 0.45 },
  }[level];

  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const srcPdfDoc = await loadingTask.promise;
  const numPages = srcPdfDoc.numPages;

  const newDoc = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(i, numPages);

    const page = await srcPdfDoc.getPage(i);
    const origViewport = page.getViewport({ scale: 1.0 });
    const renderViewport = page.getViewport({ scale: settings.scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(renderViewport.width);
    canvas.height = Math.ceil(renderViewport.height);
    const ctx = canvas.getContext("2d");

    if (ctx) {
      await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
      const jpgArrayBuffer = await new Promise<ArrayBuffer | null>((resolve) => {
        canvas.toBlob(
          async (b) => {
            if (!b) return resolve(null);
            const ab = await b.arrayBuffer();
            resolve(ab);
          },
          "image/jpeg",
          settings.quality
        );
      });

      if (jpgArrayBuffer) {
        const embeddedImg = await newDoc.embedJpg(jpgArrayBuffer);
        const newPage = newDoc.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height,
        });
      }
    }
  }

  const compressedBytes = await newDoc.save();
  const compressedBlob = new Blob([compressedBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });

  if (compressedBlob.size < originalSize) {
    return {
      blob: compressedBlob,
      originalSize,
      compressedSize: compressedBlob.size,
      reduced: true,
    };
  } else {
    // If output is not smaller, return original file unchanged
    const originalBlob = new Blob([arrayBuffer], { type: "application/pdf" });
    return {
      blob: originalBlob,
      originalSize,
      compressedSize: originalSize,
      reduced: false,
    };
  }
}

