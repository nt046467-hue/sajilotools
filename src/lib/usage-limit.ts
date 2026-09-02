import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface UsageCheckResult {
  allowed: boolean;
  isPro: boolean;
  plan: "free" | "pro_monthly" | "pro_yearly";
  remainingCredits: number;
  maxCredits: number;
  userId?: string;
  sessionId: string;
}

const FREE_DAILY_TRANSLATION_LIMIT = 25;

/**
 * Extracts or generates a session/device ID from cookies/headers for tracking anonymous usage.
 */
export function getSessionId(req: NextRequest): string {
  const cookieSession = req.cookies.get("sajilo_session_id")?.value;
  if (cookieSession) return cookieSession;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";
  const userAgent = req.headers.get("user-agent") || "unknown";

  // Simple deterministic hash for fallback
  return `anon_${Buffer.from(`${ip}_${userAgent.slice(0, 30)}`).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)}`;
}

/**
 * Checks whether the current user or session has available credits for a tool.
 */
export async function checkToolUsage(
  req: NextRequest,
  toolSlug: string = "nepali-translator"
): Promise<UsageCheckResult> {
  const sessionId = getSessionId(req);

  // 1. Check if user is authenticated
  let userId: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    if (session?.user && (session.user as any).id) {
      userId = (session.user as any).id;
    }
  } catch {
    // NextAuth session resolution in edge/unauthenticated context
  }

  // 2. Check for active Pro subscription if authenticated
  if (userId) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (
        subscription &&
        subscription.status === "active" &&
        (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date())
      ) {
        return {
          allowed: true,
          isPro: true,
          plan: (subscription.plan as any) || "pro_monthly",
          remainingCredits: 999999,
          maxCredits: 999999,
          userId,
          sessionId,
        };
      }
    } catch (err) {
      console.warn("Error checking user subscription:", err);
    }
  }

  // 3. Count today's usage for free tier
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  let usedCount = 0;
  try {
    if (userId) {
      usedCount = await prisma.usageLog.count({
        where: {
          userId,
          toolSlug,
          createdAt: { gte: startOfDay },
        },
      });
    } else {
      usedCount = await prisma.usageLog.count({
        where: {
          sessionId,
          toolSlug,
          createdAt: { gte: startOfDay },
        },
      });
    }
  } catch (err) {
    console.warn("Error querying UsageLog:", err);
  }

  const remainingCredits = Math.max(0, FREE_DAILY_TRANSLATION_LIMIT - usedCount);
  const allowed = remainingCredits > 0;

  return {
    allowed,
    isPro: false,
    plan: "free",
    remainingCredits,
    maxCredits: FREE_DAILY_TRANSLATION_LIMIT,
    userId,
    sessionId,
  };
}

/**
 * Records a tool usage event in the database.
 */
export async function recordToolUsage(
  userId: string | undefined,
  sessionId: string,
  toolSlug: string
): Promise<void> {
  try {
    await prisma.usageLog.create({
      data: {
        userId: userId || null,
        sessionId,
        toolSlug,
      },
    });
  } catch (err) {
    console.warn("Failed to record UsageLog:", err);
  }
}
