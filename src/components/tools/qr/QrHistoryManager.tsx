"use client";

import React, { useEffect, useState } from "react";
import { History, Palette, ArrowUpRight, RotateCcw } from "lucide-react";
import AnimatedTrashIcon, { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";
import { HistoryItem, PresetTemplate, QrStyleOptions, ContentType } from "./types";
import { PRESET_TEMPLATES } from "./QrPresets";

interface QrHistoryManagerProps {
  onSelectPreset: (preset: PresetTemplate) => void;
  onRestoreHistory: (item: HistoryItem) => void;
  currentPayload: string;
  currentType: ContentType;
  currentStyle: QrStyleOptions;
}

const STORAGE_KEY = "sajilo_qr_history_v1";

export default function QrHistoryManager({
  onSelectPreset,
  onRestoreHistory,
  currentPayload,
  currentType,
  currentStyle,
}: QrHistoryManagerProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load QR history from localStorage", e);
    }
  }, []);

  // Save current QR generation to history whenever payload completes
  useEffect(() => {
    if (!currentPayload || currentPayload.trim().length === 0) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let list: HistoryItem[] = stored ? JSON.parse(stored) : [];

      // Avoid immediate duplicate payload
      if (list.length > 0 && list[0].payload === currentPayload) return;

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: currentType,
        title: currentPayload.slice(0, 30) + (currentPayload.length > 30 ? "..." : ""),
        payload: currentPayload,
        style: currentStyle,
      };

      const updated = [newItem, ...list.filter((i) => i.payload !== currentPayload)].slice(0, 10);
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save QR history to localStorage", e);
    }
  }, [currentPayload, currentType, currentStyle]);

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  return (
    <div className="space-y-6">
      {/* Preset Templates */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
          <Palette size={14} className="text-[#F5A623]" />
          Instant Presets & Design Templates
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className="p-3.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] hover:border-[#F5A623]/60 dark:hover:border-[#F5A623]/60 transition-all text-left group flex items-start justify-between shadow-xs"
            >
              <div>
                <span className="block text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] group-hover:text-[#F5A623] transition-colors">
                  {preset.name}
                </span>
                <span className="block text-[11px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                  {preset.description}
                </span>
              </div>
              <ArrowUpRight size={14} className="text-[#A1A1AA] group-hover:text-[#F5A623] shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Local History */}
      {history.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
              <History size={14} className="text-[#F5A623]" />
              Local History (Last {history.length})
            </span>
            <AnimatedTrashButton
              onDelete={clearHistory}
              className="text-[11px] text-[#71717A] hover:text-red-500 transition-colors flex items-center gap-1"
              iconSize={12}
            >
              Clear History
            </AnimatedTrashButton>
          </div>

          <div className="divide-y divide-[#E4E0D8] dark:divide-[#2A2F48] rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] overflow-hidden">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 flex items-center justify-between hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]/50 transition-colors text-xs"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[#1F2544]/10 dark:bg-[#F5A623]/20 text-[#1F2544] dark:text-[#F5A623]">
                      {item.type}
                    </span>
                    <span className="font-mono text-[#18181B] dark:text-[#F4F4F5] truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA] block mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRestoreHistory(item)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[11px] font-medium text-[#18181B] dark:text-[#F4F4F5] hover:border-[#F5A623] transition-colors shrink-0"
                >
                  <RotateCcw size={12} /> Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
