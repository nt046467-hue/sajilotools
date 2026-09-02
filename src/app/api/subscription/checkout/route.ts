import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PRO_PASS_HIDDEN: This endpoint is disabled while ENABLE_PRO_PASS=false
const ENABLE_PRO_PASS = process.env.ENABLE_PRO_PASS === "true";

export async function POST(req: NextRequest) {
  if (!ENABLE_PRO_PASS) {
    return NextResponse.json({ error: "Pro Pass is not currently available." }, { status: 404 });
  }
  try {
    const { plan = "pro_monthly", provider = "esewa", email } = await req.json();

    // 1. Check if authenticated
    let userId: string | undefined;
    let userEmail: string | undefined = email;

    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        userId = (session.user as any).id;
        userEmail = session.user.email || userEmail;
      }
    } catch {
      // unauthenticated checkout
    }

    // If user is not authenticated, find or create user record for the email
    if (!userId) {
      if (!userEmail || !userEmail.includes("@")) {
        return NextResponse.json(
          { error: "A valid email is required for Pro subscription activation." },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail.toLowerCase() },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            email: userEmail.toLowerCase(),
            role: "user",
          },
        });
        userId = newUser.id;
      }
    }

    // Calculate subscription expiration (30 days for monthly, 365 days for yearly)
    const now = new Date();
    const expiry = new Date(now);
    if (plan === "pro_yearly") {
      expiry.setDate(expiry.getDate() + 365);
    } else {
      expiry.setDate(expiry.getDate() + 30);
    }

    const providerRefId = `txn_${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Upsert subscription in Prisma
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: plan === "pro_yearly" ? "pro_yearly" : "pro_monthly",
        status: "active",
        provider,
        providerRefId,
        currentPeriodEnd: expiry,
      },
      create: {
        userId,
        plan: plan === "pro_yearly" ? "pro_yearly" : "pro_monthly",
        status: "active",
        provider,
        providerRefId,
        currentPeriodEnd: expiry,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pro subscription successfully activated!",
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        expiresAt: subscription.currentPeriodEnd,
      },
    });
  } catch (error: any) {
    console.error("API /api/subscription/checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription checkout." },
      { status: 500 }
    );
  }
}
