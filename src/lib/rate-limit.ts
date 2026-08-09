import { NextRequest } from "next/server";

/**
 * Distributed rate limiting using @vercel/kv with fail-open fallback.
 *
 * Uses atomic INCR + EXPIRE for a fixed-window counter pattern.
 * If KV is unreachable or unconfigured, falls back to in-memory Map
 * and logs a warning — user traffic is never blocked by infra failures.
 */

// ── In-memory fallback (used when KV is unavailable) ─────────────────────
interface FallbackRecord {
  count: number;
  windowStart: number;
}
const fallbackCache = new Map<string, FallbackRecord>();

// Cleanup stale in-memory entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    fallbackCache.forEach((record, key) => {
      if (now - record.windowStart > 3600000) {
        fallbackCache.delete(key);
      }
    });
  }, 600000);
}

// ── KV integration ───────────────────────────────────────────────────────
let kvClient: any = null;
let kvInitAttempted = false;

async function getKvClient() {
  if (kvInitAttempted) return kvClient;
  kvInitAttempted = true;

  try {
    // Only attempt KV if the env vars are set (KV_REST_API_URL, KV_REST_API_TOKEN)
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn(
        "⚠️  Rate limiter: KV_REST_API_URL or KV_REST_API_TOKEN not set — using in-memory fallback."
      );
      return null;
    }
    const { kv } = await import("@vercel/kv");
    kvClient = kv;
    return kvClient;
  } catch (err) {
    console.warn("⚠️  Rate limiter: Failed to initialize @vercel/kv — using in-memory fallback.", err);
    return null;
  }
}

// ── Public helpers ───────────────────────────────────────────────────────

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

export async function checkRateLimit(
  req: NextRequest,
  actionKey: string,
  limit: number = 5,
  windowMs: number = 3600000 // default 1 hour
): Promise<{ success: boolean; limit: number; remaining: number; resetMs: number }> {
  const ip = getClientIp(req);
  const key = `ratelimit:${actionKey}:${ip}`;
  const windowSec = Math.ceil(windowMs / 1000);

  // ── Try KV first ─────────────────────────────────────────────────────
  try {
    const kv = await getKvClient();
    if (kv) {
      const current: number | null = await kv.incr(key);
      const count = current ?? 1;

      // Set expiry only on the first increment (when count is 1)
      if (count === 1) {
        await kv.expire(key, windowSec);
      }

      if (count > limit) {
        const ttl: number = await kv.ttl(key);
        const resetMs = ttl > 0 ? ttl * 1000 : windowMs;
        console.warn(`🚫 Rate limit hit: ${actionKey} from ${ip} (${count}/${limit})`);
        return { success: false, limit, remaining: 0, resetMs };
      }

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - count),
        resetMs: windowMs,
      };
    }
  } catch (err) {
    // Fail open: KV error should not block users
    console.warn(`⚠️  Rate limiter KV error for ${actionKey} — allowing request through.`, err);
  }

  // ── In-memory fallback ───────────────────────────────────────────────
  const now = Date.now();
  let record = fallbackCache.get(key);

  if (!record || now - record.windowStart >= windowMs) {
    record = { count: 0, windowStart: now };
    fallbackCache.set(key, record);
  }

  record.count++;

  if (record.count > limit) {
    const resetMs = windowMs - (now - record.windowStart);
    console.warn(`🚫 Rate limit hit (in-memory): ${actionKey} from ${ip} (${record.count}/${limit})`);
    return { success: false, limit, remaining: 0, resetMs };
  }

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - record.count),
    resetMs: windowMs,
  };
}
