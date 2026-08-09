"use client";

import { useState } from "react";
import {
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  Lock,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  FileStack,
} from "lucide-react";
import PdfDropzone from "./shared/PdfDropzone";
import { trackError } from "@/lib/analytics";
import {
  loadPdfFile,
  mergePdfs,
  downloadBlob,
  formatBytes,
  EncryptedPdfError,
  InvalidPdfError,
} from "@/lib/pdf-utils";

interface PdfFileItem {
  id: string;
  file: File;
  pageCount: number | null;
  loadingPages: boolean;
  error: string | null;
}

export default function PdfMergerTool() {
  const [items, setItems] = useState<PdfFileItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFilesAdded = async (files: File[]) => {
    setMergeError(null);
    setSuccessMessage(null);

    const newItems: PdfFileItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      pageCount: null,
      loadingPages: true,
      error: null,
    }));

    setItems((prev) => [...prev, ...newItems]);

    // Load page counts asynchronously
    for (const item of newItems) {
      try {
        const doc = await loadPdfFile(item.file);
        const pages = doc.getPageCount();
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, pageCount: pages, loadingPages: false } : i
          )
        );
      } catch (err: any) {
        let errStr = "Failed to load PDF.";
        if (err instanceof EncryptedPdfError) {
          errStr = err.message;
        } else if (err instanceof InvalidPdfError) {
          errStr = err.message;
        }
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, error: errStr, loadingPages: false } : i
          )
        );
      }
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSuccessMessage(null);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === items.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);

    setItems(newItems);
  };

  const totalSize = items.reduce((acc, curr) => acc + curr.file.size, 0);
  const totalPages = items.reduce(
    (acc, curr) => acc + (curr.pageCount || 0),
    0
  );
  const validItemsCount = items.filter((i) => !i.error && !i.loadingPages).length;
  const hasErrors = items.some((i) => i.error);

  const handleMerge = async () => {
    if (validItemsCount < 2) return;

    setIsMerging(true);
    setMergeError(null);
    setSuccessMessage(null);

    try {
      const filesToMerge = items
        .filter((i) => !i.error)
        .map((i) => i.file);

      const mergedBlob = await mergePdfs(filesToMerge);
      downloadBlob(mergedBlob, "merged.pdf");
      setSuccessMessage(`Successfully merged ${filesToMerge.length} PDFs (${totalPages} total pages)!`);
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred while merging PDFs.";
      setMergeError(msg);
      trackError("pdf-merger", msg);
    } finally {
      setIsMerging(false);
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

      {/* File Dropzone */}
      <PdfDropzone multiple={true} onFilesSelected={handleFilesAdded} />

      {/* File List / Actions */}
      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-[#18181B] dark:text-[#F4F4F5] text-lg flex items-center gap-2">
              <FileStack size={20} className="text-[#F5A623]" />
              Selected PDFs ({items.length})
            </h3>
            <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-semibold">
              Total Size: {formatBytes(totalSize)} • Total Pages: {totalPages}
            </div>
          </div>

          {/* Warning for large files */}
          {totalSize > 50 * 1024 * 1024 && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <AlertTriangle size={16} className="shrink-0" />
              <span>
                Large files selected ({formatBytes(totalSize)}). Processing may take longer depending on your device RAM.
              </span>
            </div>
          )}

          {/* List of files */}
          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                  item.error
                    ? "bg-rose-500/5 border-rose-500/30"
                    : "bg-white dark:bg-[#141829] border-[#E4E0D8] dark:border-[#1E2338]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#F5A623] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-[#18181B] dark:text-[#F4F4F5] truncate">
                      {item.file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                      <span>{formatBytes(item.file.size)}</span>
                      <span>•</span>
                      {item.loadingPages ? (
                        <span className="flex items-center gap-1 text-[#F5A623]">
                          <Loader2 size={12} className="animate-spin" /> Counting pages...
                        </span>
                      ) : item.error ? (
                        <span className="text-rose-500 font-semibold">{item.error}</span>
                      ) : (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {item.pageCount} {item.pageCount === 1 ? "page" : "pages"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => moveItem(idx, "up")}
                    disabled={idx === 0}
                    className="p-2 rounded-xl text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveItem(idx, "down")}
                    disabled={idx === items.length - 1}
                    className="p-2 rounded-xl text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Action Button */}
          <div className="pt-4 flex flex-col items-center space-y-3">
            <button
              onClick={handleMerge}
              disabled={validItemsCount < 2 || isMerging}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-base bg-[#F5A623] hover:bg-[#E0961F] text-[#0C0F1E] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isMerging ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Merging PDFs...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Merge {validItemsCount} PDFs</span>
                </>
              )}
            </button>

            {validItemsCount < 2 && (
              <p className="text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA]">
                Add at least 2 valid PDFs to merge
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {mergeError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2.5">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{mergeError}</span>
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
