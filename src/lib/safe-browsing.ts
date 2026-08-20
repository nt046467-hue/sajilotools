/**
 * Safe Browsing & URL Abuse Screening Utility
 *
 * Checks target URLs against Google Safe Browsing API v4 and performs SSRF/private host filtering.
 * Features:
 * - 24-hour in-memory cache for clean URLs to conserve API quota
 * - Private host / localhost SSRF protection
 * - 3-second timeout with fail-open fallback so legitimate creations are never blocked by API outages
 */

interface SafeBrowsingResult {
  safe: boolean;
  reason?: string;
}

// In-memory 24-hour cache for screened URLs
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_ENTRIES = 5000;
const urlSafetyCache = new Map<string, { safe: boolean; timestamp: number }>();

function isPrivateOrLocalHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower === "0.0.0.0" ||
    lower === "::1"
  ) {
    return true;
  }

  // IPv4 regex check for private / loopback ranges
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, o1, o2] = ipv4Match.map(Number);
    if (o1 === 10) return true; // 10.0.0.0/8
    if (o1 === 127) return true; // 127.0.0.0/8
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true; // 172.16.0.0/12
    if (o1 === 192 && o2 === 168) return true; // 192.168.0.0/16
    if (o1 === 169 && o2 === 254) return true; // Link-local
    if (o1 === 0) return true;
  }

  return false;
}

export async function checkSafeUrl(targetUrl: string): Promise<SafeBrowsingResult> {
  try {
    const parsed = new URL(targetUrl);

    // 1. SSRF / Local address check (skip in dev so localhost testing works)
    if (isPrivateOrLocalHost(parsed.hostname) && process.env.NODE_ENV !== "development") {
      return {
        safe: false,
        reason: "Destination URL cannot point to localhost or private network addresses.",
      };
    }

    const normalizedUrl = parsed.toString().toLowerCase();

    // 2. Check in-memory cache
    const cached = urlSafetyCache.get(normalizedUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      if (!cached.safe) {
        return {
          safe: false,
          reason: "This URL has been flagged as unsafe (phishing or malicious content).",
        };
      }
      return { safe: true };
    }

    // 3. Google Safe Browsing API check
    const apiKey =
      process.env.GOOGLE_SAFE_BROWSING_API_KEY ||
      process.env.SAFE_BROWSING_API_KEY;

    if (!apiKey) {
      // If no API key is set, allow (fail-open)
      return { safe: true };
    }

    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(
      apiKey
    )}`;

    const requestBody = {
      client: {
        clientId: "sajilotools-link-shortener",
        clientVersion: "1.0.0",
      },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION",
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url: targetUrl }],
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[SafeBrowsing API Error] Status: ${response.status}`);
      return { safe: true }; // Fail-open
    }

    const data = await response.json();

    const matches = data.matches && Array.isArray(data.matches) && data.matches.length > 0;

    // Cache result
    if (urlSafetyCache.size > MAX_CACHE_ENTRIES) {
      const oldestKey = urlSafetyCache.keys().next().value;
      if (oldestKey) urlSafetyCache.delete(oldestKey);
    }
    urlSafetyCache.set(normalizedUrl, { safe: !matches, timestamp: Date.now() });

    if (matches) {
      return {
        safe: false,
        reason: "Security Alert: This target URL is flagged by Google Safe Browsing for phishing or malicious software.",
      };
    }

    return { safe: true };
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.warn("[SafeBrowsing] Lookup timed out after 3s — failing open.");
    } else {
      console.warn("[SafeBrowsing] Error checking URL:", err?.message || err);
    }
    // Fail-open strategy
    return { safe: true };
  }
}
