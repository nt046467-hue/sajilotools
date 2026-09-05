import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return NextResponse.json(
        { error: "Authentication required to access account link history." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);
    const cursor = searchParams.get("cursor");

    const [links, totalCount] = await Promise.all([
      prisma.shortLink.findMany({
        where: { userId },
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { createdAt: "desc" },
      }),
      prisma.shortLink.count({
        where: { userId },
      }),
    ]);

    const origin = req.nextUrl.origin;

    const formattedLinks = links.map((link: any) => ({
      id: link.id,
      slug: link.slug,
      shortUrl: `${origin}/s/${link.slug}`,
      longUrl: link.longUrl,
      clicks: link.clicks,
      isActive: link.isActive,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
      deleteToken: link.deleteToken,
    }));

    return NextResponse.json({
      links: formattedLinks,
      totalCount,
      nextCursor: links.length === limit ? links[links.length - 1].id : null,
    });
  } catch (err: any) {
    console.error("Error in /api/shorten/history:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch link history." },
      { status: 500 }
    );
  }
}
