"use client";

import { useState } from "react";
import {
  FileText,
  Lock,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Minimize2,
  Info,
  X,
  Sparkles,
} from "lucide-react";
import PdfDropzone from "./shared/PdfDropzone";
import {
  loadPdfFile,
  compressPdf,
  downloadBlob,
  formatBytes,
  EncryptedPdfError,
  InvalidPdfError,
  CompressionLevel,
  CompressionResult,
} from "@/lib/pdf-utils";

export default function PdfCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [level, setLevel] = useState<CompressionLevel>("medium");

  const [isCompressing, setIsCompressing] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [compressError, setCompressError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setFile(selectedFile);
    setLoadingFile(true);
    setFileError(null);
    setCompressError(null);
    setResult(null);
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
    setCompressError(null);
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file || !pageCount) return;

    setIsCompressing(true);
    setCompressError(null);
    setResult(null);
    setProgressText("Initializing compressor engine...");

    try {
      const res = await compressPdf(file, level, (curr, total) => {
        setProgressText(`Compressing page ${curr} of ${total}...`);
      });

      setResult(res);

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const outputName = `${baseName}_compressed.pdf`;
      downloadBlob(res.blob, outputName);
    } catch (err: any) {
      setCompressError(err?.message || "Failed to compress PDF.");
    } finally {
      setIsCompressing(false);
      setProgressText(null);
    }
  };

  const compressionLevels: {
    id: CompressionLevel;
    title: string;
    desc: string;
  }[] = [
    {
      id: "low",
      title: "Low Compression",
      desc: "Minimal compression • Best visual quality • Slight size reduction",
    },
    {
      id: "medium",
      title: "Medium Compression",
      desc: "Balanced compression • Good visual quality • Recommended",
    },
    {
      id: "high",
      title: "High Compression",
      desc: "Maximum compression • Smallest file size • Visible quality trade-off",
    },
  ];

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

      {/* Honest Expectation Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-[#18181B] dark:text-[#F4F4F5] flex items-start gap-3 text-xs leading-relaxed">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
        <div>
          <strong>How PDF compression works:</strong> Compresses embedded images inside your PDF. Works best on image-heavy or scanned PDFs. Text-only PDFs are already small and may not shrink much.
        </div>
      </div>

      {/* File Dropzone or active file info */}
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

      {/* Compression Level Controls */}
      {file && pageCount && !loadingFile && !fileError && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-6">
          <h3 className="font-extrabold text-lg text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
            <Minimize2 size={20} className="text-[#F5A623]" />
            Choose Compression Level
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {compressionLevels.map((item) => (
              <div
                key={item.id}
                onClick={() => setLevel(item.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  level === item.id
                    ? "border-[#F5A623] bg-[#F5A623]/10 dark:bg-[#F5A623]/15 shadow-sm"
                    : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] hover:border-[#F5A623]/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-extrabold text-sm text-[#18181B] dark:text-[#F4F4F5]">
                      {item.title}
                    </h4>
                    <input
                      type="radio"
                      name="compressionLevel"
                      checked={level === item.id}
                      onChange={() => setLevel(item.id)}
                      className="accent-[#F5A623]"
                    />
                  </div>
                  <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleCompress}
              disabled={isCompressing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-base bg-[#F5A623] hover:bg-[#E0961F] text-[#0C0F1E] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isCompressing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{progressText || "Compressing PDF..."}</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Compress & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Compression Error */}
      {compressError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2.5">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{compressError}</span>
        </div>
      )}

      {/* Compression Results Banner */}
      {result && (
        <div
          className={`p-5 rounded-2xl border ${
            result.reduced
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.reduced ? (
              <CheckCircle2 size={20} className="shrink-0 text-emerald-500 mt-0.5" />
            ) : (
              <Sparkles size={20} className="shrink-0 text-amber-500 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="font-extrabold text-base">
                {result.reduced
                  ? `Compressed Successfully!`
                  : `This PDF is already optimized`}
              </h4>
              <p className="text-xs leading-relaxed">
                {result.reduced ? (
                  <>
                    Original size: <strong>{formatBytes(result.originalSize)}</strong> • Compressed size:{" "}
                    <strong>{formatBytes(result.compressedSize)}</strong> (
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      Reduced by{" "}
                      {Math.round(
                        ((result.originalSize - result.compressedSize) /
                          result.originalSize) *
                          100
                      )}
                      %
                    </span>
                    )
                  </>
                ) : (
                  <>
                    No further compression was possible without degrading quality beyond acceptable levels. Returned the original file unchanged ({formatBytes(result.originalSize)}).
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
