import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface RateInfo {
  name: string;
  symbol: string;
  buy: number; // Normalized rate per 1 unit of foreign currency
  sell: number; // Normalized rate per 1 unit of foreign currency
  unit: number; // Official NRB quotation unit (e.g. 100 for INR, 10 for JPY)
  rawBuy: number; // NRB quoted buy price for official unit
  rawSell: number; // NRB quoted sell price for official unit
}

// Baseline rates if external APIs are completely unreachable
const FALLBACK_RATES: Record<string, RateInfo> = {
  USD: { name: "US Dollar", symbol: "$", buy: 138.28, sell: 138.88, unit: 1, rawBuy: 138.28, rawSell: 138.88 },
  EUR: { name: "Euro", symbol: "€", buy: 143.48, sell: 144.10, unit: 1, rawBuy: 143.48, rawSell: 144.10 },
  GBP: { name: "British Pound", symbol: "£", buy: 173.50, sell: 174.25, unit: 1, rawBuy: 173.50, rawSell: 174.25 },
  INR: { name: "Indian Rupee", symbol: "₹", buy: 1.60, sell: 1.6015, unit: 100, rawBuy: 160.00, rawSell: 160.15 },
  AUD: { name: "Australian Dollar", symbol: "A$", buy: 88.50, sell: 89.05, unit: 1, rawBuy: 88.50, rawSell: 89.05 },
  CAD: { name: "Canadian Dollar", symbol: "C$", buy: 98.40, sell: 99.00, unit: 1, rawBuy: 98.40, rawSell: 99.00 },
  AED: { name: "UAE Dirham", symbol: "AED", buy: 37.65, sell: 37.81, unit: 1, rawBuy: 37.65, rawSell: 37.81 },
  QAR: { name: "Qatari Riyal", symbol: "QAR", buy: 37.95, sell: 38.11, unit: 1, rawBuy: 37.95, rawSell: 38.11 },
  SAR: { name: "Saudi Riyal", symbol: "SAR", buy: 36.86, sell: 37.02, unit: 1, rawBuy: 36.86, rawSell: 37.02 },
  MYR: { name: "Malaysian Ringgit", symbol: "RM", buy: 31.15, sell: 31.30, unit: 1, rawBuy: 31.15, rawSell: 31.30 },
  JPY: { name: "Japanese Yen", symbol: "¥", buy: 0.952, sell: 0.956, unit: 10, rawBuy: 9.52, rawSell: 9.56 },
  KRW: { name: "South Korean Won", symbol: "₩", buy: 0.106, sell: 0.1064, unit: 100, rawBuy: 10.60, rawSell: 10.64 },
  CNY: { name: "Chinese Yuan", symbol: "¥", buy: 19.10, sell: 19.18, unit: 1, rawBuy: 19.10, rawSell: 19.18 },
  SGD: { name: "Singapore Dollar", symbol: "S$", buy: 103.20, sell: 103.65, unit: 1, rawBuy: 103.20, rawSell: 103.65 },
  CHF: { name: "Swiss Franc", symbol: "CHF", buy: 154.20, sell: 154.80, unit: 1, rawBuy: 154.20, rawSell: 154.80 },
  HKD: { name: "Hong Kong Dollar", symbol: "HK$", buy: 17.70, sell: 17.78, unit: 1, rawBuy: 17.70, rawSell: 17.78 },
  KWD: { name: "Kuwaiti Dinar", symbol: "KWD", buy: 450.10, sell: 452.05, unit: 1, rawBuy: 450.10, rawSell: 452.05 },
  BHD: { name: "Bahraini Dinar", symbol: "BHD", buy: 366.50, sell: 368.10, unit: 1, rawBuy: 366.50, rawSell: 368.10 },
  OMR: { name: "Omani Rial", symbol: "OMR", buy: 359.10, sell: 360.65, unit: 1, rawBuy: 359.10, rawSell: 360.65 },
  THB: { name: "Thai Baht", symbol: "฿", buy: 4.10, sell: 4.12, unit: 1, rawBuy: 4.10, rawSell: 4.12 },
};

let cachedData: {
  rates: Record<string, RateInfo>;
  date: string;
  publishedOn?: string;
  isOfficialNRB: boolean;
  fetchedAt: number;
} | null = null;

