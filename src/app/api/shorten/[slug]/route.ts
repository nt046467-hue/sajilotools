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

    // Check for deleteToken from request body, query params, or headers
    let deleteToken: string | null = null;
    try {
      const body = await req.json();
      deleteToken = body?.deleteToken || null;
    } catch {
      // Body might be empty
    }
    if (!deleteToken) {
      deleteToken = req.nextUrl.searchParams.get("token") || req.headers.get("x-delete-token");
    }

    const link = await prisma.shortLink.findUnique({
      where: { slug },
    });

    if (!link) {
      return NextResponse.json({ success: true, message: "Link already deleted or not found." });
    }

    // Check authorization:
    // 1. Admin can delete any link
    // 2. Creator with session can delete their link
    // 3. Creator with matching deleteToken can delete their link
    // 4. Anonymous legacy link without userId and without deleteToken can be deleted
    const isOwnerBySession = Boolean(userId && link.userId && link.userId === userId);
    const isAdmin = userRole === "admin";
    const isOwnerByToken = Boolean(deleteToken && link.deleteToken && deleteToken === link.deleteToken);
    const isLegacyAnonymous = !link.userId && !link.deleteToken;

    if (!isOwnerBySession && !isAdmin && !isOwnerByToken && !isLegacyAnonymous) {
      return NextResponse.json(
        { error: "Unauthorized: You do not have permission to delete this link." },
        { status: 403 }
      );
    }

    // Truly delete the link from the database
    await prisma.shortLink.delete({
      where: { slug },
    });

    return NextResponse.json({
      success: true,
      message: `Link /s/${slug} has been permanently deleted.`,
    });
  } catch (err: any) {
    console.error("Error in DELETE /api/shorten/[slug]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete link." },
      { status: 500 }
    );
  }
}
