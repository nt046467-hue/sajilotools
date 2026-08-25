"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Download, FileCode, Copy, Check, QrCode, Eye, ChevronUp, Maximize2 } from "lucide-react";
import { QrStyleOptions } from "./types";

interface QrMobilePreviewProps {
  payload: string;
  isFormValid: boolean;
  styleOptions: QrStyleOptions;
  onStyleChange: (updated: Partial<QrStyleOptions>) => void;
}

export default function QrMobilePreview({
  payload,
  isFormValid,
  styleOptions,
  onStyleChange,
}: QrMobilePreviewProps) {
  const miniContainerNodeRef = useRef<HTMLDivElement | null>(null);
  const expandedContainerNodeRef = useRef<HTMLDivElement | null>(null);
  const miniQrRef = useRef<any>(null);
  const expandedQrRef = useRef<any>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasQr, setHasQr] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isHoveringDismiss, setIsHoveringDismiss] = useState(false);

  // Draggable floating button refs & state
  const floatingBtnRef = useRef<HTMLDivElement | null>(null);
  const dismissCircleRef = useRef<HTMLDivElement | null>(null);
  const dismissLabelRef = useRef<HTMLSpanElement | null>(null);
  const currentPosRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);
  const dragMovedRef = useRef(false);
  const isHoveringDismissRef = useRef(false);

  // Position initialized on mount via GPU transform
  useEffect(() => {
    if (typeof window !== "undefined") {
      const screenW = window.innerWidth || document.documentElement.clientWidth;
      const screenH = window.innerHeight || document.documentElement.clientHeight;
      const defaultX = screenW - 72;
      const defaultY = screenH - 105;
      currentPosRef.current = { x: defaultX, y: defaultY };
      if (floatingBtnRef.current) {
        floatingBtnRef.current.style.transform = `translate3d(${defaultX}px, ${defaultY}px, 0)`;
      }
    }
  }, []);

  // Automatically restore floating button if user starts typing a new QR payload
  useEffect(() => {
    if (payload && isDismissed) {
      setIsDismissed(false);
      setTimeout(() => {
        if (floatingBtnRef.current && currentPosRef.current) {
          floatingBtnRef.current.style.opacity = "1";
          floatingBtnRef.current.style.transform = `translate3d(${currentPosRef.current.x}px, ${currentPosRef.current.y}px, 0) scale(1)`;
        }
      }, 50);
    }
  }, [payload, isDismissed]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isExpanded || isDismissed || isDismissing) return;
    dragMovedRef.current = false;
    isHoveringDismissRef.current = false;
    setIsHoveringDismiss(false);

    const screenW = window.innerWidth || document.documentElement.clientWidth;
    const screenH = window.innerHeight || document.documentElement.clientHeight;

    // Fallback current pos
    if (!currentPosRef.current) {
      currentPosRef.current = { x: screenW - 72, y: screenH - 105 };
    }

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentPosRef.current.x,
      initialY: currentPosRef.current.y,
    };

    if (floatingBtnRef.current) {
      floatingBtnRef.current.style.transition = "none";
    }

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || isDismissed || isDismissing) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (!dragMovedRef.current && dist > 5) {
      dragMovedRef.current = true;
      setIsDragging(true);
    }

    if (dragMovedRef.current) {
      const btnSize = 56;
      const screenW = window.innerWidth || document.documentElement.clientWidth;
      const screenH = window.innerHeight || document.documentElement.clientHeight;

      const newX = Math.max(8, Math.min(screenW - btnSize - 8, dragStartRef.current.initialX + dx));
      const newY = Math.max(50, Math.min(screenH - btnSize - 15, dragStartRef.current.initialY + dy));
      currentPosRef.current = { x: newX, y: newY };

      // Check if button is dragged near bottom center (dismiss target)
      const bubbleCenterX = newX + btnSize / 2;
      const bubbleCenterY = newY + btnSize / 2;
      const targetCenterX = screenW / 2;
      const targetCenterY = screenH - 64;

      const distToDismiss = Math.hypot(bubbleCenterX - targetCenterX, bubbleCenterY - targetCenterY);
      const isNearDismiss = distToDismiss < 90 || (bubbleCenterY > screenH - 130 && Math.abs(bubbleCenterX - targetCenterX) < 80);

      if (isNearDismiss !== isHoveringDismissRef.current) {
        isHoveringDismissRef.current = isNearDismiss;
        setIsHoveringDismiss(isNearDismiss);

        // Immediate 0ms visual feedback on bottom target
        if (dismissCircleRef.current) {
          if (isNearDismiss) {
            dismissCircleRef.current.className = "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-xl border bg-red-600 text-white border-red-300 scale-125 shadow-[0_0_40px_rgba(239,68,68,0.95)] ring-4 ring-red-500/50 rotate-90";
          } else {
            dismissCircleRef.current.className = "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-xl border bg-black/75 dark:bg-[#151A2E]/95 text-white border-white/30 scale-100 shadow-[0_10px_30px_rgba(0,0,0,0.6)]";
          }
        }
        if (dismissLabelRef.current) {
          dismissLabelRef.current.textContent = isNearDismiss ? "Release to remove" : "Drag here to remove";
          if (isNearDismiss) {
            dismissLabelRef.current.className = "text-[10px] font-extrabold tracking-wider uppercase px-3.5 py-1 rounded-full backdrop-blur-md transition-all duration-200 shadow-md bg-red-600 text-white scale-110 shadow-red-500/50";
          } else {
            dismissLabelRef.current.className = "text-[10px] font-extrabold tracking-wider uppercase px-3.5 py-1 rounded-full backdrop-blur-md transition-all duration-200 shadow-md bg-black/75 text-white/90 border border-white/15";
          }
        }
      }

      // 60-120fps Zero-Lag Direct GPU Transform update
      if (floatingBtnRef.current) {
        floatingBtnRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0) scale(${isNearDismiss ? 0.85 : 1.1})`;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    dragStartRef.current = null;

    if (dragMovedRef.current) {
      if (isHoveringDismissRef.current) {
        // Dropped inside dismiss zone -> Pop animation into center of cross
        const screenW = window.innerWidth || document.documentElement.clientWidth;
        const screenH = window.innerHeight || document.documentElement.clientHeight;
        const targetCenterX = screenW / 2 - 28;
        const targetCenterY = screenH - 92;

        if (floatingBtnRef.current) {
          floatingBtnRef.current.style.transition = "transform 0.28s cubic-bezier(0.4, 0, 1, 1), opacity 0.28s ease";
          floatingBtnRef.current.style.transform = `translate3d(${targetCenterX}px, ${targetCenterY}px, 0) scale(0) rotate(-45deg)`;
          floatingBtnRef.current.style.opacity = "0";
        }

        setIsDismissing(true);
        setIsDragging(false);
        setTimeout(() => {
          setIsDismissed(true);
          setIsDismissing(false);
          setIsHoveringDismiss(false);
          isHoveringDismissRef.current = false;
        }, 300);
        return;
      }

      // Drag ended -> snap smoothly to nearest left or right edge
      const btnSize = 56;
      const screenW = window.innerWidth || document.documentElement.clientWidth;
      const screenH = window.innerHeight || document.documentElement.clientHeight;
      const currentX = currentPosRef.current?.x ?? (screenW - 72);
      const currentY = currentPosRef.current?.y ?? (screenH - 105);
      const snapToLeft = currentX + btnSize / 2 < screenW / 2;
      const targetX = snapToLeft ? 16 : screenW - btnSize - 16;
      const targetY = Math.max(60, Math.min(screenH - btnSize - 25, currentY));
      currentPosRef.current = { x: targetX, y: targetY };

      if (floatingBtnRef.current) {
        floatingBtnRef.current.style.transition = "transform 0.32s cubic-bezier(0.18, 0.9, 0.3, 1.2)";
        floatingBtnRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(1)`;
      }
    }

    setIsHoveringDismiss(false);
    isHoveringDismissRef.current = false;
    setIsDragging(false);

    setTimeout(() => {
      dragMovedRef.current = false;
    }, 50);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragMovedRef.current && !isDragging && !isDismissed && !isDismissing) {
      setIsExpanded(true);
    }
  };

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedPayload, setDebouncedPayload] = useState(payload);
  const [debouncedStyle, setDebouncedStyle] = useState(styleOptions);

  // Debounce payload + style changes (200ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedPayload(payload);
      setDebouncedStyle(styleOptions);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [payload, styleOptions]);

  // Build QR options helper
  const buildQrOptions = useCallback(
    (size: number) => {
      const opts: any = {
        width: size,
        height: size,
        type: "canvas",
        data: debouncedPayload,
        margin: Math.max(4, Math.round(size * 0.06)),
        qrOptions: {
          errorCorrectionLevel: debouncedStyle.errorCorrectionLevel,
        },
        dotsOptions: {
          type: debouncedStyle.dotStyle,
          color:
            debouncedStyle.colorType === "single"
              ? debouncedStyle.darkColor
              : undefined,
          gradient:
            debouncedStyle.colorType === "gradient"
              ? {
                type: debouncedStyle.gradientType,
                rotation:
                  (debouncedStyle.gradientRotation * Math.PI) / 180,
                colorStops: [
                  { offset: 0, color: debouncedStyle.gradientColor1 },
                  { offset: 1, color: debouncedStyle.gradientColor2 },
                ],
              }
              : undefined,
        },
        backgroundOptions: {
          color: debouncedStyle.isTransparent
            ? "transparent"
            : debouncedStyle.lightColor,
        },
        cornersSquareOptions: {
          type: debouncedStyle.cornerSquareStyle,
          color: debouncedStyle.eyeFrameColor || debouncedStyle.darkColor,
        },
        cornersDotOptions: {
          type: debouncedStyle.cornerDotStyle,
          color: debouncedStyle.eyeDotColor || debouncedStyle.darkColor,
        },
      };

      if (debouncedStyle.logoSrc) {
        opts.image = debouncedStyle.logoSrc;
        opts.imageOptions = {
          hideBackgroundDots: debouncedStyle.logoHideBackgroundDots,
          imageSize: debouncedStyle.logoSize,
          margin: 2,
          crossOrigin: "anonymous",
        };
      }
      return opts;
    },
    [debouncedPayload, debouncedStyle]
  );

  // Callback ref for mini container to append canvas immediately when node mounts
  const setMiniContainerRef = useCallback((node: HTMLDivElement | null) => {
    miniContainerNodeRef.current = node;
    if (node && miniQrRef.current) {
      node.innerHTML = "";
      miniQrRef.current.append(node);
    }
  }, []);

  // Callback ref for expanded modal container
  const setExpandedContainerRef = useCallback((node: HTMLDivElement | null) => {
    expandedContainerNodeRef.current = node;
    if (node && expandedQrRef.current) {
      node.innerHTML = "";
      expandedQrRef.current.append(node);
    }
  }, []);

  // Render mini QR (80x80 scaled to 44px)
  useEffect(() => {
    if (!debouncedPayload || !isFormValid) {
      setHasQr(false);
      if (miniContainerNodeRef.current) miniContainerNodeRef.current.innerHTML = "";
      return;
    }

    let isMounted = true;
    import("qr-code-styling").then((module) => {
      if (!isMounted) return;
      const QRCodeStyling = module.default;
      const opts = buildQrOptions(100);

      if (!miniQrRef.current) {
        miniQrRef.current = new QRCodeStyling(opts);
      } else {
        miniQrRef.current.update(opts);
      }

      if (miniContainerNodeRef.current) {
        miniContainerNodeRef.current.innerHTML = "";
        miniQrRef.current.append(miniContainerNodeRef.current);
      }
      setHasQr(true);
    });

    return () => {
      isMounted = false;
    };
  }, [debouncedPayload, isFormValid, buildQrOptions]);

  // Render expanded QR (280px) — only when modal is open
  useEffect(() => {
    if (!isExpanded || !debouncedPayload || !isFormValid) {
      return;
    }

    let isMounted = true;
    import("qr-code-styling").then((module) => {
      if (!isMounted) return;
      const QRCodeStyling = module.default;
      const opts = buildQrOptions(280);

      if (!expandedQrRef.current) {
        expandedQrRef.current = new QRCodeStyling(opts);
      } else {
        expandedQrRef.current.update(opts);
      }

      if (expandedContainerNodeRef.current) {
        expandedContainerNodeRef.current.innerHTML = "";
        expandedQrRef.current.append(expandedContainerNodeRef.current);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isExpanded, debouncedPayload, isFormValid, buildQrOptions]);

  // Lock body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      const prevOverflow = document.body.style.overflow;
      const prevTouch = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouch;
      };
    }
  }, [isExpanded]);

  // Animated close
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
      expandedQrRef.current = null;
    }, 280);
  }, []);

  // Export helpers
  async function getExportInstance(exportSize: number, extension: "png" | "svg") {
    const qrModule = await import("qr-code-styling");
    const QRCodeStyling = qrModule.default;

    const opts: any = {
      width: exportSize,
      height: exportSize,
      type: extension === "svg" ? "svg" : "canvas",
      data: payload,
      margin: Math.round(exportSize * 0.04),
      qrOptions: {
        errorCorrectionLevel: styleOptions.errorCorrectionLevel,
      },
      dotsOptions: {
        type: styleOptions.dotStyle,
        color:
          styleOptions.colorType === "single"
            ? styleOptions.darkColor
            : undefined,
        gradient:
          styleOptions.colorType === "gradient"
            ? {
              type: styleOptions.gradientType,
              rotation:
                (styleOptions.gradientRotation * Math.PI) / 180,
              colorStops: [
                { offset: 0, color: styleOptions.gradientColor1 },
                { offset: 1, color: styleOptions.gradientColor2 },
              ],
            }
            : undefined,
      },
      backgroundOptions: {
        color: styleOptions.isTransparent
          ? "transparent"
          : styleOptions.lightColor,
      },
      cornersSquareOptions: {
        type: styleOptions.cornerSquareStyle,
        color: styleOptions.eyeFrameColor || styleOptions.darkColor,
      },
      cornersDotOptions: {
        type: styleOptions.cornerDotStyle,
        color: styleOptions.eyeDotColor || styleOptions.darkColor,
      },
    };

    if (styleOptions.logoSrc) {
      opts.image = styleOptions.logoSrc;
      opts.imageOptions = {
        hideBackgroundDots: styleOptions.logoHideBackgroundDots,
        imageSize: styleOptions.logoSize,
        margin: 4,
        crossOrigin: "anonymous",
      };
    }

    return new QRCodeStyling(opts);
  }

  async function handleDownloadPng() {
    if (!hasQr || !payload) return;
    try {
      const exportQr = await getExportInstance(styleOptions.size, "png");
      await exportQr.download({
        name: `qrcode_${styleOptions.size}px`,
        extension: "png",
      });
    } catch (err) {
      console.error("PNG download error:", err);
    }
  }

  async function handleDownloadSvg() {
    if (!hasQr || !payload) return;
    try {
      const exportQr = await getExportInstance(styleOptions.size, "svg");
      await exportQr.download({
        name: "qrcode_vector",
        extension: "svg",
      });
    } catch (err) {
      console.error("SVG download error:", err);
    }
  }

  async function handleCopyImage() {
    if (!hasQr || !payload) return;
    try {
      const exportQr = await getExportInstance(512, "png");
      const raw = await exportQr.getRawData("png");
      if (raw) {
        const imageBlob =
          raw instanceof Blob
            ? raw
            : new Blob([raw as unknown as BlobPart], { type: "image/png" });
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": imageBlob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Copy image error:", err);
    }
  }

  const sizes = [256, 512, 1024, 2048];

  return (
    <div className="lg:hidden">
      {/* ─── Messenger-style Bottom Dismiss Drop Zone (Active during Drag) ─── */}
      {isDragging && !isDismissed && (
        <>
          {/* Bottom subtle vignette backdrop */}
          <div
            className="fixed inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none z-20"
            style={{
              animation: "qrSheetOverlayIn 0.2s ease-out forwards",
            }}
          />

          {/* Centered circular dismiss drop target */}
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-2 transition-all duration-300"
            style={{
              animation: "qrDismissZoneIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <div
              ref={dismissCircleRef}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-xl border ${
                isHoveringDismiss
                  ? "bg-red-600 text-white border-red-300 scale-125 shadow-[0_0_40px_rgba(239,68,68,0.95)] ring-4 ring-red-500/50 rotate-90"
                  : "bg-black/75 dark:bg-[#151A2E]/95 text-white border-white/30 scale-100 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
              }`}
            >
              <X
                size={isHoveringDismiss ? 28 : 24}
                className="transition-transform duration-200"
              />
            </div>
            <span
              ref={dismissLabelRef}
              className={`text-[10px] font-extrabold tracking-wider uppercase px-3.5 py-1 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
                isHoveringDismiss
                  ? "bg-red-600 text-white scale-110 shadow-red-500/50"
                  : "bg-black/75 text-white/90 border border-white/15"
              }`}
            >
              {isHoveringDismiss ? "Release to remove" : "Drag here to remove"}
            </span>
          </div>
        </>
      )}

      {/* ─── Draggable Floating Mini-Preview (56x56px) ─── */}
      {!isDismissed && (
        <div
          ref={floatingBtnRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleButtonClick}
          role="button"
          tabIndex={0}
          aria-label="Open QR preview (draggable to any corner or bottom center to remove)"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 30,
            touchAction: "none",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "transparent",
            willChange: "transform",
          }}
        >
          {hasQr ? (
            /* ── QR Ready: Sleek Compact 56x56 Thumbnail ── */
            <div
              className={`relative bg-white/95 dark:bg-[#151A2E]/95 backdrop-blur-md border ${
                isHoveringDismiss
                  ? "border-rose-500 ring-2 ring-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                  : isDragging
                  ? "border-[#F5A623] shadow-[0_16px_36px_rgba(0,0,0,0.3)] ring-2 ring-[#F5A623]"
                  : "border-[#E4E0D8] dark:border-[#2A2F48] shadow-[0_8px_24px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              }`}
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
              }}
            >
              {/* Live QR mini canvas */}
              <div
                ref={setMiniContainerRef}
                className="qr-mini-canvas flex items-center justify-center rounded-lg overflow-hidden"
                style={{ width: 44, height: 44, pointerEvents: "none" }}
              />

              {/* Tiny sleek "LIVE" badge with breathing glow */}
              <span
                className="absolute -top-1.5 -right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider text-white bg-emerald-500 ring-2 ring-white dark:ring-[#151A2E] pointer-events-none qr-live-badge-glow"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white qr-live-dot-pulse" />
                LIVE
              </span>
            </div>
          ) : (
            /* ── No QR: Compact Minimal Floating Action Button ── */
            <div
              className={`relative bg-white/95 dark:bg-[#151A2E]/95 backdrop-blur-md border ${
                isHoveringDismiss
                  ? "border-rose-500 ring-2 ring-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                  : isDragging
                  ? "border-[#F5A623] shadow-[0_16px_36px_rgba(0,0,0,0.3)] ring-2 ring-[#F5A623]"
                  : "border-[#E4E0D8] dark:border-[#2A2F48] shadow-[0_8px_24px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
              }`}
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCode size={22} className="text-[#F5A623] pointer-events-none" />
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F5A623] ring-2 ring-white dark:ring-[#151A2E] pointer-events-none qr-amber-dot-glow"
              />
            </div>
          )}
        </div>
      )}

      {/* ─── Expanded Bottom-Sheet Modal ─── */}
      {isExpanded && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100dvh',
            zIndex: 60,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            touchAction: 'none',
            overscrollBehavior: 'none',
            animation: isClosing ? undefined : 'qrSheetOverlayIn 0.2s ease-out forwards',
            opacity: isClosing ? 0 : undefined,
            transition: isClosing ? 'opacity 0.25s ease-out' : undefined,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#111527] border-t border-[#E4E0D8]/80 dark:border-[#2A2F48]"
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '88dvh',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              borderRadius: '24px 24px 0 0',
              padding: '0 20px',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
              boxShadow: '0 -16px 48px rgba(0, 0, 0, 0.3)',
              animation: isClosing
                ? 'qrSheetSlideDown 0.28s cubic-bezier(0.4, 0, 1, 1) forwards'
                : 'qrSheetSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Handle bar (tappable to close) */}
            <div
              onClick={handleClose}
              className="cursor-pointer group flex justify-center py-3 -mx-4"
              aria-label="Dismiss preview"
            >
              <div
                className="bg-[#D4D4D8] dark:bg-[#3F3F46] group-hover:bg-[#A1A1AA] dark:group-hover:bg-[#71717A] transition-colors"
                style={{ width: 42, height: 4, borderRadius: 2 }}
              />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 16px' }}>
              <div className="flex items-center gap-2.5">
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }} className="bg-gradient-to-br from-[#F5A623] to-[#E8930C] shadow-sm">
                  <QrCode size={17} className="text-white" />
                </div>
                <div>
                  <span
                    className="text-[#18181B] dark:text-[#F4F4F5]"
                    style={{ fontSize: 15, fontWeight: 700, display: 'block', lineHeight: 1.2 }}
                  >
                    QR Code Preview
                  </span>
                  <span
                    className="text-[#71717A] dark:text-[#A1A1AA]"
                    style={{ fontSize: 11, fontWeight: 500 }}
                  >
                    {hasQr ? 'Ready to export' : 'Waiting for input'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-full text-[#71717A] hover:text-[#18181B] dark:text-[#A1A1AA] dark:hover:text-white bg-[#FAFAF8] dark:bg-[#1E2338] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Preview Area */}
            <div
              className="border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#0C0F1E]"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                marginBottom: 20,
                borderRadius: 20,
                minHeight: 300,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle grid pattern background */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle, #d4d4d8 0.5px, transparent 0.5px)',
                backgroundSize: '16px 16px',
                opacity: 0.3,
                pointerEvents: 'none',
              }} className="dark:opacity-10" />

              {hasQr ? (
                <div
                  ref={setExpandedContainerRef}
                  className="max-w-full [&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:aspect-square [&>canvas]:rounded-xl [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:aspect-square"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }} className="bg-[#E4E0D8]/50 dark:bg-[#1E2338]">
                    <QrCode size={28} className="text-[#A1A1AA] dark:text-[#52525B]" />
                  </div>
                  <p className="text-[#71717A] dark:text-[#A1A1AA]" style={{ fontSize: 13, fontWeight: 600 }}>
                    No QR code yet
                  </p>
                  <p className="text-[#A1A1AA] dark:text-[#52525B]" style={{ fontSize: 11, fontWeight: 400, marginTop: 4 }}>
                    Fill in the content fields above to generate
                  </p>
                </div>
              )}
            </div>

            {/* Export Section — only when QR exists */}
            {hasQr && (
              <>
                {/* Resolution Picker */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="text-[#71717A] dark:text-[#A1A1AA]" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Export Resolution
                    </span>
                    <span
                      className="text-[#18181B] dark:text-[#F4F4F5] bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]"
                      style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', padding: '3px 8px', borderRadius: 6 }}
                    >
                      {styleOptions.size}×{styleOptions.size}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onStyleChange({ size: s })}
                        className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                          styleOptions.size === s
                            ? "border-[#F5A623] bg-[#F5A623]/10 text-[#18181B] dark:text-[#F4F4F5] shadow-sm"
                            : "border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] text-[#71717A] dark:text-[#A1A1AA] hover:border-[#F5A623]/40"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Primary: PNG Download */}
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] hover:opacity-90 active:scale-[0.99] transition-all"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '14px 16px',
                      borderRadius: 14,
                      fontSize: 13,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(31,37,68,0.2)',
                    }}
                  >
                    <Download size={16} />
                    Download PNG ({styleOptions.size}px)
                  </button>

                  {/* Secondary row: SVG + Copy */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className="flex-1 border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] bg-white dark:bg-[#141829] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] active:scale-[0.98] transition-all"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '11px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <FileCode size={14} className="text-[#F5A623]" />
                      Vector SVG
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyImage}
                      className="flex-1 border border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] dark:text-[#A1A1AA] bg-white dark:bg-[#141829] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] active:scale-[0.98] transition-all"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '11px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copied ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copied ? "Copied!" : "Copy Image"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Keyframes + canvas sizing */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes qrSheetOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes qrSheetSlideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes qrSheetSlideDown {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(100%); }
        }
        @keyframes qrLiveBadgeGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7), 0 0 5px rgba(16, 185, 129, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 3.5px rgba(16, 185, 129, 0.12), 0 0 10px rgba(16, 185, 129, 0.85);
            transform: scale(1.03);
          }
        }
        @keyframes qrDismissZoneIn {
          from {
            opacity: 0;
            transform: translate(-50%, 20px) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        @keyframes qrAmberDotGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(245, 166, 35, 0.7), 0 0 4px rgba(245, 166, 35, 0.4);
            opacity: 0.85;
          }
          50% {
            box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1), 0 0 9px rgba(245, 166, 35, 0.9);
            opacity: 1;
          }
        }
        @keyframes qrDotInnerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.75); }
        }
        .qr-live-badge-glow {
          animation: qrLiveBadgeGlow 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .qr-live-dot-pulse {
          animation: qrDotInnerPulse 1.6s ease-in-out infinite;
        }
        .qr-amber-dot-glow {
          animation: qrAmberDotGlow 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .qr-mini-canvas canvas,
        .qr-mini-canvas svg {
          width: 44px !important;
          height: 44px !important;
          max-width: 44px !important;
          max-height: 44px !important;
          display: block !important;
          border-radius: 4px;
        }
      ` }} />
    </div>
  );
}

