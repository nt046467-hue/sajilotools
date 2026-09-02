import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { sendMail, generateBroadcastEmailHtml } from "@/lib/mailer";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const payload = await req.json();
    const {
      subject,
      message,
      ctaText,
      ctaUrl,
      isTest = false,
      testEmail,
      recipientType = "subscribers", // "subscribers" | "users" | "all"
    } = payload;

    // Validation
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json({ error: "Subject line is required." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    const cleanCtaText = ctaText?.trim() || undefined;
    const cleanCtaUrl = ctaUrl?.trim() || undefined;

    const html = generateBroadcastEmailHtml({
      subject: cleanSubject,
      message: cleanMessage,
      ctaText: cleanCtaText,
      ctaUrl: cleanCtaUrl,
    });

    // ── 1. Handle Test Email ──
    if (isTest) {
      if (!testEmail || typeof testEmail !== "string" || !EMAIL_REGEX.test(testEmail.trim())) {
        return NextResponse.json(
          { error: "A valid test recipient email address is required." },
          { status: 400 }
        );
      }

      const targetTestEmail = testEmail.trim().toLowerCase();

      await sendMail({
        to: targetTestEmail,
        subject: `[TEST PREVIEW] ${cleanSubject}`,
        text: cleanMessage,
        html,
      });

      return NextResponse.json({
        success: true,
        isTest: true,
        recipient: targetTestEmail,
        message: `Test email successfully sent to ${targetTestEmail}!`,
      });
    }

    // ── 2. Handle Real Broadcast ──
    const emailSet = new Set<string>();

    if (recipientType === "subscribers" || recipientType === "all") {
      const subscribers = await prisma.subscriber.findMany({
        select: { email: true },
      });
      subscribers.forEach((s: { email?: string | null }) => {
        if (s.email && EMAIL_REGEX.test(s.email)) {
          emailSet.add(s.email.toLowerCase().trim());
        }
      });
    }

    if (recipientType === "users" || recipientType === "all") {
      try {
        const users = await prisma.user.findMany({
          select: { email: true },
        });
        users.forEach((u: { email?: string | null }) => {
          if (u.email && EMAIL_REGEX.test(u.email)) {
            emailSet.add(u.email.toLowerCase().trim());
          }
        });
      } catch {
        // safe fallback if user table is empty or error
      }
    }

    const recipients = Array.from(emailSet);

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No subscribed email addresses found to send the broadcast to." },
        { status: 400 }
      );
    }

    let sentCount = 0;
    let failedCount = 0;
    const failedEmails: string[] = [];

    // Send in batches of 5 with 150ms pauses to avoid overwhelming SMTP
    const BATCH_SIZE = 5;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (email) => {
          try {
            await sendMail({
              to: email,
              subject: cleanSubject,
              text: cleanMessage,
              html,
            });
            sentCount++;
          } catch (err) {
            console.error(`Failed to send broadcast email to ${email}:`, err);
            failedCount++;
            failedEmails.push(email);
          }
        })
      );

      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }

    return NextResponse.json({
      success: true,
      totalTargeted: recipients.length,
      sentCount,
      failedCount,
      failedEmails,
      message: `Broadcast complete! Successfully sent to ${sentCount} recipient${
        sentCount === 1 ? "" : "s"
      }${failedCount > 0 ? ` (${failedCount} failed)` : ""}.`,
    });
  } catch (err: any) {
    console.error("Admin broadcast email error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process broadcast transmission." },
      { status: 500 }
    );
  }
}
