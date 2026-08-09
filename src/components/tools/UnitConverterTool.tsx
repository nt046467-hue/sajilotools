"use client";

import { useState, useMemo } from "react";
import { ArrowLeftRight, Copy, Check, RotateCcw, Info } from "lucide-react";

type UnitCategory = "length" | "weight" | "temperature" | "volume" | "area" | "speed" | "time" | "data";

interface UnitDef {
  id: string;
  name: string;
  factorToBase: number; // Multiplier to base unit (or for temperature, special logic)
}

interface CategoryConfig {
  name: string;
  baseUnit: string;
  units: UnitDef[];
  commonConversions: { from: string; to: string; formula: string }[];
}

const UNIT_CONFIGS: Record<UnitCategory, CategoryConfig> = {
  length: {
    name: "Length",
    baseUnit: "m",
    units: [
      { id: "mm", name: "Millimeter (mm)", factorToBase: 0.001 },
      { id: "cm", name: "Centimeter (cm)", factorToBase: 0.01 },
      { id: "m", name: "Meter (m)", factorToBase: 1 },
      { id: "km", name: "Kilometer (km)", factorToBase: 1000 },
      { id: "in", name: "Inch (in)", factorToBase: 0.0254 },
      { id: "ft", name: "Foot (ft)", factorToBase: 0.3048 },
      { id: "yd", name: "Yard (yd)", factorToBase: 0.9144 },
      { id: "mi", name: "Mile (mi)", factorToBase: 1609.344 },
    ],
    commonConversions: [
      { from: "1 Meter (m)", to: "100 Centimeters (cm)", formula: "1 m = 100 cm" },
      { from: "1 Kilometer (km)", to: "0.6214 Miles (mi)", formula: "1 km = 0.6214 mi" },
      { from: "1 Inch (in)", to: "2.54 Centimeters (cm)", formula: "1 in = 2.54 cm" },
      { from: "1 Foot (ft)", to: "30.48 Centimeters (cm)", formula: "1 ft = 30.48 cm" },
    ],
  },
  weight: {
    name: "Weight / Mass",
    baseUnit: "kg",
    units: [
      { id: "mg", name: "Milligram (mg)", factorToBase: 0.000001 },
      { id: "g", name: "Gram (g)", factorToBase: 0.001 },
      { id: "kg", name: "Kilogram (kg)", factorToBase: 1 },
      { id: "tonne", name: "Metric Tonne (t)", factorToBase: 1000 },
      { id: "oz", name: "Ounce (oz)", factorToBase: 0.028349523125 },
      { id: "lb", name: "Pound (lb)", factorToBase: 0.45359237 },
    ],
    commonConversions: [
      { from: "1 Kilogram (kg)", to: "2.2046 Pounds (lb)", formula: "1 kg = 2.2046 lb" },
      { from: "1 Pound (lb)", to: "453.59 Grams (g)", formula: "1 lb = 453.59 g" },
      { from: "1 Metric Tonne (t)", to: "1000 Kilograms (kg)", formula: "1 t = 1000 kg" },
    ],
  },
  temperature: {
    name: "Temperature",
    baseUnit: "c",
    units: [
      { id: "c", name: "Celsius (°C)", factorToBase: 1 },
      { id: "f", name: "Fahrenheit (°F)", factorToBase: 1 },
      { id: "k", name: "Kelvin (K)", factorToBase: 1 },
    ],
    commonConversions: [
      { from: "0 °C (Freezing)", to: "32 °F / 273.15 K", formula: "°F = (°C × 9/5) + 32" },
      { from: "100 °C (Boiling)", to: "212 °F / 373.15 K", formula: "°C = (°F - 32) × 5/9" },
      { from: "37 °C (Body Temp)", to: "98.6 °F", formula: "K = °C + 273.15" },
    ],
  },
  volume: {
    name: "Volume",
    baseUnit: "l",
    units: [
      { id: "ml", name: "Milliliter (ml)", factorToBase: 0.001 },
      { id: "l", name: "Liter (L)", factorToBase: 1 },
      { id: "tsp", name: "Teaspoon (tsp)", factorToBase: 0.00492892 },
      { id: "tbsp", name: "Tablespoon (tbsp)", factorToBase: 0.0147868 },
      { id: "cup", name: "Cup (US)", factorToBase: 0.236588 },
      { id: "floz", name: "Fluid Ounce (US fl oz)", factorToBase: 0.0295735 },
      { id: "gal_us", name: "Gallon (US gal)", factorToBase: 3.78541 },
      { id: "gal_uk", name: "Gallon (UK gal)", factorToBase: 4.54609 },
    ],
    commonConversions: [
      { from: "1 Liter (L)", to: "1000 Milliliters (ml)", formula: "1 L = 1000 ml" },
      { from: "1 US Gallon", to: "3.785 Liters (L)", formula: "1 US gal = 3.785 L" },
      { from: "1 US Cup", to: "236.59 Milliliters (ml)", formula: "1 cup = 236.59 ml" },
    ],
  },
  area: {
    name: "Area",
    baseUnit: "sq_m",
    units: [
      { id: "sq_m", name: "Square Meter (m²)", factorToBase: 1 },
      { id: "sq_km", name: "Square Kilometer (km²)", factorToBase: 1000000 },
      { id: "hectare", name: "Hectare (ha)", factorToBase: 10000 },
      { id: "acre", name: "Acre (ac)", factorToBase: 4046.8564224 },
      { id: "sq_ft", name: "Square Foot (ft²)", factorToBase: 0.09290304 },
      { id: "sq_yd", name: "Square Yard (yd²)", factorToBase: 0.83612736 },
    ],
    commonConversions: [
      { from: "1 Hectare (ha)", to: "10,000 m² / 2.471 Acres", formula: "1 ha = 10,000 m²" },
      { from: "1 Acre (ac)", to: "43,560 ft² / 4046.86 m²", formula: "1 ac = 4046.86 m²" },
      { from: "1 Square Kilometer", to: "100 Hectares (ha)", formula: "1 km² = 100 ha" },
    ],
  },
  speed: {
    name: "Speed",
    baseUnit: "mps",
    units: [
      { id: "mps", name: "Meters per second (m/s)", factorToBase: 1 },
      { id: "kph", name: "Kilometers per hour (km/h)", factorToBase: 0.277777778 },
      { id: "mph", name: "Miles per hour (mph)", factorToBase: 0.44704 },
      { id: "knot", name: "Knot (kn)", factorToBase: 0.514444444 },
    ],
    commonConversions: [
      { from: "100 km/h", to: "62.137 mph", formula: "1 km/h = 0.62137 mph" },
      { from: "1 m/s", to: "3.6 km/h", formula: "1 m/s = 3.6 km/h" },
      { from: "1 Knot", to: "1.852 km/h", formula: "1 kn = 1.852 km/h" },
    ],
  },
  time: {
    name: "Time",
    baseUnit: "sec",
    units: [
      { id: "sec", name: "Second (s)", factorToBase: 1 },
      { id: "min", name: "Minute (min)", factorToBase: 60 },
      { id: "hr", name: "Hour (hr)", factorToBase: 3600 },
      { id: "day", name: "Day (d)", factorToBase: 86400 },
      { id: "wk", name: "Week (wk)", factorToBase: 604800 },
      { id: "mo", name: "Month (avg 30.437d)", factorToBase: 2629800 },
      { id: "yr", name: "Year (365d)", factorToBase: 31536000 },
    ],
    commonConversions: [
      { from: "1 Hour", to: "60 Minutes / 3,600 Seconds", formula: "1 hr = 3600 s" },
      { from: "1 Day", to: "24 Hours / 1,440 Minutes", formula: "1 d = 86,400 s" },
      { from: "1 Year", to: "52.14 Weeks / 365 Days", formula: "1 yr = 365 d" },
    ],
  },
  data: {
    name: "Data Storage (Binary 1024)",
    baseUnit: "b",
    units: [
      { id: "bit", name: "Bit (b)", factorToBase: 1 },
      { id: "b", name: "Byte (B)", factorToBase: 8 },
      { id: "kb", name: "Kilobyte (KB)", factorToBase: 8192 }, // 8 * 1024
      { id: "mb", name: "Megabyte (MB)", factorToBase: 8388608 }, // 8 * 1024^2
      { id: "gb", name: "Gigabyte (GB)", factorToBase: 8589934592 }, // 8 * 1024^3
      { id: "tb", name: "Terabyte (TB)", factorToBase: 8796093022208 }, // 8 * 1024^4
    ],
    commonConversions: [
      { from: "1 Byte (B)", to: "8 Bits (b)", formula: "1 B = 8 bits" },
      { from: "1 Kilobyte (KB)", to: "1,024 Bytes (B)", formula: "1 KB = 1024 B" },
      { from: "1 Megabyte (MB)", to: "1,024 Kilobytes (KB)", formula: "1 MB = 1024 KB" },
      { from: "1 Gigabyte (GB)", to: "1,024 Megabytes (MB)", formula: "1 GB = 1024 MB" },
    ],
  },
};

