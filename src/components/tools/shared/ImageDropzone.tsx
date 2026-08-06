"use client";

import { useState, useRef, DragEvent, ChangeEvent, KeyboardEvent } from "react";
import { Upload, Image as ImageIcon, AlertTriangle, Info } from "lucide-react";

interface ImageDropzoneProps {
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  description?: string;
  maxSizeBytes?: number; // default 25MB
  className?: string;
}

export default function ImageDropzone({
  multiple = true,
  onFilesSelected,
  accept = "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/svg+xml,.svg",
  description = "Supports JPEG, PNG, WebP, SVG, GIF",
  maxSizeBytes = 25 * 1024 * 1024, // 25MB default
  className = "",
}: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropNotice, setDropNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | File[]) => {
    setDropNotice(null);
    const validFiles: File[] = [];
    const notices: string[] = [];

    Array.from(fileList).forEach((file) => {
      const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif|svg)$/i.test(file.name);
      
      if (!isImage) {
        notices.push(`"${file.name}" is not a supported image file.`);
        return;
      }

      if (file.size > maxSizeBytes) {
        notices.push(`"${file.name}" exceeds the max file limit of 25MB.`);
        return;
      }

      if (/\.heic|\.heif$/i.test(file.name) || file.type.includes("heic") || file.type.includes("heif")) {
        notices.push(`"${file.name}": HEIC format may not be supported by your browser natively.`);
      }

      if (file.type === "image/gif" || /\.gif$/i.test(file.name)) {
        notices.push(`"${file.name}": Animated GIFs will be compressed as a single frame.`);
      }

      validFiles.push(file);
    });

    if (notices.length > 0) {
      setDropNotice(notices.join(" "));
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so re-selecting same file triggers change
      e.target.value = "";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Upload image files"
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${
          isDragOver
            ? "border-[#7C3AED] bg-[#7C3AED]/5 scale-[0.99]"
            : "border-[#E4E0D8] dark:border-[#1E2338] hover:border-[#7C3AED]/60 bg-white dark:bg-[#141829] hover:bg-[#F5F3FF]/40 dark:hover:bg-[#2E1065]/20"
        } ${className}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center transition-transform group-hover:scale-110">
            <Upload size={28} strokeWidth={2} />
          </div>

          <div>
            <p className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5]">
              Drag &amp; drop your images here, or{" "}
              <span className="text-[#7C3AED] underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1 font-medium">
              {description} (Max 25MB per file) • {multiple ? "Batch upload supported" : "Single file"}
            </p>
          </div>
        </div>
      </div>

      {dropNotice && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-start gap-2.5">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span className="leading-relaxed">{dropNotice}</span>
        </div>
      )}
    </div>
  );
}
