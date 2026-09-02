import { NextRequest, NextResponse } from "next/server";
import { checkToolUsage } from "@/lib/usage-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tool = url.searchParams.get("tool") || "nepali-translator";

    const usage = await checkToolUsage(req, tool);

    return NextResponse.json({
      success: true,
      isPro: usage.isPro,
      plan: usage.plan,
      remainingCredits: usage.remainingCredits,
      maxCredits: usage.maxCredits,
      sessionId: usage.sessionId,
    });
  } catch (error: any) {
    console.error("API /api/subscription/status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