const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes cache

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isForce = searchParams.get("force") === "true";
  const now = Date.now();

  if (!isForce && cachedData && now - cachedData.fetchedAt < CACHE_DURATION_MS) {
    return NextResponse.json(cachedData, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400",
      },
    });
  }

  // 1. Fetch official rates from Nepal Rastra Bank API with a 7-day range (covers weekends/holidays)
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fromStr = sevenDaysAgo.toISOString().split("T")[0];

    const nrbUrl = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=30&from=${fromStr}&to=${todayStr}`;

    const res = await fetch(nrbUrl, {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SajiloTools/1.0",
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const payloadArr = data?.data?.payload;

      // Extract the most recent payload (payload array is sorted with newest date first)
      const payloadObj = Array.isArray(payloadArr) && payloadArr.length > 0 ? payloadArr[0] : null;
      const ratesList = payloadObj?.rates || [];

      if (Array.isArray(ratesList) && ratesList.length > 0) {
        const ratesMap: Record<string, RateInfo> = {};

        for (const item of ratesList) {
          const code = item.currency?.iso3 || item.iso3;
          if (!code) continue;

          const unit = Number(item.currency?.unit || item.unit || 1);
          const rawBuy = Number(item.buy || 0);
          const rawSell = Number(item.sell || 0);

          const buyRate = rawBuy / unit;
          const sellRate = rawSell / unit;
          const name = item.currency?.name || item.name || code;

          ratesMap[code] = {
            name,
            symbol: getSymbolForCurrency(code),
            buy: Math.round(buyRate * 100000) / 100000,
            sell: Math.round(sellRate * 100000) / 100000,
            unit,
            rawBuy,
            rawSell,
          };
        }

        const dateStr = payloadObj?.date || todayStr;
        const publishedOn = payloadObj?.published_on || undefined;

        cachedData = {
          rates: { ...FALLBACK_RATES, ...ratesMap },
          date: dateStr,
          publishedOn,
          isOfficialNRB: true,
          fetchedAt: now,
        };

        return NextResponse.json(cachedData, {
          headers: {
            "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch NRB Forex API:", error);
  }

  // 2. OpenExchange rates fallback if NRB official API is unreachable
  try {
    const erRes = await fetch("https://open.er-api.com/v6/latest/USD", {
      headers: { Accept: "application/json" },
    });

    if (erRes.ok) {
      const erData = await erRes.json();
      const nprUsd = erData.rates?.NPR || 138.5;

      const liveRates: Record<string, RateInfo> = {};
      Object.keys(FALLBACK_RATES).forEach((code) => {
        const baseInfo = FALLBACK_RATES[code];
        if (code === "INR") {
          liveRates[code] = baseInfo;
          return;
        }
        const usdToCurr = erData.rates?.[code];
        if (usdToCurr) {
          const midRate = nprUsd / usdToCurr;
          const buyRate = Math.round(midRate * 0.998 * 1000) / 1000;
          const sellRate = Math.round(midRate * 1.002 * 1000) / 1000;
          const unit = baseInfo?.unit || 1;
          liveRates[code] = {
            name: baseInfo?.name || code,
            symbol: getSymbolForCurrency(code),
            buy: buyRate,
            sell: sellRate,
            unit,
            rawBuy: Math.round(buyRate * unit * 100) / 100,
            rawSell: Math.round(sellRate * unit * 100) / 100,
          };
        }
      });

      const todayStr = new Date().toISOString().split("T")[0];
      cachedData = {
        rates: { ...FALLBACK_RATES, ...liveRates },
        date: todayStr,
        isOfficialNRB: false,
        fetchedAt: now,
      };

      return NextResponse.json(cachedData);
    }
  } catch (err) {
    console.error("ER-API Fallback failed:", err);
  }

  // 3. Offline fallback
  const todayStr = new Date().toISOString().split("T")[0];
  const fallbackResponse = {
    rates: FALLBACK_RATES,
    date: todayStr,
    isOfficialNRB: false,
    fetchedAt: now,
  };

  return NextResponse.json(fallbackResponse);
}

function getSymbolForCurrency(code: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    AUD: "A$",
    CAD: "C$",
    AED: "AED",
    QAR: "QAR",
    SAR: "SAR",
    MYR: "RM",
    JPY: "¥",
    KRW: "₩",
    CNY: "¥",
    SGD: "S$",
    CHF: "CHF",
    HKD: "HK$",
    KWD: "KWD",
    BHD: "BHD",
    OMR: "OMR",
    THB: "฿",
    SEK: "kr",
    DKK: "kr",
  };
  return symbols[code] || code;
}
