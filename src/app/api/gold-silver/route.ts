import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface GoldSilverData {
  fineGoldPerTola: number;
  tejabiGoldPerTola: number;
  silverPerTola: number;
  date: string;
  isLive: boolean;
  fetchedAt: number;
}

const FALLBACK_RATES: GoldSilverData = {
  fineGoldPerTola: 283200,
  tejabiGoldPerTola: 282500,
  silverPerTola: 4320,
  date: new Date().toISOString().split("T")[0],
  isLive: false,
  fetchedAt: Date.now(),
};

let cachedData: GoldSilverData | null = null;
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export async function GET() {
  const now = Date.now();

  if (cachedData && now - cachedData.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cachedData, {
      headers: {
        "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=86400",
      },
    });
  }

  // Try fetching live rates from ShareSansar bullion page (FENEGOSIDA feed)
  try {
    const res = await fetch("https://www.sharesansar.com/bullion", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const html = await res.text();
      const matchSnippet = html.match(/Fine\s*Gold[\s\S]*?Silver[\s\S]*?\/tola/i);

      if (matchSnippet) {
        const snippet = matchSnippet[0];
        const fineMatch = snippet.match(/Fine\s*Gold[\s\S]*?Rs\.?\s*([\d,]+)/i);
        const tejabiMatch = snippet.match(/Tejabi\s*Gold[\s\S]*?Rs\.?\s*([\d,]+)/i);
        const silverMatch = snippet.match(/Silver[\s\S]*?Rs\.?\s*([\d,]+)/i);

        const fineGold = fineMatch ? parseInt(fineMatch[1].replace(/,/g, ""), 10) : 0;
        const tejabiGold = tejabiMatch ? parseInt(tejabiMatch[1].replace(/,/g, ""), 10) : 0;
        const silver = silverMatch ? parseInt(silverMatch[1].replace(/,/g, ""), 10) : 0;

        if (fineGold > 0 && silver > 0) {
          const todayStr = new Date().toISOString().split("T")[0];
          cachedData = {
            fineGoldPerTola: fineGold,
            tejabiGoldPerTola: tejabiGold > 0 ? tejabiGold : Math.max(fineGold - 700, 1000),
            silverPerTola: silver,
            date: todayStr,
            isLive: true,
            fetchedAt: now,
          };

          return NextResponse.json(cachedData, {
            headers: {
              "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=86400",
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch live Gold/Silver rates:", error);
  }

  // Fallback if live scrape is unreachable
  const todayStr = new Date().toISOString().split("T")[0];
  const responseData: GoldSilverData = {
    ...FALLBACK_RATES,
    date: todayStr,
    fetchedAt: now,
  };

  return NextResponse.json(responseData);
}
