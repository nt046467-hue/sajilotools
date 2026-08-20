import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } | Promise<{ slug: string }> }
) {
  try {
    const resolved = await Promise.resolve(params);
    const slug = resolved?.slug;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const userRole = (session?.user as any)?.role;

    if (!session || !userId) {
      return NextResponse.json(
        { error: "Authentication required to manage links." },
        { status: 401 }
      );
    }

    const link = await prisma.shortLink.findUnique({
      where: { slug },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found." }, { status: 404 });
    }

    // Check ownership: must be the creator of the link or an admin
    if (link.userId !== userId && userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: You do not have permission to delete this link." },
        { status: 403 }
      );
    }

    // Soft delete link
    const updated = await prisma.shortLink.update({
      where: { slug },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: `Link /s/${slug} has been disabled.`,
      link: {
        id: updated.id,
        slug: updated.slug,
        isActive: updated.isActive,
      },
    });
  } catch (err: any) {
    console.error("Error in DELETE /api/shorten/[slug]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to disable link." },
      { status: 500 }
    );
  }
}
