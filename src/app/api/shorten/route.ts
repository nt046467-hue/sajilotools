import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

// Valid URL schemes we'll accept
const ALLOWED_SCHEMES = /^https?:\/\//i;

// Slug format: 3-30 chars, lowercase alphanumeric + hyphens
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) slug += chars[bytes[i] % chars.length];
  return slug;
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Rate Limiting ──
    const rateCheck = await checkRateLimit(req, "shorten", 20, 3600000); // 20 link creations per hour per IP
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many links created. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    let { url, alias } = body as { url?: string; alias?: string };

    // ── Validate URL ──
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required." },
        { status: 400 }
      );
    }

    url = url.trim();

    // Auto-prepend https:// if no scheme
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    if (!ALLOWED_SCHEMES.test(url)) {
      return NextResponse.json(
        { error: "Only http:// and https:// URLs are allowed." },
        { status: 400 }
      );
    }

    // Basic URL shape validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format." },
        { status: 400 }
      );
    }

    // ── Validate or generate slug ──
    let slug: string;

    if (alias && typeof alias === "string" && alias.trim()) {
      slug = alias.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!SLUG_PATTERN.test(slug)) {
        return NextResponse.json(
          {
            error:
              "Custom alias must be 3-30 characters, lowercase letters, numbers, or hyphens. Must start and end with a letter or number.",
          },
          { status: 400 }
        );
      }

      // Check uniqueness
      const existing = await prisma.shortLink.findUnique({
        where: { slug },
      });
      if (existing) {
        return NextResponse.json(
          { error: `Alias "${slug}" is already taken. Try another one.` },
          { status: 409 }
        );
      }
    } else {
      // Generate unique random slug
      let attempts = 0;
      do {
        slug = generateSlug();
        const existing = await prisma.shortLink.findUnique({
          where: { slug },
        });
        if (!existing) break;
        attempts++;
      } while (attempts < 10);

      if (attempts >= 10) {
        return NextResponse.json(
          { error: "Could not generate a unique slug. Please try again." },
          { status: 500 }
        );
      }
    }

    // ── Create short link ──
    const shortLink = await prisma.shortLink.create({
      data: {
        slug,
        longUrl: url,
      },
    });

    // Build the short URL using the request's origin
    const origin = req.nextUrl.origin;
    const shortUrl = `${origin}/s/${shortLink.slug}`;

    return NextResponse.json({
      shortUrl,
      slug: shortLink.slug,
      longUrl: shortLink.longUrl,
      createdAt: shortLink.createdAt,
    });
  } catch (err: any) {
    console.error("Error in /api/shorten:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
