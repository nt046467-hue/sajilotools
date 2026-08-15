import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    // Fetch all newsletter subscribers safely
    let subscribers: any[] = [];
    try {
      subscribers = await prisma.subscriber.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (subErr) {
      console.warn("Subscribers table query fallback:", subErr);
      subscribers = [];
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalCount = subscribers.length;
    const last7DaysCount = subscribers.filter((s) => new Date(s.createdAt) >= sevenDaysAgo).length;
    const last30DaysCount = subscribers.filter((s) => new Date(s.createdAt) >= thirtyDaysAgo).length;

    // Also get registered users count if any for overview
    let registeredUsersCount = 0;
    try {
      registeredUsersCount = await prisma.user.count();
    } catch {
      // safe fallback
    }

    return NextResponse.json({
      subscribers,
      stats: {
        totalSubscribers: totalCount,
        last7Days: last7DaysCount,
        last30Days: last30DaysCount,
        registeredUsers: registeredUsersCount,
      },
    });
  } catch (err: any) {
    console.error("Admin get subscribers error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Subscriber email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    await prisma.subscriber.deleteMany({
      where: { email: cleanEmail },
    });

    return NextResponse.json({ success: true, message: `Subscriber ${cleanEmail} removed successfully.` });
  } catch (err: any) {
    console.error("Admin delete subscriber error:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete subscriber" }, { status: 500 });
  }
}
