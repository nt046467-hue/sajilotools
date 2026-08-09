"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Lock,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RotateCw,
  Trash2,
  Undo2,
  GripVertical,
  X,
  LayoutGrid,
} from "lucide-react";
import PdfDropzone from "./shared/PdfDropzone";
import {
  loadPdfFile,
  applyPdfOrganizerChanges,
  downloadBlob,
  formatBytes,
  EncryptedPdfError,
  InvalidPdfError,
  OrganizerPageState,
} from "@/lib/pdf-utils";

interface ExtendedPageState extends OrganizerPageState {
  id: string; // unique id for list keys
  thumbnailUrl: string | null;
}

export default function PdfOrganizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageStates, setPageStates] = useState<ExtendedPageState[]>([]);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Drag and drop tracking
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setFile(selectedFile);
    setLoadingFile(true);
    setFileError(null);
    setProcessError(null);
    setSuccessMessage(null);
    setPageStates([]);

    try {
      const doc = await loadPdfFile(selectedFile);
      const pageCount = doc.getPageCount();

      // Initialize page states
      const initialStates: ExtendedPageState[] = Array.from(
        { length: pageCount },
        (_, i) => ({
          id: `page-${i + 1}-${Date.now()}`,
          originalIndex: i,
          rotation: 0,
          deleted: false,
          thumbnailUrl: null,
        })
      );
      setPageStates(initialStates);

      // Render thumbnails asynchronously using pdfjs-dist
      renderThumbnails(selectedFile, initialStates);
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

  const renderThumbnails = async (pdfFile: File, initialStates: ExtendedPageState[]) => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      for (let i = 0; i < initialStates.length; i++) {
        try {
          const page = await pdfDoc.getPage(i + 1);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext("2d");

          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const url = canvas.toDataURL("image/png");
            setPageStates((prev) =>
              prev.map((item) =>
                item.originalIndex === i ? { ...item, thumbnailUrl: url } : item
              )
            );
          }
        } catch (e) {
          console.warn(`Failed rendering thumbnail for page ${i + 1}`, e);
        }
      }
    } catch (e) {
      console.warn("Failed initializing thumbnail renderer", e);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPageStates([]);
    setFileError(null);
    setProcessError(null);
    setSuccessMessage(null);
  };

  const handleRotate = (index: number) => {
    setPageStates((prev) =>
      prev.map((p, idx) => {
        if (idx !== index) return p;
        const nextRot = ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...p, rotation: nextRot };
      })
    );
  };

  const handleToggleDelete = (index: number) => {
    setPageStates((prev) =>
      prev.map((p, idx) => {
        if (idx !== index) return p;
        return { ...p, deleted: !p.deleted };
      })
    );
  };

  // Drag and drop handlers
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

    const updated = [...pageStates];
    const draggedContent = updated[dragItem.current];
    updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, draggedContent);

    dragItem.current = null;
    dragOverItem.current = null;

    setPageStates(updated);
  };

  const keptCount = pageStates.filter((p) => !p.deleted).length;
  const deletedCount = pageStates.filter((p) => p.deleted).length;

  const handleApply = async () => {
    if (!file || keptCount === 0) return;

    setIsProcessing(true);
    setProcessError(null);
    setSuccessMessage(null);

    try {
      const outputBlob = await applyPdfOrganizerChanges(file, pageStates);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const outputName = `${baseName}_organized.pdf`;
      downloadBlob(outputBlob, outputName);
      setSuccessMessage(`Organized PDF downloaded as "${outputName}"!`);
    } catch (err: any) {
      setProcessError(err?.message || "Failed to organize PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

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
                    <Loader2 size={12} className="animate-spin" /> Reading PDF pages...
                  </span>
                ) : fileError ? (
                  <span className="text-rose-500 font-semibold">{fileError}</span>
                ) : (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {pageStates.length} {pageStates.length === 1 ? "page" : "pages"} loaded
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

      {/* Error & Success Messages */}
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

      {/* Grid of Page Cards */}
      {file && pageStates.length > 0 && !loadingFile && !fileError && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
              <LayoutGrid size={20} className="text-[#F5A623]" />
              Organize Pages
            </h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
              Drag to reorder • Click buttons to rotate or delete
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pageStates.map((page, idx) => (
              <div
                key={page.id}
                draggable={pageStates.length > 1}
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`relative group rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-white dark:bg-[#141829] ${
                  page.deleted
                    ? "opacity-40 border-rose-300 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20"
                    : "border-[#E4E0D8] dark:border-[#1E2338] hover:border-[#F5A623] hover:shadow-md"
                }`}
              >
                {/* Header bar of Thumbnail */}
                <div className="p-2 bg-[#FAFAF8] dark:bg-[#1E2338] border-b border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                  <div className="flex items-center gap-1.5">
                    {pageStates.length > 1 && (
                      <GripVertical
                        size={14}
                        className="text-[#71717A] cursor-grab active:cursor-grabbing"
                      />
                    )}
                    <span>Page {page.originalIndex + 1}</span>
                  </div>
                  {page.rotation > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5A623]/20 text-[#F5A623]">
                      {page.rotation}°
                    </span>
                  )}
                </div>

                {/* Thumbnail Preview Area */}
                <div className="p-3 flex items-center justify-center min-h-[160px] max-h-[220px] overflow-hidden bg-[#FAFAF8]/50 dark:bg-[#0C0F1E]/40">
                  {page.thumbnailUrl ? (
                    <img
                      src={page.thumbnailUrl}
                      alt={`Page ${page.originalIndex + 1}`}
                      className="max-h-[160px] object-contain rounded shadow-sm transition-transform duration-200"
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#71717A] gap-2 py-8">
                      <Loader2 size={20} className="animate-spin text-[#F5A623]" />
                      <span className="text-xs">Loading page...</span>
                    </div>
                  )}
                </div>

                {/* Card Controls */}
                <div className="p-2 border-t border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleRotate(idx)}
                    disabled={page.deleted}
                    className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold bg-[#FAFAF8] dark:bg-[#1E2338] hover:bg-[#F5A623]/20 hover:text-[#F5A623] text-[#18181B] dark:text-[#F4F4F5] transition-colors flex items-center justify-center gap-1 disabled:opacity-30"
                    title="Rotate 90° clockwise"
                  >
                    <RotateCw size={13} />
                    <span>Rotate</span>
                  </button>

                  <button
                    onClick={() => handleToggleDelete(idx)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      page.deleted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                    }`}
                    title={page.deleted ? "Undo delete" : "Delete page"}
                  >
                    {page.deleted ? (
                      <>
                        <Undo2 size={13} />
                        <span>Undo</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Action Footer */}
          <div className="sticky bottom-4 p-4 rounded-2xl bg-[#1F2544] text-white dark:bg-[#141829] dark:border dark:border-[#1E2338] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
            <div className="text-sm font-semibold text-[#FAFAF8] dark:text-[#F4F4F5] flex items-center gap-2">
              <span>
                {keptCount} {keptCount === 1 ? "page" : "pages"} kept
              </span>
              {deletedCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                  {deletedCount} deleted
                </span>
              )}
            </div>

            {keptCount === 0 && (
              <p className="text-xs font-bold text-rose-400">
                Keep at least one page to apply changes.
              </p>
            )}

            <button
              onClick={handleApply}
              disabled={isProcessing || keptCount === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-sm bg-[#F5A623] hover:bg-[#E0961F] text-[#0C0F1E] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Applying Changes...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Apply & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
