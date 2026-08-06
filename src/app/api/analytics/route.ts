import { NextRequest, NextResponse } from "next/server";
import { saveAnalyticsEvent } from "@/lib/analytics-db";

// ── Privacy-Respecting Analytics API ────────────────────────────────────────
// Accepts telemetry (pageview, tool_use, search, feedback, error).
// Persists events to Turso database.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate event shape
    const validTypes = ["pageview", "tool_use", "search", "feedback", "error"];
    if (!body.type || !validTypes.includes(body.type)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    // Persist to database
    await saveAnalyticsEvent({
      type: body.type,
      path: body.path,
      toolSlug: body.toolSlug,
      query: body.query,
      isHelpful: body.isHelpful,
      comment: body.comment,
      errorMsg: body.errorMsg,
      sessionId: body.sessionId,
      timestamp: body.timestamp,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[analytics] ${body.type}`, {
        path: body.path,
        toolSlug: body.toolSlug,
        action: body.action,
        query: body.query,
        errorMsg: body.errorMsg,
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[analytics] POST error:", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
