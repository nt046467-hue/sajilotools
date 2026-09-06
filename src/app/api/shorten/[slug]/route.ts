import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // Check for deleteToken from query params, headers, or body
    let deleteToken: string | null =
      req.nextUrl.searchParams.get("token") || req.headers.get("x-delete-token");

    if (!deleteToken) {
      try {
        const body = await req.json();
        deleteToken = body?.deleteToken || null;
      } catch {
        // Body might be empty or stripped
      }
    }

    const link = await prisma.shortLink.findUnique({
      where: { slug },
    });

    if (!link) {
      return NextResponse.json({ success: true, message: "Link already deleted or not found." });
    }

    // Authorization:
    // 1. If link belongs to a registered user, strictly enforce ownership
    if (link.userId) {
      const isOwnerBySession = Boolean(userId && link.userId === userId);
      const isAdmin = userRole === "admin";
      const isOwnerByToken = Boolean(deleteToken && link.deleteToken && deleteToken === link.deleteToken);

      if (!isOwnerBySession && !isAdmin && !isOwnerByToken) {
        return NextResponse.json(
          { error: "Unauthorized: This link belongs to a registered user. Please log in to delete it." },
          { status: 403 }
        );
      }
    }
    // 2. If link.userId is null, it is an anonymous/guest link.
    // Allow deletion so guest users on any device can delete and reuse their alias.

    // Permanently remove from the database
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
