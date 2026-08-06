import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

// In-memory fallback cache for local dev / unconfigured KV envs
const inMemoryCache = new Map<string, { value: string; expiry: number }>();
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ error: "Missing required parameters (text, sourceLang, targetLang)." }, { status: 400 });
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json({ translatedText: "", cached: false });
    }

    const cacheKey = `translate:${sourceLang}:${targetLang}:${trimmed.toLowerCase()}`;

    // 1. Try reading from Vercel KV or in-memory fallback
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const cachedKV = await kv.get<string>(cacheKey);
        if (cachedKV) {
          return NextResponse.json({ translatedText: cachedKV, cached: true });
        }
      } else {
        const memoryEntry = inMemoryCache.get(cacheKey);
        if (memoryEntry && memoryEntry.expiry > Date.now()) {
          return NextResponse.json({ translatedText: memoryEntry.value, cached: true });
        }
      }
    } catch (cacheErr) {
      console.warn("Translation cache read warning:", cacheErr);
    }

    // 2. Call MyMemory API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SajiloTools/1.0 (Nepali Translation Service)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Translation service network error." }, { status: 502 });
    }

    const data = await res.json();

    if (data?.responseStatus === 429 || data?.responseStatus === 403) {
      return NextResponse.json(
        { error: "Daily free translation usage limit reached. Please try again later." },
        { status: 429 }
      );
    }

    let resultText: string | undefined = data?.responseData?.translatedText;
    if (resultText && resultText.includes("MYMEMORY WARNING")) {
      resultText = resultText.replace(/MYMEMORY WARNING:.*$/, "").trim();
    }

    if (!resultText) {
      return NextResponse.json({ error: "Could not parse translation output." }, { status: 502 });
    }

    // 3. Save to Vercel KV / in-memory cache
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await kv.set(cacheKey, resultText, { ex: CACHE_TTL_SECONDS });
      } else {
        inMemoryCache.set(cacheKey, {
          value: resultText,
          expiry: Date.now() + CACHE_TTL_SECONDS * 1000,
        });
      }
    } catch (cacheSetErr) {
      console.warn("Translation cache write warning:", cacheSetErr);
    }

    return NextResponse.json({ translatedText: resultText, cached: false });
  } catch (error: any) {
    console.error("API /api/translate error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server translation error." },
      { status: 500 }
    );
  }
}
