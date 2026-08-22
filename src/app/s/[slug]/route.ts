import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } | Promise<{ slug: string }> }
) {
  try {
    const resolved = await Promise.resolve(params);
    const slug = resolved?.slug;

    if (!slug) {
      return NextResponse.redirect(new URL("/tools/developer/link-shortener", req.url));
    }

    const link = await prisma.shortLink.findUnique({
      where: { slug },
    });

    if (!link) {
      return NextResponse.redirect(
        new URL(`/tools/developer/link-shortener?error=not-found&slug=${encodeURIComponent(slug)}`, req.url)
      );
    }

    // Check if link was soft-deleted / disabled by owner
    if (!link.isActive) {
      return NextResponse.redirect(
        new URL(`/tools/developer/link-shortener?error=disabled&slug=${encodeURIComponent(slug)}`, req.url)
      );
    }

    // Check if link has expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.redirect(
        new URL(`/tools/developer/link-shortener?error=expired&slug=${encodeURIComponent(slug)}`, req.url)
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

    const res = NextResponse.redirect(link.longUrl, 302);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  } catch (err) {
    console.error("Error in /s/[slug] redirect:", err);
    return NextResponse.redirect(new URL("/tools/developer/link-shortener?error=server-error", req.url));
  }
}

