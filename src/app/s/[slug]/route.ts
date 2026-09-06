import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function createNoCacheRedirect(url: string, status: number = 307) {
  const res = NextResponse.redirect(url, status);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } | Promise<{ slug: string }> }
) {
  try {
    const resolved = await Promise.resolve(params);
    const slug = resolved?.slug;

    if (!slug) {
      return createNoCacheRedirect(new URL("/tools/developer/link-shortener", req.url).toString());
    }

    const link = await prisma.shortLink.findUnique({
      where: { slug },
    });

    if (!link) {
      return createNoCacheRedirect(
        new URL(`/tools/developer/link-shortener?error=not-found&slug=${encodeURIComponent(slug)}`, req.url).toString()
      );
    }

    // Check if link was soft-deleted / disabled by owner
    if (!link.isActive) {
      return createNoCacheRedirect(
        new URL(`/tools/developer/link-shortener?error=disabled&slug=${encodeURIComponent(slug)}`, req.url).toString()
      );
    }

    // Check if link has expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return createNoCacheRedirect(
        new URL(`/tools/developer/link-shortener?error=expired&slug=${encodeURIComponent(slug)}`, req.url).toString()
      );
    }

    // Increment click count reliably
    try {
      await prisma.shortLink.update({
        where: { slug },
        data: { clicks: { increment: 1 } },
      });
    } catch (e) {
      console.warn("Could not increment click count:", e);
    }

    return createNoCacheRedirect(link.longUrl, 307);
  } catch (err) {
    console.error("Error in /s/[slug] redirect:", err);
    return createNoCacheRedirect(new URL("/tools/developer/link-shortener?error=server-error", req.url).toString());
  }
}

