import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalyticsData } from "@/lib/analytics-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const adminSecret = process.env.ADMIN_SECRET_KEY || "dev-only-admin-key";
    const authHeader = req.headers.get("x-admin-key") || req.nextUrl.searchParams.get("key");

    const isSessionAdmin = (session?.user as any)?.role === "admin";
    const isKeyAdmin = authHeader === adminSecret;

    if (!isSessionAdmin && !isKeyAdmin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const rangeParam = req.nextUrl.searchParams.get("range") as "24h" | "7d" | "30d" | "all";
    const validRanges = ["24h", "7d", "30d", "all"];
    const range = validRanges.includes(rangeParam) ? rangeParam : "30d";

    const data = await getAnalyticsData(range);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Admin analytics GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
