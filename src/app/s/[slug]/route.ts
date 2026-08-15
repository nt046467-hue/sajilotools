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
      return NextResponse.redirect(new URL("/tools/developer/link-shortener?error=not-found", req.url));
    }

    // Increment click count (fire-and-forget)
    prisma.shortLink
      .update({
        where: { slug },
        data: { clicks: { increment: 1 } },
      })
      .catch(() => {});

    const res = NextResponse.redirect(link.longUrl, 302);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  } catch (err) {
    console.error("Error in /s/[slug] redirect:", err);
    return NextResponse.redirect(new URL("/tools/developer/link-shortener?error=server-error", req.url));
  }
}
