"use client";

import { useState, useEffect } from "react";
import { FileText, Download, AlertTriangle, FileCode, CheckCircle2, Loader2, Info, FileCheck, ScanText } from "lucide-react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
  TableLayoutType,
  SectionType,
} from "docx";

type ConversionMode = "visual" | "editable";
type ExtractedImage = { data: Uint8Array; width: number; height: number };

export default function PdfToWordTool() {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [status, setStatus] = useState<"idle" | "converting" | "done" | "error">("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [outputFileName, setOutputFileName] = useState("");
  const [conversionMode] = useState<ConversionMode>("editable");
  const [ocrLanguage, setOcrLanguage] = useState<"eng" | "nep" | "eng+nep">("eng");
  const [isOcrUsed, setIsOcrUsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!mounted) {
    return (
      <div className="p-8 text-center text-sm text-[#71717A] dark:text-[#A1A1AA] animate-pulse">
        Loading PDF to Word Converter...
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
        setErrorMsg("Please select a valid PDF file.");
        return;
      }
      setFile(selected);
      setStatus("idle");
      setErrorMsg("");
      setWarningMsg("");
      setDocxBlob(null);
      setIsOcrUsed(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
        setErrorMsg("Please select a valid PDF file.");
        return;
      }
      setFile(selected);
      setStatus("idle");
      setErrorMsg("");
      setWarningMsg("");
      setDocxBlob(null);
      setIsOcrUsed(false);
    }
  };

  const convertPdfToWord = async () => {
    if (!file) return;

    setStatus("converting");
    setProgressMsg("Loading PDF engine...");
    setErrorMsg("");
    setWarningMsg("");

    try {
      if (conversionMode === "visual") {
        await convertPdfAsVisualDocx(file);
        return;
      }

      // Dynamically load pdfjs-dist on client side
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      // 1 inch = 1440 twips (DXA). Usable A4 content width with 1" margins = 9026 DXA (~6.27 inches)
      const PAGE_CONTENT_WIDTH_DXA = 9026;

      // KV field table (no photo) — full width
      const KV_LABEL_WIDTH_DXA = Math.round(PAGE_CONTENT_WIDTH_DXA * 0.38);
      const KV_VALUE_WIDTH_DXA = PAGE_CONTENT_WIDTH_DXA - KV_LABEL_WIDTH_DXA;

      // Photo + form split
      const FORM_COL_WIDTH_DXA = Math.round(PAGE_CONTENT_WIDTH_DXA * 0.62);
      const PHOTO_COL_WIDTH_DXA = PAGE_CONTENT_WIDTH_DXA - FORM_COL_WIDTH_DXA;

      // KV label/value widths inside form column
      const FORM_KV_LABEL_WIDTH_DXA = Math.round(FORM_COL_WIDTH_DXA * 0.40);
      const FORM_KV_VALUE_WIDTH_DXA = FORM_COL_WIDTH_DXA - FORM_KV_LABEL_WIDTH_DXA;

      const calculateTableColumnWidths = (count: number, totalDxa: number): number[] => {
        if (count <= 0) return [totalDxa];
        const base = Math.floor(totalDxa / count);
        const widths = new Array(count).fill(base);
        widths[0] += totalDxa - base * count;
        return widths;
      };

      const numPages = pdfDoc.numPages;
      const docxChildren: (Paragraph | Table)[] = [];
      let totalExtractedLength = 0;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setProgressMsg(`Extracting text & photos from page ${pageNum} of ${numPages}...`);

        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();

        // ── 1. Extract Photos & Logos via Page Canvas Region Crop ──
        let embeddedLogo: ExtractedImage | null = null;
        let embeddedPhoto: ExtractedImage | null = null;

        // Render page to canvas to crop exact visual logo (top-left) and candidate photo (top-right)
        let pageCanvas: HTMLCanvasElement | null = null;
        try {
          const viewport = page.getViewport({ scale: 2.0 });
          pageCanvas = document.createElement("canvas");
          pageCanvas.width = viewport.width;
          pageCanvas.height = viewport.height;
          const pageCtx = pageCanvas.getContext("2d");
          if (pageCtx) {
            await page.render({ canvasContext: pageCtx, viewport }).promise;
          }
        } catch (canvasErr) {
          console.warn("Page canvas render error:", canvasErr);
        }

        // Helper to trim surrounding white space from cropped canvas
        const trimWhiteBorder = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return canvas;
          const w = canvas.width;
          const h = canvas.height;
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          let minX = w, minY = h, maxX = 0, maxY = 0;
          let found = false;

          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const idx = (y * w + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];

              // Pixel is content if not white/transparent
              if (a > 30 && (r < 240 || g < 240 || b < 240)) {
                found = true;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          if (!found || maxX - minX < 20 || maxY - minY < 20) return canvas;

          minX = Math.max(0, minX - 2);
          minY = Math.max(0, minY - 2);
          maxX = Math.min(w - 1, maxX + 2);
          maxY = Math.min(h - 1, maxY + 2);

          const croppedW = maxX - minX + 1;
          const croppedH = maxY - minY + 1;

          const trimmed = document.createElement("canvas");
          trimmed.width = croppedW;
          trimmed.height = croppedH;
          const trimmedCtx = trimmed.getContext("2d");
          if (trimmedCtx) {
            trimmedCtx.drawImage(canvas, minX, minY, croppedW, croppedH, 0, 0, croppedW, croppedH);
          }
          return trimmed;
        };

        if (pageCanvas) {
          // Crop Candidate Photo from top-right quadrant (X >= 58%) to avoid left text overlap
          try {
            const cropCanvas = document.createElement("canvas");
            const cropX = Math.floor(pageCanvas.width * 0.58);
            const cropY = Math.floor(pageCanvas.height * 0.15);
            const cropW = Math.floor(pageCanvas.width * 0.38);
            const cropH = Math.floor(pageCanvas.height * 0.28);

            cropCanvas.width = cropW;
            cropCanvas.height = cropH;
            const cropCtx = cropCanvas.getContext("2d");
            if (cropCtx) {
              cropCtx.drawImage(pageCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
              const trimmedCanvas = trimWhiteBorder(cropCanvas);
              const dataUrl = trimmedCanvas.toDataURL("image/png");
              const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
              const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
              if (bytes.length > 500) {
                embeddedPhoto = { data: bytes, width: trimmedCanvas.width, height: trimmedCanvas.height };
              }
            }
          } catch (cropErr) {
            console.warn("Photo crop error:", cropErr);
          }

          // Crop Emblem Logo from top-left quadrant
          try {
            const logoCanvas = document.createElement("canvas");
            const logoX = Math.floor(pageCanvas.width * 0.04);
            const logoY = Math.floor(pageCanvas.height * 0.02);
            const logoW = Math.floor(pageCanvas.width * 0.14);
            const logoH = Math.floor(pageCanvas.height * 0.11);

            logoCanvas.width = logoW;
            logoCanvas.height = logoH;
            const logoCtx = logoCanvas.getContext("2d");
            if (logoCtx) {
              logoCtx.drawImage(pageCanvas, logoX, logoY, logoW, logoH, 0, 0, logoW, logoH);
              const trimmedLogo = trimWhiteBorder(logoCanvas);
              if (trimmedLogo.width > 30 && trimmedLogo.height > 30) {
                const dataUrl = trimmedLogo.toDataURL("image/png");
                const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
                const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
                if (bytes.length > 500) {
                  embeddedLogo = { data: bytes, width: trimmedLogo.width, height: trimmedLogo.height };
                }
              }
            }
          } catch (logoErr) {
            console.warn("Logo crop error:", logoErr);
          }
        }

        const rawItems = textContent.items as any[];
        if (!rawItems || rawItems.length === 0) continue;

        // 2. Filter valid text items with positioning coordinates
        const validItems = rawItems.filter(
          (item) => item && typeof item.str === "string" && item.str.trim().length > 0 && Array.isArray(item.transform)
        );

        if (validItems.length === 0) continue;

        // Calculate average font height in PDF points
        const fontHeights = validItems.map((item) => Math.abs(item.transform[3] || item.height || 11));
        const avgFontHeight = fontHeights.reduce((a, b) => a + b, 0) / fontHeights.length || 11;

        // 3. Sort all items on page by Y coordinate descending (top to bottom)
        validItems.sort((a, b) => Math.round(b.transform[5]) - Math.round(a.transform[5]));

        // 4. Cluster items into horizontal lines (Y-tolerance of ~6px)
        const lines: { y: number; items: any[] }[] = [];
        let currentLineItems: any[] = [];
        let currentLineY: number | null = null;

        for (const item of validItems) {
          const itemY = Math.round(item.transform[5]);

          if (currentLineY === null || Math.abs(itemY - currentLineY) > 6) {
            if (currentLineItems.length > 0) {
              lines.push({ y: currentLineY!, items: currentLineItems });
            }
            currentLineItems = [item];
            currentLineY = itemY;
          } else {
            currentLineItems.push(item);
          }
        }

        if (currentLineItems.length > 0) {
          lines.push({ y: currentLineY!, items: currentLineItems });
        }

        // Add embedded logo at top if present
        if (embeddedLogo) {
          const logoScale = Math.min(140 / embeddedLogo.width, 100 / embeddedLogo.height, 1);
          const logoWidth = Math.max(1, Math.round(embeddedLogo.width * logoScale));
          const logoHeight = Math.max(1, Math.round(embeddedLogo.height * logoScale));
          docxChildren.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { after: 120 },
              children: [
                new ImageRun({
                  data: embeddedLogo.data,
                  type: "png",
                  transformation: { width: logoWidth, height: logoHeight },
                }),
              ],
            })
          );
          embeddedLogo = null;
        }

        // Table buffer to group consecutive multi-column table rows together
        let tableRowsBuffer: TableRow[] = [];
        let currentTableColCount = 0;

        const flushTableBuffer = () => {
          if (tableRowsBuffer.length === 0) return;
          const colWidths = calculateTableColumnWidths(currentTableColCount, PAGE_CONTENT_WIDTH_DXA);
          docxChildren.push(
            new Table({
              width: { size: PAGE_CONTENT_WIDTH_DXA, type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              columnWidths: colWidths,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: "0F766E" },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "0F766E" },
                left: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
                right: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
                insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
              },
              rows: tableRowsBuffer,
            })
          );
          tableRowsBuffer = [];
          currentTableColCount = 0;
        };

        // Process horizontal text lines into structured Word elements
        for (const line of lines) {
          // Sort items in line by X coordinate ascending (left to right)
          line.items.sort((a, b) => Math.round(a.transform[4]) - Math.round(b.transform[4]));

          // Check if line represents a tabular structure (multiple columns with large horizontal gaps > 60px)
          const itemsWithGaps: { text: string; x: number; fontHeight: number }[] = [];
          let currentChunkText = "";
          let currentChunkX = line.items[0].transform[4];
          let currentChunkFontHeight = Math.abs(line.items[0].transform[3] || 11);
          let lastItemXEnd = currentChunkX + (line.items[0].width || line.items[0].str.length * 6);

          for (let i = 0; i < line.items.length; i++) {
            const item = line.items[i];
            const itemX = Math.round(item.transform[4]);
            const itemText = item.str;
            const itemFontH = Math.abs(item.transform[3] || item.height || 11);

            // Wide horizontal gap > 60px signifies distinct table columns
            if (i > 0 && itemX - lastItemXEnd > 60) {
              itemsWithGaps.push({ text: currentChunkText.trim(), x: currentChunkX, fontHeight: currentChunkFontHeight });
              currentChunkText = itemText;
              currentChunkX = itemX;
              currentChunkFontHeight = itemFontH;
            } else {
              currentChunkText += (currentChunkText && !currentChunkText.endsWith(" ") && !itemText.startsWith(" ") ? " " : "") + itemText;
            }
            lastItemXEnd = itemX + (item.width || itemText.length * 6);
          }
          if (currentChunkText.trim()) {
            itemsWithGaps.push({ text: currentChunkText.trim(), x: currentChunkX, fontHeight: currentChunkFontHeight });
          }

          const fullLineText = itemsWithGaps.map((g) => g.text).join(" ").trim();
          if (!fullLineText) continue;

          totalExtractedLength += fullLineText.length;

          // ── A. Multi-column Table Grid Handling ──
          if (itemsWithGaps.length >= 2) {
            const numCols = itemsWithGaps.length;
            if (currentTableColCount > 0 && currentTableColCount !== numCols) {
              flushTableBuffer();
            }
            currentTableColCount = numCols;

            const isHeader = tableRowsBuffer.length === 0 && itemsWithGaps.some((g) =>
              ["qualification", "institution", "result", "year", "s.n", "name", "nationality", "languages", "date of birth"].includes(g.text.toLowerCase())
            );

            const colWidths = calculateTableColumnWidths(numCols, PAGE_CONTENT_WIDTH_DXA);
            const rowCells = itemsWithGaps.map(
              (gap, idx) =>
                new TableCell({
                  width: { size: colWidths[idx] || colWidths[0], type: WidthType.DXA },
                  shading: isHeader ? { fill: "0F766E" } : undefined,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.LEFT,
                      spacing: { before: 40, after: 40 },
                      children: [
                        new TextRun({
                          text: gap.text,
                          font: "Calibri",
                          bold: isHeader || gap.fontHeight > avgFontHeight * 1.1,
                          // docx size in half-points: PDF pt * 2 = docx half-points
                          size: Math.max(22, Math.min(48, Math.round(gap.fontHeight * 2))),
                          color: isHeader ? "FFFFFF" : "18181B",
                        }),
                      ],
                    }),
                  ],
                })
            );

            tableRowsBuffer.push(new TableRow({ children: rowCells }));
            continue;
          } else {
            flushTableBuffer();
          }

          // ── B. Heading / Title vs Paragraph Line Detection ──
          const maxLineFontHeight = Math.max(...line.items.map((i: any) => Math.abs(i.transform[3] || 11)));
          
          // docx size is half-points: PDF pt * 2 = docx half-points (e.g. 11pt = size 22)
          const docxHalfPoints = Math.max(22, Math.min(52, Math.round(maxLineFontHeight * 2)));

          const isTitle = maxLineFontHeight > avgFontHeight * 1.5;
          const isSectionHeader = fullLineText.length < 50 && fullLineText === fullLineText.toUpperCase() && /[A-Z]{3,}/.test(fullLineText);
          const isSubHeader = maxLineFontHeight > avgFontHeight * 1.15;

          const isCenter = isTitle || (fullLineText.includes("|") && fullLineText.length < 80);
          
          let textColor = "18181B"; // default black
          if (isTitle) {
            textColor = "1F2544"; // Navy
          } else if (isSectionHeader) {
            textColor = "0F766E"; // Emerald / Green for section headers
          }

          docxChildren.push(
            new Paragraph({
              alignment: isCenter ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: {
                before: isSectionHeader ? 160 : isTitle ? 120 : 40,
                after: isTitle ? 80 : isSectionHeader ? 80 : 40,
              },
              children: [
                new TextRun({
                  text: fullLineText,
                  font: "Calibri",
                  bold: isTitle || isSectionHeader || isSubHeader,
                  size: isSectionHeader ? Math.max(24, docxHalfPoints) : docxHalfPoints,
                  color: textColor,
                }),
              ],
            })
          );
        }

        flushTableBuffer();

        // Add embedded photo if present on page
        if (embeddedPhoto) {
          const photoScale = Math.min(180 / embeddedPhoto.width, 180 / embeddedPhoto.height, 1);
          const photoWidth = Math.max(1, Math.round(embeddedPhoto.width * photoScale));
          const photoHeight = Math.max(1, Math.round(embeddedPhoto.height * photoScale));
          docxChildren.push(
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 120 },
              children: [
                new ImageRun({
                  data: embeddedPhoto.data,
                  type: "png",
                  transformation: { width: photoWidth, height: photoHeight },
                }),
              ],
            })
          );
          embeddedPhoto = null;
        }
      }

      // Check if PDF had no extractable text (Scanned image PDF) -> Fallback to client-side OCR
      if (totalExtractedLength === 0 || docxChildren.length === 0) {
        const langName = ocrLanguage === "nep" ? "Nepali" : ocrLanguage === "eng+nep" ? "English + Nepali" : "English";
        setProgressMsg(`No selectable text layer found — running client-side OCR for scanned pages (${langName})...`);

        try {
          const { createWorker } = await import("tesseract.js");
          const worker = await createWorker(ocrLanguage);

          const ocrChildren: (Paragraph | Table)[] = [];
          let totalOcrLength = 0;

          // Add OCR Disclaimer callout box at top of Word Document
          ocrChildren.push(
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: "[OCR Extracted Document — Formatted from Scanned PDF]",
                  bold: true,
                  color: "D97706",
                  size: 20,
                }),
              ],
            })
          );

          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            setProgressMsg(`OCR scanning page ${pageNum} of ${numPages} (${langName})... Please wait...`);

            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            const ctx = canvas.getContext("2d");

            if (ctx) {
              await page.render({ canvasContext: ctx, viewport }).promise;
              const dataUrl = canvas.toDataURL("image/png");

              const ret = await worker.recognize(dataUrl);
              const pageText = ret.data.text || "";
              const trimmedText = pageText.trim();

              if (trimmedText.length > 0) {
                totalOcrLength += trimmedText.length;

                if (numPages > 1) {
                  ocrChildren.push(
                    new Paragraph({
                      spacing: { before: 160, after: 80 },
                      children: [
                        new TextRun({
                          text: `--- Page ${pageNum} ---`,
                          bold: true,
                          color: "71717A",
                          size: 18,
                        }),
                      ],
                    })
                  );
                }

                const paragraphs = trimmedText.split(/\n\s*\n|\n/);
                for (const pText of paragraphs) {
                  const cleanP = pText.trim();
                  if (cleanP) {
                    ocrChildren.push(
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: cleanP,
                            color: "18181B",
                            size: 20,
                          }),
                        ],
                      })
                    );
                  }
                }
              }
            }
          }

          await worker.terminate();

          if (totalOcrLength === 0) {
            setStatus("error");
            setErrorMsg("OCR completed but could not extract readable text. The image scan quality might be too low or blurry.");
            return;
          }

          setIsOcrUsed(true);
          setWarningMsg(
            "Scanned PDF detected: Text was extracted using client-side OCR (Optical Character Recognition). Layout is simplified into editable text paragraphs."
          );

          setProgressMsg("Packaging OCR extracted text into Word document...");
          const doc = new Document({
            sections: [{ properties: {}, children: ocrChildren }],
          });

          const blob = await Packer.toBlob(doc);
          setDocxBlob(blob);

          const baseName = file.name.replace(/\.pdf$/i, "");
          setOutputFileName(`${baseName}-ocr.docx`);
          setStatus("done");
          return;
        } catch (ocrErr: any) {
          console.error("OCR Fallback Error:", ocrErr);
          setStatus("error");
          setErrorMsg("Failed to run OCR on scanned PDF: " + (ocrErr?.message || "Unknown error"));
          return;
        }
      }

      setProgressMsg("Generating Microsoft Word (.docx) document with tables, styles & photo layout...");

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1080,
                  right: 1080,
                  bottom: 1080,
                  left: 1080,
                },
              },
            },
            children: docxChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      setDocxBlob(blob);

      const baseName = file.name.replace(/\.pdf$/i, "");
      setOutputFileName(`${baseName}.docx`);

      setStatus("done");
    } catch (err: any) {
      console.error("PDF to Word error:", err);
      setStatus("error");
      setErrorMsg(err?.message || "Failed to convert PDF. Please try another PDF file.");
    }
  };

  const convertPdfAsVisualDocx = async (sourceFile: File) => {
    // A PDF page is a finished design, whereas a DOCX is a reflowable document.
    // Rendering each page keeps photos, fonts, tables, stamps, and spacing exactly
    // where they appear in the original PDF.
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    const pdfDoc = await pdfjsLib.getDocument({ data: await sourceFile.arrayBuffer() }).promise;
    const sections: any[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
      setProgressMsg(`Rendering page ${pageNumber} of ${pdfDoc.numPages} exactly as it appears in the PDF...`);
      const page = await pdfDoc.getPage(pageNumber);
      const displayViewport = page.getViewport({ scale: 1 });
      const renderViewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(renderViewport.width);
      canvas.height = Math.ceil(renderViewport.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not create the PDF page preview.");
      await page.render({ canvasContext: context, viewport: renderViewport }).promise;

      const imageData = await new Promise<Uint8Array>((resolve, reject) => {
        canvas.toBlob(async (imageBlob) => {
          if (!imageBlob) return reject(new Error("Unable to render this PDF page."));
          resolve(new Uint8Array(await imageBlob.arrayBuffer()));
        }, "image/png");
      });

      // PDF units are points; Word page units are twips (20 per point).
      const pageWidthTwips = Math.round(displayViewport.width * 20);
      const pageHeightTwips = Math.round(displayViewport.height * 20);
      // docx image dimensions use CSS pixels (96 dpi), while PDF points are 72 dpi.
      const imageWidth = Math.round(displayViewport.width * (96 / 72));
      const imageHeight = Math.round(displayViewport.height * (96 / 72));

      sections.push({
        properties: {
          type: pageNumber === 1 ? undefined : SectionType.NEXT_PAGE,
          page: {
            size: { width: pageWidthTwips, height: pageHeightTwips },
            margin: { top: 0, right: 0, bottom: 0, left: 0, header: 0, footer: 0, gutter: 0 },
          },
        },
        children: [
          new Paragraph({
            spacing: { before: 0, after: 0, line: 1 },
            children: [new ImageRun({ data: imageData, type: "png", transformation: { width: imageWidth, height: imageHeight } })],
          }),
        ],
      });
    }

    setProgressMsg("Packaging the identical page layout into Word...");
    setDocxBlob(await Packer.toBlob(new Document({ sections })));
    setOutputFileName(`${sourceFile.name.replace(/\.pdf$/i, "")}-exact-copy.docx`);
    setStatus("done");
  };

  const handleDownload = () => {
    if (!docxBlob) return;
    const url = URL.createObjectURL(docxBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputFileName || "converted.docx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Scope Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
        <Info size={18} className="shrink-0 text-amber-500 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5 flex items-center gap-1.5">
            <FileCheck size={14} className="text-amber-500" /> High-Fidelity Client-Side Conversion
          </p>
          <p className="opacity-90 leading-relaxed">
            Creates an <strong>editable Word document</strong> from the PDF text and tables, while retaining detected photos and logos. Very complex PDF artwork can shift slightly because Word reflows content differently from PDF.
          </p>
        </div>
      </div>

      {/* Main Upload Card */}
      <div className="p-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-500 flex items-center justify-center mx-auto">
            <FileText size={24} />
          </div>
          <h2 className="text-xl font-bold font-sora">PDF to Word (.docx)</h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Convert PDF text, tables, and detected photos into an editable Word document
          </p>
        </div>

        {/* Dropzone */}
        <label
          htmlFor="pdf-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group relative cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 transition-all duration-200 block ${
            isDragOver
              ? "border-[#F5A623] bg-[#F5A623]/10 dark:bg-[#F5A623]/15 scale-[1.01]"
              : "border-[#E4E0D8] dark:border-[#2A2F4A] bg-[#FAFAF8] dark:bg-[#1A1F35] hover:border-red-400 dark:hover:border-red-500 hover:bg-[#F0EDE8] dark:hover:bg-[#1E2338]"
          }`}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            id="pdf-upload"
            className="hidden"
          />
          <div className="p-4 rounded-full bg-white dark:bg-[#141829] text-[#71717A] dark:text-[#A1A1AA] group-hover:scale-110 transition-transform shadow-sm">
            <FileCode size={28} className="text-red-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">
              {file ? file.name : "Click or drag & drop to select a PDF file"}
            </p>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supports PDF files up to 50MB"}
            </p>
          </div>
        </label>

        {/* OCR Language Selector (for scanned PDFs) */}
        {file && status !== "done" && (
          <div className="p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F4A] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
                <ScanText size={14} className="text-[#F5A623]" />
                OCR Language (for Scanned PDFs)
              </label>
              <span className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">100% in-browser privacy</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "eng", label: "English" },
                { id: "nep", label: "Nepali 🇳🇵" },
                { id: "eng+nep", label: "English + Nepali" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setOcrLanguage(lang.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    ocrLanguage === lang.id
                      ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                      : "bg-white dark:bg-[#141829] text-[#71717A] dark:text-[#A1A1AA] border border-[#E4E0D8] dark:border-[#2A2F4A] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42]"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Convert Button */}
        {file && status !== "done" && (
          <button
            onClick={convertPdfToWord}
            disabled={status === "converting"}
            className="w-full py-3.5 bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] font-semibold rounded-xl text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {status === "converting" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {progressMsg}
              </>
            ) : (
              <>
                <FileText size={16} /> Convert to Editable Word
              </>
            )}
          </button>
        )}

        {/* Scanned Image PDF Warning */}
        {warningMsg && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0 text-amber-500" />
            <span>{warningMsg}</span>
          </div>
        )}

        {/* Generic Error */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Done Card & Download Button */}
        {status === "done" && docxBlob && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 size={18} className="text-emerald-500" />
              {isOcrUsed ? "OCR Text Extraction Complete!" : "High-Fidelity Conversion Complete!"}
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              <strong>{outputFileName}</strong> is ready.{" "}
              {isOcrUsed
                ? "Text was extracted using Optical Character Recognition (OCR) from your scanned PDF. Please review the text accuracy before use."
                : "Its text and tables are editable, and detected photos/logos have been retained. Review complex layouts before sharing."}
            </p>
            {isOcrUsed && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 text-left">
                <strong>💡 Note on Scanned PDFs:</strong> OCR extracts editable text from images. Formatting, tables, and handwritten elements are simplified into standard paragraphs.
              </div>
            )}
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors inline-flex items-center gap-2"
            >
              <Download size={16} /> Download Word File (.docx)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
