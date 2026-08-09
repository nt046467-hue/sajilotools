"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface PdfDropzoneProps {
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  className?: string;
}

export default function PdfDropzone({
  multiple = false,
  onFilesSelected,
  accept = "application/pdf",
  className = "",
}: PdfDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndPassFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setErrorMessage(null);
    const validFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Check MIME type or .pdf extension as fallback
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage("Please select valid PDF files (.pdf).");
      return;
    }

    if (!multiple && validFiles.length > 1) {
      onFilesSelected([validFiles[0]]);
    } else {
      onFilesSelected(validFiles);
    }

    // Reset input value so re-uploading the same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    validateAndPassFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndPassFiles(e.target.files);
  };

  return (
    <div className="w-full">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? "border-[#F5A623] bg-[#F5A623]/10 dark:bg-[#F5A623]/15 scale-[1.01]"
            : "border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] hover:border-[#F5A623]/60 hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
        } ${className}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#F5A623] flex items-center justify-center transition-transform group-hover:scale-110">
            <FileText size={28} />
          </div>

          <div>
            <p className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5]">
              {multiple ? "Drop PDF files here, or " : "Drop your PDF here, or "}
              <span className="text-[#F5A623] hover:underline">browse</span>
            </p>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1">
              Supports standard `.pdf` files • 100% Client-side privacy
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Upload size={12} />
            <span>Instant Local Processing</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
