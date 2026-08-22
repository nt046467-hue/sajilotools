import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/analytics-db";
import { verifyAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminRequest(req);

    if (!isAdmin) {
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
