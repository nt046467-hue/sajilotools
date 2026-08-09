"use client";

import { useState, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  Download,
  Trash2,
  Code2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import ImageDropzone from "./shared/ImageDropzone";

interface Base64Item {
  id: string;
  file: File;
  size: number;
  width: number;
  height: number;
  previewUrl: string;
  base64String: string;
}

type OutputType = "raw" | "html" | "css" | "js";

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function ImageToBase64Tool() {
  const [items, setItems] = useState<Base64Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OutputType>("raw");
  const [copied, setCopied] = useState<boolean>(false);

  // Revoke object URLs on unmount
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const handleFilesAdded = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const prevUrl = URL.createObjectURL(file);

        const img = new Image();
        img.onload = () => {
          const newItem: Base64Item = {
            id: Math.random().toString(36).substring(2, 9),
            file,
            size: file.size,
            width: img.naturalWidth || 0,
            height: img.naturalHeight || 0,
            previewUrl: prevUrl,
            base64String: base64,
          };

          setItems((prev) => {
            const next = [...prev, newItem];
            if (next.length === 1) setSelectedItemId(newItem.id);
            return next;
          });
        };
        img.src = prevUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((i) => i.id === id);
      if (itemToRemove && itemToRemove.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      const updated = prev.filter((i) => i.id !== id);
      if (selectedItemId === id) {
        setSelectedItemId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const clearAll = () => {
    items.forEach((i) => {
      if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
    });
    setItems([]);
    setSelectedItemId(null);
  };

  const activeItem = items.find((i) => i.id === selectedItemId) || items[0];

  const getFormattedOutput = (item: Base64Item, type: OutputType): string => {
    if (!item) return "";
    switch (type) {
      case "raw":
        return item.base64String;
      case "html":
        return `<img src="${item.base64String}" alt="${item.file.name}" />`;
      case "css":
        return `background-image: url('${item.base64String}');`;
      case "js":
        return `const imageBase64 = "${item.base64String}";`;
      default:
        return item.base64String;
    }
  };

  const currentFormattedText = activeItem ? getFormattedOutput(activeItem, activeTab) : "";

  const copyToClipboard = () => {
    if (!currentFormattedText) return;
    navigator.clipboard.writeText(currentFormattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextFile = () => {
    if (!currentFormattedText || !activeItem) return;
    const blob = new Blob([currentFormattedText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    const baseName = activeItem.file.name.substring(0, activeItem.file.name.lastIndexOf(".")) || activeItem.file.name;
    link.download = `${baseName}_base64.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Privacy Banner */}
      <div className="p-4 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center justify-between text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <ShieldCheck className="text-[#7C3AED] shrink-0" size={20} />
          <span>
            🔒 <strong>100% Client-Side Conversion:</strong> Your image is converted to Base64 in memory using FileReader API. No data is sent to servers.
          </span>
        </div>
      </div>

      {/* Dropzone */}
      <ImageDropzone onFilesSelected={handleFilesAdded} multiple={true} />

      {/* Main Content */}
      {items.length > 0 && (
        <div className="space-y-6 pt-2">
          {/* File selector pills if multiple */}
          {items.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] shrink-0 mr-1">
                Selected Image:
              </span>
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                    (selectedItemId === item.id || (!selectedItemId && idx === 0))
                      ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm"
                      : "bg-white dark:bg-[#141829] border-[#E4E0D8] dark:border-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#7C3AED]"
                  }`}
                >
                  <span className="truncate max-w-[120px]">{item.file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="hover:text-rose-300 transition-colors"
                  >
                    ×
                  </button>
                </button>
              ))}
              <button
                onClick={clearAll}
                className="text-xs font-semibold text-rose-500 hover:underline shrink-0 ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {activeItem && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-5">
              {/* Active Image Overview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E4E0D8] dark:border-[#1E2338] pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F7F5F0] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] shrink-0 flex items-center justify-center">
                    <img
                      src={activeItem.previewUrl}
                      alt={activeItem.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#18181B] dark:text-[#F4F4F5]">
                      {activeItem.file.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#71717A] dark:text-[#A1A1AA] font-semibold mt-0.5">
                      <span>{activeItem.width}×{activeItem.height} px</span>
                      <span>•</span>
                      <span>File Size: {formatBytes(activeItem.size)}</span>
                      <span>•</span>
                      <span className="text-[#7C3AED]">Base64 Length: {activeItem.base64String.length.toLocaleString()} chars</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={downloadTextFile}
                    className="px-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold hover:bg-[#F7F5F0] dark:hover:bg-[#0C0F1E] transition-colors flex items-center gap-1.5"
                  >
                    <Download size={14} /> Download .txt
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-opacity flex items-center gap-1.5 shadow-sm"
                  >
                    {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy Base64"}
                  </button>
                </div>
              </div>

              {/* Output Format Tabs */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E0D8] dark:border-[#1E2338] pb-2">
                  <button
                    onClick={() => setActiveTab("raw")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "raw"
                        ? "bg-[#7C3AED] text-white"
                        : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                  >
                    Data URI (Raw)
                  </button>
                  <button
                    onClick={() => setActiveTab("html")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "html"
                        ? "bg-[#7C3AED] text-white"
                        : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                  >
                    HTML &lt;img&gt; Tag
                  </button>
                  <button
                    onClick={() => setActiveTab("css")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "css"
                        ? "bg-[#7C3AED] text-white"
                        : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                  >
                    CSS Background
                  </button>
                  <button
                    onClick={() => setActiveTab("js")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "js"
                        ? "bg-[#7C3AED] text-white"
                        : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                    }`}
                  >
                    JavaScript Snippet
                  </button>
                </div>

                {/* Textarea Code Preview */}
                <div className="relative">
                  <textarea
                    readOnly
                    value={currentFormattedText}
                    rows={8}
                    className="w-full p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#F7F5F0] dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] text-xs font-mono resize-none focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] hover:text-[#7C3AED] transition-colors shadow-sm"
                    title="Copy snippet"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
