import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalyticsData } from "@/lib/analytics-db";

import crypto from "crypto";

export const dynamic = "force-dynamic";

function safeCompareStrings(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function getAdminSecretKey(): string | null {
  if (process.env.ADMIN_SECRET_KEY) {
    return process.env.ADMIN_SECRET_KEY;
  }
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-admin-key";
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const adminSecret = getAdminSecretKey();
    const providedKey = req.headers.get("x-admin-key");

    const isSessionAdmin = (session?.user as any)?.role === "admin";
    const isKeyAdmin = safeCompareStrings(providedKey, adminSecret);

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
