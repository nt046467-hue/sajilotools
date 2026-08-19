import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail, generateWelcomeEmailHtml } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site-config";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // ── 1. Rate Limiting ──
    const rateCheck = await checkRateLimit(req, "subscribe", 10, 3600000); // 10 per hour per IP
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, honeypot } = await req.json();

    // ── 2. Honeypot Bot Trap ──
    if (honeypot && String(honeypot).trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // ── 3. Validation ──
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ── 4. Prisma Persistence ──
    const existing = await prisma.subscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: "You are already subscribed to the newsletter!",
      });
    }

    await prisma.subscriber.create({
      data: { email: cleanEmail },
    });

    // ── 5. Notify owner (fire-and-forget) ──
    sendMail({
      to: process.env.GMAIL_USER || "sajilotool@gmail.com",
      subject: "New SajiloTools Newsletter Subscriber",
      text: `New subscriber: ${cleanEmail}\n\nTotal subscribers can be viewed at: npx prisma studio`,
    }).catch((err) => {
      console.error("Subscriber owner notification failed:", err);
    });

    // ── 6. Welcome email to the subscriber with rich branded HTML card & CTA ──
    const welcomeHtml = generateWelcomeEmailHtml({ email: cleanEmail });

    sendMail({
      to: cleanEmail,
      subject: "Welcome to SajiloTools Newsletter! 🎉",
      text: [
        "Thanks for subscribing to the SajiloTools newsletter!",
        "",
        "You'll be the first to know when we launch new tools. No spam, ever.",
        "",
        "— The SajiloTools Team",
        SITE_URL,
      ].join("\n"),
      html: welcomeHtml,
    }).catch((err) => {
      console.error("Subscriber welcome email failed:", err);
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in /api/subscribe:", err);
    return NextResponse.json(
      { error: err?.message || "Could not complete subscription. Please try again." },
      { status: 500 }
    );
  }
}