// Temperature conversion helpers
function convertTemperature(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value;

  // Convert fromUnit to Celsius first
  let celsius: number;
  if (fromUnit === "c") celsius = value;
  else if (fromUnit === "f") celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15; // kelvin

  // Convert Celsius to toUnit
  if (toUnit === "c") return celsius;
  if (toUnit === "f") return celsius * (9 / 5) + 32;
  return celsius + 273.15; // kelvin
}

export default function UnitConverterTool() {
  const [activeCategory, setActiveCategory] = useState<UnitCategory>("length");
  const [unitA, setUnitA] = useState<string>("km");
  const [unitB, setUnitB] = useState<string>("mi");
  const [valA, setValA] = useState<string>("1");
  const [lastEdited, setLastEdited] = useState<"A" | "B">("A");
  const [highPrecision, setHighPrecision] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const config = UNIT_CONFIGS[activeCategory];

  // Helper to format result cleanly
  const formatVal = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) return "";
    if (num === 0) return "0";
    const precision = highPrecision ? 8 : 4;
    // Format precision dynamically without trailing zeros
    const rounded = Number(num.toFixed(precision));
    return rounded.toString();
  };

  // Convert valA -> valB or valB -> valA
  const calculatedValB = useMemo(() => {
    if (lastEdited === "B") return valA; // Controlled by valB input handler
    const num = parseFloat(valA);
    if (isNaN(num)) return "";

    if (activeCategory === "temperature") {
      return formatVal(convertTemperature(num, unitA, unitB));
    }

    const unitDefA = config.units.find((u) => u.id === unitA);
    const unitDefB = config.units.find((u) => u.id === unitB);
    if (!unitDefA || !unitDefB) return "";

    const baseVal = num * unitDefA.factorToBase;
    const result = baseVal / unitDefB.factorToBase;
    return formatVal(result);
  }, [valA, unitA, unitB, activeCategory, config, lastEdited, highPrecision]);

  const calculatedValA = useMemo(() => {
    if (lastEdited === "A") return valA;
    const num = parseFloat(valA); // valA holds the last B input string when edited B
    if (isNaN(num)) return "";

    if (activeCategory === "temperature") {
      return formatVal(convertTemperature(num, unitB, unitA));
    }

    const unitDefA = config.units.find((u) => u.id === unitA);
    const unitDefB = config.units.find((u) => u.id === unitB);
    if (!unitDefA || !unitDefB) return "";

    const baseVal = num * unitDefB.factorToBase;
    const result = baseVal / unitDefA.factorToBase;
    return formatVal(result);
  }, [valA, unitA, unitB, activeCategory, config, lastEdited, highPrecision]);

  const displayA = lastEdited === "A" ? valA : calculatedValA;
  const displayB = lastEdited === "B" ? valA : calculatedValB;

  const handleCategoryChange = (cat: UnitCategory) => {
    setActiveCategory(cat);
    const newConfig = UNIT_CONFIGS[cat];
    setUnitA(newConfig.units[0].id);
    setUnitB(newConfig.units[1]?.id || newConfig.units[0].id);
    setValA("1");
    setLastEdited("A");
  };

  const handleSwap = () => {
    setUnitA(unitB);
    setUnitB(unitA);
  };

  const handleCopy = () => {
    const unitObjA = config.units.find((u) => u.id === unitA);
    const unitObjB = config.units.find((u) => u.id === unitB);
    const text = `${displayA} ${unitObjA?.name || unitA} = ${displayB} ${unitObjB?.name || unitB}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const categoriesList: { id: UnitCategory; label: string }[] = [
    { id: "length", label: "Length" },
    { id: "weight", label: "Weight / Mass" },
    { id: "temperature", label: "Temperature" },
    { id: "volume", label: "Volume" },
    { id: "area", label: "Area" },
    { id: "speed", label: "Speed" },
    { id: "time", label: "Time" },
    { id: "data", label: "Data Storage" },
  ];

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#E4E0D8] dark:border-[#1E2338]">
        {categoriesList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-[#0D9488] text-white shadow-md"
                : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Converter Card */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
            {config.name} Converter
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-[#71717A] dark:text-[#A1A1AA] cursor-pointer">
              <input
                type="checkbox"
                checked={highPrecision}
                onChange={(e) => setHighPrecision(e.target.checked)}
                className="rounded border-[#E4E0D8] text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span>High Precision (8 decimals)</span>
            </label>
            <button
              onClick={() => {
                setValA("1");
                setLastEdited("A");
              }}
              className="p-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Converter Fields */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Unit A */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#71717A]">
              From Unit
            </label>
            <select
              value={unitA}
              onChange={(e) => setUnitA(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs"
            >
              {config.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={displayA}
              onChange={(e) => {
                setValA(e.target.value);
                setLastEdited("A");
              }}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] font-bold text-lg focus:outline-none focus:border-[#0D9488]"
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:pt-6">
            <button
              onClick={handleSwap}
              className="p-3 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#0D9488] hover:scale-105 transition-transform"
              title="Swap Units"
            >
              <ArrowLeftRight size={18} />
            </button>
          </div>

          {/* Unit B */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#71717A]">
              To Unit
            </label>
            <select
              value={unitB}
              onChange={(e) => setUnitB(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs"
            >
              {config.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={displayB}
              onChange={(e) => {
                setValA(e.target.value);
                setLastEdited("B");
              }}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] font-bold text-lg focus:outline-none focus:border-[#0D9488]"
            />
          </div>
        </div>

        {/* Copy Result Banner */}
        <div className="p-4 rounded-xl bg-[#F0FDFA] dark:bg-[#042F2E]/60 border border-[#0D9488]/20 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs">
            <span className="text-[#71717A] dark:text-[#A1A1AA]">Conversion Result: </span>
            <span className="font-extrabold text-[#0D9488] text-base">
              {displayA || "0"} {unitA} = {displayB || "0"} {unitB}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D9488] text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy Result"}
          </button>
        </div>
      </div>

      {/* Quick Reference Table */}
      <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-4">
        <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
          <Info size={14} className="text-[#0D9488]" /> Common {config.name} Conversions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {config.commonConversions.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs flex justify-between items-center"
            >
              <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">{item.from}</span>
              <span className="text-[#0D9488] font-semibold">{item.to}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cross link to Nepali Traditional Unit Converter */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-4">
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <strong>🇳🇵 Looking for Traditional Nepali Units?</strong> Convert Dharni (धार्नी), Pau (पाउ), Tola (तोला), Muri (मुरी), Pathi (पाथी), and Mana (माना).
        </div>
        <a
          href="/tools/nepal/traditional-unit-converter"
          className="px-3 py-1.5 rounded-xl bg-[#F5A623] text-[#0C0F1E] text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
        >
          Nepali Units →
        </a>
      </div>
    </div>
  );
}
