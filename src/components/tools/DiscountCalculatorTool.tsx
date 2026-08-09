"use client";

import { useState, useMemo } from "react";
import { Tag, Copy, Check, Info, Receipt } from "lucide-react";
import CalculatorCrossLink from "@/components/tools/shared/CalculatorCrossLink";

type Mode = "discount" | "original" | "markup";

export default function DiscountCalculatorTool() {
  const [mode, setMode] = useState<Mode>("discount");

  // Mode 1: Sale Price from Original Price + Discount %
  const [m1Original, setM1Original] = useState<string>("1000");
  const [m1DiscountPct, setM1DiscountPct] = useState<string>("20");

  // Mode 2: Original Price from Sale Price + Discount %
  const [m2SalePrice, setM2SalePrice] = useState<string>("800");
  const [m2DiscountPct, setM2DiscountPct] = useState<string>("20");

  // Mode 3: Markup % from Cost Price + Selling Price
  const [m3CostPrice, setM3CostPrice] = useState<string>("500");
  const [m3SellPrice, setM3SellPrice] = useState<string>("650");

  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const result1 = useMemo(() => {
    const orig = parseFloat(m1Original);
    const pct = parseFloat(m1DiscountPct);
    if (isNaN(orig) || isNaN(pct) || orig < 0) return null;
    const savings = (orig * pct) / 100;
    const finalPrice = orig - savings;
    return {
      originalPrice: orig,
      discountPct: pct,
      savingsAmount: savings,
      finalPrice,
    };
  }, [m1Original, m1DiscountPct]);

  const result2 = useMemo(() => {
    const sale = parseFloat(m2SalePrice);
    const pct = parseFloat(m2DiscountPct);
    if (isNaN(sale) || isNaN(pct) || sale < 0 || pct >= 100) return null;
    const original = sale / (1 - pct / 100);
    const savings = original - sale;
    return {
      salePrice: sale,
      discountPct: pct,
      originalPrice: original,
      savingsAmount: savings,
    };
  }, [m2SalePrice, m2DiscountPct]);

  const result3 = useMemo(() => {
    const cost = parseFloat(m3CostPrice);
    const sell = parseFloat(m3SellPrice);
    if (isNaN(cost) || isNaN(sell) || cost <= 0) return null;
    const profit = sell - cost;
    const markupPct = (profit / cost) * 100;
    const marginPct = (profit / sell) * 100;
    return {
      costPrice: cost,
      sellPrice: sell,
      profit,
      markupPct,
      marginPct,
    };
  }, [m3CostPrice, m3SellPrice]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
        <button
          onClick={() => setMode("discount")}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            mode === "discount"
              ? "bg-[#0D9488] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          Find Sale Price
        </button>
        <button
          onClick={() => setMode("original")}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            mode === "original"
              ? "bg-[#0D9488] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          Find Original Price
        </button>
        <button
          onClick={() => setMode("markup")}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            mode === "markup"
              ? "bg-[#0D9488] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          Find Markup / Margin %
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
          {mode === "discount" && (
            <>
              <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} className="text-[#0D9488]" /> Calculate Discounted Price
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    value={m1Original}
                    onChange={(e) => setM1Original(e.target.value)}
                    placeholder="1000"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Discount Percentage (% Off)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={m1DiscountPct}
                      onChange={(e) => setM1DiscountPct(e.target.value)}
                      placeholder="20"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#71717A]">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {mode === "original" && (
            <>
              <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} className="text-[#0D9488]" /> Find Original Price
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Final Sale Price
                  </label>
                  <input
                    type="number"
                    value={m2SalePrice}
                    onChange={(e) => setM2SalePrice(e.target.value)}
                    placeholder="800"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Discount Applied (% Off)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={m2DiscountPct}
                      onChange={(e) => setM2DiscountPct(e.target.value)}
                      placeholder="20"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#71717A]">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {mode === "markup" && (
            <>
              <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} className="text-[#0D9488]" /> Profit Markup &amp; Margin
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    value={m3CostPrice}
                    onChange={(e) => setM3CostPrice(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    value={m3SellPrice}
                    onChange={(e) => setM3SellPrice(e.target.value)}
                    placeholder="650"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Output Card */}
        <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl flex flex-col justify-between space-y-6">
          {mode === "discount" && (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                  Price Breakdown
                </span>
                {result1 && (
                  <button
                    onClick={() => handleCopy(`Final Price: ${result1.finalPrice.toFixed(2)} (Saved: ${result1.savingsAmount.toFixed(2)})`)}
                    className="flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:underline"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Result"}
                  </button>
                )}
              </div>

              {result1 ? (
                <div className="mt-3 space-y-4">
                  <div>
                    <span className="text-xs text-[#71717A] font-semibold">Final Sale Price</span>
                    <div className="text-3xl font-extrabold text-[#0D9488]">
                      {result1.finalPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E4E0D8] dark:border-[#2A2F48] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Original Price:</span>
                      <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">
                        {result1.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Total You Save ({result1.discountPct}%):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        -{result1.savingsAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#71717A] py-8 text-center">
                  Enter original price and discount percentage to view sale price.
                </div>
              )}
            </div>
          )}

          {mode === "original" && (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                  Original Price Result
                </span>
                {result2 && (
                  <button
                    onClick={() => handleCopy(`Original Price: ${result2.originalPrice.toFixed(2)} (Sale Price: ${result2.salePrice.toFixed(2)})`)}
                    className="flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:underline"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Result"}
                  </button>
                )}
              </div>

              {result2 ? (
                <div className="mt-3 space-y-4">
                  <div>
                    <span className="text-xs text-[#71717A] font-semibold">Pre-Discount Original Price</span>
                    <div className="text-3xl font-extrabold text-[#0D9488]">
                      {result2.originalPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E4E0D8] dark:border-[#2A2F48] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Sale Price Paid:</span>
                      <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">
                        {result2.salePrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Total Discount Amount ({result2.discountPct}%):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {result2.savingsAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#71717A] py-8 text-center">
                  Enter sale price and discount percentage.
                </div>
              )}
            </div>
          )}

          {mode === "markup" && (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                  Profit &amp; Markup Result
                </span>
                {result3 && (
                  <button
                    onClick={() => handleCopy(`Profit: ${result3.profit.toFixed(2)}, Markup: ${result3.markupPct.toFixed(2)}%, Margin: ${result3.marginPct.toFixed(2)}%`)}
                    className="flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:underline"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Result"}
                  </button>
                )}
              </div>

              {result3 ? (
                <div className="mt-3 space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-[#0D9488]">
                      {result3.markupPct.toFixed(2)}%
                    </span>
                    <span className="text-xs font-bold text-[#71717A]">
                      Markup on Cost
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E4E0D8] dark:border-[#2A2F48] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Total Profit Amount:</span>
                      <span className={`font-bold ${result3.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {result3.profit >= 0 ? `+${result3.profit.toFixed(2)}` : result3.profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Profit Margin (on Sales):</span>
                      <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">
                        {result3.marginPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#71717A] py-8 text-center">
                  Enter cost price and selling price.
                </div>
              )}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs text-[#71717A] flex items-start gap-2">
            <Info size={16} className="text-[#0D9488] shrink-0 mt-0.5" />
            <span>
              All pricing calculations run 100% locally in your browser with complete privacy.
            </span>
          </div>
        </div>
      </div>

      {/* Cross link to VAT Calculator */}
      <div className="pt-2">
        <CalculatorCrossLink
          icon={Receipt}
          title="13% VAT Calculator (Nepal)"
          desc="Need to calculate or remove 13% Value Added Tax (VAT) from prices?"
          href="/tools/finance/vat-calculator"
        />
      </div>
    </div>
  );
}
