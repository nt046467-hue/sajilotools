"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Lock,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Scissors,
  Files,
  X,
} from "lucide-react";
import PdfDropzone from "./shared/PdfDropzone";
import {
  loadPdfFile,
  parsePageRanges,
  splitPdfByRanges,
  splitPdfEveryN,
  splitPdfIndividualPages,
  zipBlobs,
  downloadBlob,
  formatBytes,
  EncryptedPdfError,
  InvalidPdfError,
  PageRange,
} from "@/lib/pdf-utils";

type SplitMode = "extract" | "every_n" | "individual";

export default function PdfSplitterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [mode, setMode] = useState<SplitMode>("extract");
  const [rangeInput, setRangeInput] = useState<string>("1");
  const [everyN, setEveryN] = useState<number>(1);

  const [isSplitting, setIsSplitting] = useState(false);
  const [splitError, setSplitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setFile(selectedFile);
    setLoadingFile(true);
    setFileError(null);
    setSplitError(null);
    setSuccessMessage(null);
    setPageCount(null);

    try {
      const doc = await loadPdfFile(selectedFile);
      const pages = doc.getPageCount();
      setPageCount(pages);
      setRangeInput(pages > 1 ? `1-${Math.min(pages, 3)}` : "1");
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
    setSplitError(null);
    setSuccessMessage(null);
  };

  // Range validation for "extract" mode
  const rangeValidation = useMemo(() => {
    if (!pageCount || mode !== "extract") return { valid: true, parsed: [], error: null };
    try {
      const parsed = parsePageRanges(rangeInput, pageCount);
      return { valid: true, parsed, error: null };
    } catch (err: any) {
      return { valid: false, parsed: [], error: err.message as string };
    }
  }, [rangeInput, pageCount, mode]);

  const handleSplit = async () => {
    if (!file || !pageCount) return;

    setIsSplitting(true);
    setSplitError(null);
    setSuccessMessage(null);

    try {
      if (mode === "extract") {
        if (!rangeValidation.valid) {
          throw new Error(rangeValidation.error || "Invalid range.");
        }

        const outputs = await splitPdfByRanges(file, rangeValidation.parsed);
        if (outputs.length === 1) {
          downloadBlob(outputs[0].blob, outputs[0].name);
          setSuccessMessage(`Downloaded extracted PDF (${outputs[0].name})!`);
        } else {
          const zipBlob = await zipBlobs(outputs, "extracted-pages.zip");
          downloadBlob(zipBlob, "extracted-pages.zip");
          setSuccessMessage(`Bundled and downloaded ${outputs.length} PDF files as extracted-pages.zip!`);
        }
      } else if (mode === "every_n") {
        if (everyN < 1) {
          throw new Error("Page interval must be at least 1.");
        }
        const outputs = await splitPdfEveryN(file, everyN);
        if (outputs.length === 1) {
          downloadBlob(outputs[0].blob, outputs[0].name);
          setSuccessMessage(`Downloaded PDF (${outputs[0].name})!`);
        } else {
          const zipBlob = await zipBlobs(outputs, `split-every-${everyN}-pages.zip`);
          downloadBlob(zipBlob, `split-every-${everyN}-pages.zip`);
          setSuccessMessage(`Bundled ${outputs.length} files as split-every-${everyN}-pages.zip!`);
        }
      } else if (mode === "individual") {
        const outputs = await splitPdfIndividualPages(file);
        const zipBlob = await zipBlobs(outputs, "all-individual-pages.zip");
        downloadBlob(zipBlob, "all-individual-pages.zip");
        setSuccessMessage(`Downloaded all ${outputs.length} pages as individual-pages.zip!`);
      }
    } catch (err: any) {
      setSplitError(err?.message || "Failed to split PDF.");
    } finally {
      setIsSplitting(false);
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

      {/* File Dropzone or Active File view */}
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

      {/* Split Controls */}
      {file && pageCount && !loadingFile && !fileError && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-6">
          <h3 className="font-extrabold text-lg text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
            <Scissors size={20} className="text-[#F5A623]" />
            Choose Split Method
          </h3>

          {/* Segmented Control / Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <button
              onClick={() => setMode("extract")}
              className={`py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                mode === "extract"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                  : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              <Layers size={16} />
              <span>Extract Pages</span>
            </button>

            <button
              onClick={() => setMode("every_n")}
              disabled={pageCount <= 1}
              className={`py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                mode === "every_n"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                  : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Files size={16} />
              <span>Split Every N Pages</span>
            </button>

            <button
              onClick={() => setMode("individual")}
              disabled={pageCount <= 1}
              className={`py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                mode === "individual"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                  : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Scissors size={16} />
              <span>Individual Pages</span>
            </button>
          </div>

          {pageCount === 1 && (
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Note: This PDF has only 1 page. "Split Every N" and "Individual Pages" modes require at least 2 pages.
            </p>
          )}

          {/* Mode Configuration options */}
          <div className="pt-2">
            {mode === "extract" && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A]">
                  Page Ranges / Numbers (1 to {pageCount})
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1, 3, 5-7"
                  className="w-full px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                />
                {rangeValidation.error ? (
                  <p className="text-xs font-semibold text-rose-500 flex items-center gap-1 mt-1">
                    <AlertTriangle size={12} /> {rangeValidation.error}
                  </p>
                ) : (
                  <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                    Enter comma-separated page numbers or ranges (e.g. `1, 3, 5-7`).
                  </p>
                )}
              </div>
            )}

            {mode === "every_n" && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A]">
                  Split into chunks of N pages
                </label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={everyN}
                  onChange={(e) => setEveryN(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-[#200px] px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                />
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                  Will create {Math.ceil(pageCount / Math.max(1, everyN))} PDF files ({everyN} {everyN === 1 ? "page" : "pages"} each).
                </p>
              </div>
            )}

            {mode === "individual" && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                Will extract each of the {pageCount} pages into its own separate PDF file and download them bundled in a `.zip` file.
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleSplit}
              disabled={isSplitting || (mode === "extract" && !rangeValidation.valid)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-base bg-[#F5A623] hover:bg-[#E0961F] text-[#0C0F1E] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isSplitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Splitting PDF...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Split PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {splitError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2.5">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{splitError}</span>
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
