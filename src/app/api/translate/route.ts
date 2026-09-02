import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { checkToolUsage, recordToolUsage } from "@/lib/usage-limit";

export const dynamic = "force-dynamic";

// In-memory fallback cache for local dev / unconfigured KV envs
const inMemoryCache = new Map<string, { value: string; expiry: number }>();
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_MEMORY_CACHE_ENTRIES = 5000;

export type TranslationTone = "standard" | "formal" | "casual" | "romanized";

/**
 * ── Tier 1: Gemini 1.5 Flash (Flagship AI Native) ──
 */
async function fetchGeminiTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
  tone: TranslationTone = "standard"
): Promise<{ text: string; engine: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const isEnToNp = sourceLang === "en" || sourceLang === "en-US";
    const srcName = isEnToNp ? "English" : "Nepali";
    const tgtName = isEnToNp ? "Nepali" : "English";

    let toneGuidance = "Provide a natural, grammatically correct and contextually accurate translation.";
    if (tone === "formal") {
      toneGuidance = isEnToNp
        ? "Use polite, respectful, and honorific Nepali (उच्च आदरार्थी: तपाईं/हजुर, गर्नुभयो, भन्नुभयो, हुनुहुन्छ)."
        : "Use polished, formal and professional English vocabulary.";
    } else if (tone === "casual") {
      toneGuidance = isEnToNp
        ? "Use friendly, colloquial, everyday conversational Nepali (सामान्य आदर: तिमी/तपाईं, गर्यौ, भन्यौ, छौ)."
        : "Use casual, natural conversational English with everyday idioms.";
    } else if (tone === "romanized") {
      toneGuidance = "Output the translation exclusively in Romanized Nepali (Nepglish phonetic Latin letters, e.g. 'Tapailai kasto cha? Sanchai hunuhunchha?'). Do NOT use Devanagari script.";
    }

    const systemPrompt = `You are an expert bilingual linguist specialized in ${srcName} to ${tgtName} translation.
${toneGuidance}
Translate the text faithfully while preserving idiomatic nuance and meaning.
Return ONLY the final translation text. Do not include quotes, explanations, prefixes, or markdown wrappers.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nText to translate:\n${text}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return result ? { text: result, engine: "Gemini 1.5 Flash (AI Native)" } : null;
  } catch (err: any) {
    console.warn("Gemini translate error:", err?.name || "RequestFailed");
    return null;
  }
}

/**
 * ── Tier 2: Groq LLM API Fallback ──
 */
async function fetchGroqTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
  tone: TranslationTone = "standard"
): Promise<{ text: string; engine: string } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const isEnToNp = sourceLang === "en" || sourceLang === "en-US";
    const srcName = isEnToNp ? "English" : "Nepali";
    const tgtName = isEnToNp ? "Nepali" : "English";

    let toneInstruction = "Translate accurately and naturally.";
    if (tone === "formal") toneInstruction = "Translate in formal and polite honorific tone.";
    if (tone === "casual") toneInstruction = "Translate in friendly casual conversational tone.";
    if (tone === "romanized") toneInstruction = "Translate into Romanized Nepali script (Nepglish Latin alphabet).";

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a professional ${srcName} to ${tgtName} translator. ${toneInstruction} Output ONLY the raw translation text with no preamble.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.choices?.[0]?.message?.content?.trim();

    return result ? { text: result, engine: "Groq LLaMA-3.3 (AI Fallback)" } : null;
  } catch (err: any) {
    console.warn("Groq translate error:", err?.name || "RequestFailed");
    return null;
  }
}

/**
 * ── Tier 3: Google Translate GTX Endpoint Fallback ──
 */
async function fetchGoogleTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ text: string; engine: string } | null> {
  try {
    const sl = sourceLang === "en" || sourceLang === "en-US" ? "en" : "ne";
    const tl = targetLang === "en" || targetLang === "en-US" ? "en" : "ne";
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

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
        return { text: translatedParts.join(""), engine: "Google GTX Engine" };
      }
    }
    return null;
  } catch (err: any) {
    console.warn("Google Translate GTX error:", err?.name || "RequestFailed");
    return null;
  }
}

/**
 * ── Tier 4: MyMemory API Fallback ──
 */
async function fetchMyMemoryTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ text: string; engine: string } | null> {
  try {
    const sl = sourceLang === "en" || sourceLang === "en-US" ? "en" : "ne";
    const tl = targetLang === "en" || targetLang === "en-US" ? "en" : "ne";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`;

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
    return resultText && resultText.length > 0 ? { text: resultText, engine: "MyMemory API" } : null;
  } catch (err: any) {
    console.warn("MyMemory fallback error:", err?.name || "RequestFailed");
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang, tone = "standard" } = await req.json();

    if (!text || !sourceLang || !targetLang || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing required parameters (text, sourceLang, targetLang)." },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text exceeds maximum supported length of 5,000 characters." },
        { status: 400 }
      );
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json({ translatedText: "", cached: false, engine: "None" });
    }

    // ── 1. Usage Limiting & Pro Subscription Verification ──
    // PRO_PASS_HIDDEN: When ENABLE_PRO_PASS=false, checkToolUsage returns allowed:true for everyone
    const usage = await checkToolUsage(req, "nepali-translator");
    if (!usage.allowed && !usage.isPro) {
      return NextResponse.json(
        {
          error: "Daily free AI translation limit reached (25/25). Upgrade to Pro for unlimited AI translations.",
          limitReached: true,
          remainingCredits: 0,
          maxCredits: usage.maxCredits,
        },
        { status: 429 }
      );
    }

    const cacheKey = `translate:${sourceLang}:${targetLang}:${tone}:${trimmed.toLowerCase()}`;

    // ── 2. Read from Cache ──
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const cachedKV = await kv.get<string>(cacheKey);
        if (cachedKV) {
          return NextResponse.json({
            translatedText: cachedKV,
            cached: true,
            engine: "Sajilo Neural Cache",
            remainingCredits: usage.remainingCredits,
            isPro: usage.isPro,
          });
        }
      } else {
        const memoryEntry = inMemoryCache.get(cacheKey);
        if (memoryEntry && memoryEntry.expiry > Date.now()) {
          return NextResponse.json({
            translatedText: memoryEntry.value,
            cached: true,
            engine: "Sajilo Neural Cache",
            remainingCredits: usage.remainingCredits,
            isPro: usage.isPro,
          });
        }
      }
    } catch (cacheErr: any) {
      console.warn("Translation cache read warning:", cacheErr?.name || "CacheReadFailed");
    }

    // ── 3. Multi-tier Translation Pipeline ──
    // Tier 1: Gemini 1.5 Flash (AI Native)
    let outcome = await fetchGeminiTranslate(trimmed, sourceLang, targetLang, tone);

    // Tier 2: Groq LLaMA-3.3 AI Fallback
    if (!outcome) {
      outcome = await fetchGroqTranslate(trimmed, sourceLang, targetLang, tone);
    }

    // Tier 3: Google Translate GTX Web Fallback
    if (!outcome) {
      outcome = await fetchGoogleTranslate(trimmed, sourceLang, targetLang);
    }

    // Tier 4: MyMemory API Fallback
    if (!outcome) {
      outcome = await fetchMyMemoryTranslate(trimmed, sourceLang, targetLang);
    }

    if (!outcome || !outcome.text) {
      return NextResponse.json(
        { error: "Translation service temporarily unavailable. Please try again in a moment." },
        { status: 502 }
      );
    }

    // ── 4. Record Usage in Database ──
    await recordToolUsage(usage.userId, usage.sessionId, "nepali-translator");

    // ── 5. Cache Result ──
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await kv.set(cacheKey, outcome.text, { ex: CACHE_TTL_SECONDS });
      } else {
        if (inMemoryCache.size >= MAX_MEMORY_CACHE_ENTRIES) {
          const oldestKey = inMemoryCache.keys().next().value;
          if (oldestKey) inMemoryCache.delete(oldestKey);
        }
        inMemoryCache.set(cacheKey, {
          value: outcome.text,
          expiry: Date.now() + CACHE_TTL_SECONDS * 1000,
        });
      }
    } catch (cacheSetErr: any) {
      console.warn("Translation cache write warning:", cacheSetErr?.name || "CacheWriteFailed");
    }

    return NextResponse.json({
      translatedText: outcome.text,
      engine: outcome.engine,
      cached: false,
      remainingCredits: Math.max(0, usage.remainingCredits - 1),
      isPro: usage.isPro,
    });
  } catch (error: any) {
    console.error("API /api/translate error:", error?.name || "UnknownError", error?.code || "");
    return NextResponse.json(
      { error: "Internal server translation error." },
      { status: 500 }
    );
  }
}
