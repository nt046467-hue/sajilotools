import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

// In-memory fallback cache for local dev / unconfigured KV envs
const inMemoryCache = new Map<string, { value: string; expiry: number }>();
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_MEMORY_CACHE_ENTRIES = 5000;

// Helper: Try Google Translate GTX endpoint
async function fetchGoogleTranslate(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translatedParts = data[0]
        .filter((item: any) => Array.isArray(item) && typeof item[0] === "string")
        .map((item: any) => item[0]);
      if (translatedParts.length > 0) {
        return translatedParts.join("");
      }
    }
    return null;
  } catch (err) {
    console.warn("Google Translate GTX fallback error:", err);
    return null;
  }
}

// Helper: Try MyMemory API
async function fetchMyMemoryTranslate(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SajiloTools/1.0 (Nepali Translation Service)",
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data?.responseStatus === 429 || data?.responseStatus === 403) return null;

    let resultText: string | undefined = data?.responseData?.translatedText;
    if (resultText && resultText.includes("MYMEMORY WARNING")) {
      resultText = resultText.replace(/MYMEMORY WARNING:.*$/, "").trim();
    }
    return resultText && resultText.length > 0 ? resultText : null;
  } catch (err) {
    console.warn("MyMemory fallback error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !sourceLang || !targetLang || typeof text !== "string") {
      return NextResponse.json({ error: "Missing required parameters (text, sourceLang, targetLang)." }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: "Text exceeds maximum supported length of 5,000 characters." }, { status: 400 });
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

    // 2. Multi-tier Translation Engine
    // Tier 1: Google Translate GTX (Fast & highly accurate for English <-> Nepali)
    let resultText = await fetchGoogleTranslate(trimmed, sourceLang, targetLang);

    // Tier 2: MyMemory API Fallback
    if (!resultText) {
      resultText = await fetchMyMemoryTranslate(trimmed, sourceLang, targetLang);
    }

    if (!resultText) {
      return NextResponse.json({ error: "Translation service temporarily unavailable. Please try again in a moment." }, { status: 502 });
    }

    // 3. Save to Vercel KV / in-memory cache
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await kv.set(cacheKey, resultText, { ex: CACHE_TTL_SECONDS });
      } else {
        if (inMemoryCache.size >= MAX_MEMORY_CACHE_ENTRIES) {
          const oldestKey = inMemoryCache.keys().next().value;
          if (oldestKey) inMemoryCache.delete(oldestKey);
        }
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
    // Log only the error type/code — avoid leaking user translation text in server logs
    console.error("API /api/translate error:", error?.name || "UnknownError", error?.code || "");
    return NextResponse.json(
      { error: "Internal server translation error." },
      { status: 500 }
    );
  }
}

