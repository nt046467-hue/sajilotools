"use client";

import React, { useState, useEffect, useCallback } from "react";
import { QrCode, Layers, Shield, Sparkles } from "lucide-react";
import QrPayloadForm from "./qr/QrPayloadForm";
import QrStyleControls from "./qr/QrStyleControls";
import QrPreviewExport from "./qr/QrPreviewExport";
import QrBatchTool from "./qr/QrBatchTool";
import QrHistoryManager from "./qr/QrHistoryManager";
import {
  ContentType,
  QrStyleOptions,
  PresetTemplate,
  HistoryItem,
} from "./qr/types";

export default function QrCodeTool() {
  const [activeMode, setActiveMode] = useState<"single" | "batch">("single");
  const [activeType, setActiveType] = useState<ContentType>("url");
  const [payload, setPayload] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  const [styleOptions, setStyleOptions] = useState<QrStyleOptions>({
    darkColor: "#1F2544",
    lightColor: "#FFFFFF",
    isTransparent: false,
    colorType: "single",
    gradientType: "linear",
    gradientColor1: "#DC2626",
    gradientColor2: "#D97706",
    gradientRotation: 45,
    dotStyle: "square",
    cornerSquareStyle: "square",
    cornerDotStyle: "square",
    eyeFrameColor: "",
    eyeDotColor: "",
    useCustomEyeColors: false,
    errorCorrectionLevel: "M",
    size: 512,
    logoSrc: null,
    logoSize: 0.2,
    logoMargin: 4,
    logoHideBackgroundDots: true,
  });

  // Sync URL search params on client side for shareable configs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get("type") as ContentType;
    if (typeParam && ["url", "text", "wifi", "vcard", "email", "sms", "phone", "location", "event"].includes(typeParam)) {
      setActiveType(typeParam);
    }
  }, []);

  const updateStyle = useCallback((updated: Partial<QrStyleOptions>) => {
    setStyleOptions((prev) => ({ ...prev, ...updated }));
  }, []);

  const handlePayloadChange = useCallback((newPayload: string, isValid: boolean) => {
    setPayload(newPayload);
    setIsFormValid(isValid);
  }, []);

  const handleSelectPreset = useCallback((preset: PresetTemplate) => {
    setActiveType(preset.type);
    if (preset.defaultData) {
      setInitialData(preset.defaultData);
    }
    if (preset.style) {
      setStyleOptions((prev) => ({ ...prev, ...preset.style }));
    }
  }, []);

  const handleRestoreHistory = useCallback((item: HistoryItem) => {
    setActiveType(item.type);
    setPayload(item.payload);
    if (item.style) {
      setStyleOptions(item.style);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Mode Header Switcher: Single vs Batch */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveMode("single")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === "single"
                ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
          >
            <QrCode size={15} /> Single QR Generator
          </button>

          <button
            onClick={() => setActiveMode("batch")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === "batch"
                ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
          >
            <Layers size={15} /> Batch Generator (ZIP)
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
          <Shield size={13} />
          <span>100% Client-Side Privacy</span>
        </div>
      </div>

      {activeMode === "single" ? (
        /* Single QR Generator View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Controls (Left Column) */}
          <div className="lg:col-span-7 space-y-6">
            <QrPayloadForm
              activeType={activeType}
              onTypeChange={(type) => {
                setActiveType(type);
                setInitialData(null);
              }}
              onPayloadChange={handlePayloadChange}
              initialData={initialData}
            />

            <QrStyleControls
              styleOptions={styleOptions}
              onChange={updateStyle}
            />

            <QrHistoryManager
              onSelectPreset={handleSelectPreset}
              onRestoreHistory={handleRestoreHistory}
              currentPayload={payload}
              currentType={activeType}
              currentStyle={styleOptions}
            />
          </div>

          {/* Live Preview & Export (Right Sticky Column) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-6">
            <QrPreviewExport
              payload={payload}
              isFormValid={isFormValid}
              styleOptions={styleOptions}
              onStyleChange={updateStyle}
            />
          </div>
        </div>
      ) : (
        /* Batch QR Generator View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <QrBatchTool styleOptions={styleOptions} />
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-6">
            <QrStyleControls
              styleOptions={styleOptions}
              onChange={updateStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
}
