import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site-config";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // ── 1. Rate Limiting ──
    const rateCheck = await checkRateLimit(req, "contact", 5, 3600000); // 5 messages per hour per IP
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many contact messages sent. Please wait an hour before trying again." },
        { status: 429 }
      );
    }

    const { name, email, subject, message, honeypot } = await req.json();

    // ── 2. Honeypot Bot Trap ──
    if (honeypot && String(honeypot).trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // ── 3. Validation ──
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Your name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject && typeof subject === "string" ? subject.trim() : "General Inquiry";
    const cleanMessage = message.trim();

    // ── 4. Send notification email to sajilotool@gmail.com ──
    await sendMail({
      to: process.env.GMAIL_USER || "sajilotool@gmail.com",
      subject: `New Contact: ${cleanSubject} — from ${cleanName}`,
      text: `From: ${cleanName} <${cleanEmail}>\nSubject: ${cleanSubject}\n\n${cleanMessage}`,
      replyTo: cleanEmail,
    });

    // ── 5. Send confirmation email to the visitor ──
    await sendMail({
      to: cleanEmail,
      subject: "We received your message — SajiloTools",
      text: [
        `Hi ${cleanName},`,
        "",
        "Thanks for reaching out to SajiloTools! We received your message and will get back to you shortly.",
        "",
        `Your message:`,
        `"${cleanMessage}"`,
        "",
        "— The SajiloTools Team",
        SITE_URL,
      ].join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in /api/contact:", err);
    return NextResponse.json(
      { error: err?.message || "Something went wrong sending your message. Please try again." },
      { status: 500 }
    );
  }
}
