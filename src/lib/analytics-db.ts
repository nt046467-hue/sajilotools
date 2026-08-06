import { prisma } from "@/lib/prisma";
import { TOOLS } from "@/lib/tools-registry";

export interface StoredFeedback {
  id: string;
  toolSlug: string;
  isHelpful: boolean;
  comment?: string;
  createdAt: string;
}

export interface ErrorLogItem {
  id: string;
  toolSlug?: string;
  errorMsg: string;
  createdAt: string;
}

export interface DailyTrafficPoint {
  date: string;
  views: number;
  visitors: number;
}

export interface AnalyticsSummary {
  traffic: {
    todayViews: number;
    sevenDaysViews: number;
    thirtyDaysViews: number;
    allTimeViews: number;
    rangeViews: number;
    rangeUniqueVisitors: number;
    topPages: { path: string; views: number }[];
    dailyTraffic: DailyTrafficPoint[];
  };
  tools: {
    usageMap: Record<string, number>;
    topTools: { slug: string; count: number }[];
    deadWeightTools: { slug: string; count: number }[];
  };
  searches: {
    topQueries: { query: string; count: number }[];
    unmappedSearches: { query: string; count: number }[];
  };
  health: {
    totalErrors: number;
    errorLogs: ErrorLogItem[];
    toolErrorRates: { slug: string; errors: number; uses: number; errorRate: number }[];
  };
  feedback: StoredFeedback[];
}

export interface SaveAnalyticsInput {
  type: string; // "pageview" | "tool_use" | "search" | "feedback" | "error"
  path?: string;
  toolSlug?: string;
  query?: string;
  isHelpful?: boolean;
  comment?: string;
  errorMsg?: string;
  sessionId?: string;
  timestamp?: number;
}

// Safely access Prisma analyticsEvent delegate
function dbAnalytics() {
  return (prisma as any).analyticsEvent;
}

export async function saveAnalyticsEvent(event: SaveAnalyticsInput): Promise<void> {
  try {
    const validTypes = ["pageview", "tool_use", "search", "feedback", "error"];
    if (!event.type || !validTypes.includes(event.type)) return;

    const delegate = dbAnalytics();
    if (!delegate) return;

    await delegate.create({
      data: {
        type: event.type,
        path: event.path || null,
        toolSlug: event.toolSlug || null,
        query: event.query ? event.query.toLowerCase().trim() : null,
        isHelpful: typeof event.isHelpful === "boolean" ? event.isHelpful : null,
        comment: event.comment ? event.comment.trim() : null,
        errorMsg: event.errorMsg ? event.errorMsg.trim() : null,
        sessionId: event.sessionId || null,
        createdAt: event.timestamp ? new Date(event.timestamp) : new Date(),
      },
    });
  } catch (err) {
    console.error("Failed to save analytics event to database:", err);
  }
}

export async function getAnalyticsData(range: "24h" | "7d" | "30d" | "all" = "30d"): Promise<AnalyticsSummary> {
  try {
    const delegate = dbAnalytics();
    if (!delegate) {
      return {
        traffic: {
          todayViews: 0,
          sevenDaysViews: 0,
          thirtyDaysViews: 0,
          allTimeViews: 0,
          rangeViews: 0,
          rangeUniqueVisitors: 0,
          topPages: [],
          dailyTraffic: [],
        },
        tools: { usageMap: {}, topTools: [], deadWeightTools: [] },
        searches: { topQueries: [], unmappedSearches: [] },
        health: { totalErrors: 0, errorLogs: [], toolErrorRates: [] },
        feedback: [],
      };
    }

    const now = new Date();
    let startDate: Date | null = null;
    if (range === "24h") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const rangeWhere = startDate ? { createdAt: { gte: startDate } } : {};

    // ── 1. Traffic Queries ───────────────────────────────────────────────────
    const [todayViews, sevenDaysViews, thirtyDaysViews, allTimeViews] = await Promise.all([
      delegate.count({ where: { type: "pageview", createdAt: { gte: todayStart } } }),
      delegate.count({ where: { type: "pageview", createdAt: { gte: sevenDaysStart } } }),
      delegate.count({ where: { type: "pageview", createdAt: { gte: thirtyDaysStart } } }),
      delegate.count({ where: { type: "pageview" } }),
    ]);

    const rangeViews = await delegate.count({
      where: { type: "pageview", ...rangeWhere },
    });

    const rangeUniqueVisitorsRaw: Array<{ sessionId: string | null }> = await delegate.groupBy({
      by: ["sessionId"],
      where: { type: "pageview", sessionId: { not: null }, ...rangeWhere },
    });
    const rangeUniqueVisitors = rangeUniqueVisitorsRaw.length;

    // Top Pages
    const topPagesRaw: Array<{ path: string | null; _count: { path: number } }> = await delegate.groupBy({
      by: ["path"],
      where: { type: "pageview", path: { not: null }, ...rangeWhere },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    });
    const topPages = topPagesRaw.map((p) => ({
      path: p.path || "/",
      views: p._count.path,
    }));

    // 30-Day Daily Traffic Chart
    const dailyEvents: Array<{ createdAt: Date; sessionId: string | null }> = await delegate.findMany({
      where: { type: "pageview", createdAt: { gte: thirtyDaysStart } },
      select: { createdAt: true, sessionId: true },
    });

    const dailyMap: Record<string, { views: number; sessions: Set<string> }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      dailyMap[dateStr] = { views: 0, sessions: new Set() };
    }

    dailyEvents.forEach((e) => {
      const dateStr = e.createdAt.toISOString().split("T")[0];
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].views++;
        if (e.sessionId) dailyMap[dateStr].sessions.add(e.sessionId);
      }
    });

    const dailyTraffic: DailyTrafficPoint[] = Object.entries(dailyMap).map(([date, data]) => ({
      date,
      views: data.views,
      visitors: data.sessions.size,
    }));

    // ── 2. Tool Usage Queries ────────────────────────────────────────────────
    const toolUsageRaw: Array<{ toolSlug: string | null; _count: { toolSlug: number } }> = await delegate.groupBy({
      by: ["toolSlug"],
      where: { type: "tool_use", toolSlug: { not: null }, ...rangeWhere },
      _count: { toolSlug: true },
      orderBy: { _count: { toolSlug: "desc" } },
    });

    const usageMap: Record<string, number> = {};
    toolUsageRaw.forEach((t) => {
      if (t.toolSlug) usageMap[t.toolSlug] = t._count.toolSlug;
    });

    const topTools = toolUsageRaw
      .filter((t) => t.toolSlug)
      .slice(0, 10)
      .map((t) => ({ slug: t.toolSlug!, count: t._count.toolSlug }));

    // Dead Weight Tools (Registered tools with 0 or low usage)
    const deadWeightTools = TOOLS.map((t) => ({
      slug: t.slug,
      count: usageMap[t.slug] || 0,
    }))
      .filter((t) => t.count < 3)
      .sort((a, b) => a.count - b.count);

    // ── 3. Search Queries ────────────────────────────────────────────────────
    const searchesRaw: Array<{ query: string | null; _count: { query: number } }> = await delegate.groupBy({
      by: ["query"],
      where: { type: "search", query: { not: null }, ...rangeWhere },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 20,
    });

    const topQueries = searchesRaw
      .filter((s) => s.query)
      .map((s) => ({ query: s.query!, count: s._count.query }));

    // Unmapped Searches (Searches that don't match any tool slug or name)
    const knownTerms = new Set<string>();
    TOOLS.forEach((t) => {
      knownTerms.add(t.slug.toLowerCase());
      knownTerms.add(t.name.toLowerCase());
      t.slug.split("-").forEach((part) => knownTerms.add(part));
    });

    const unmappedSearches = topQueries.filter((q) => {
      const queryLower = q.query.toLowerCase();
      for (const term of Array.from(knownTerms)) {
        if (queryLower.includes(term) || term.includes(queryLower)) return false;
      }
      return true;
    });

    // ── 4. Tech Health & Error Tracking ─────────────────────────────────────
    const errorLogsRaw: Array<{ id: string; toolSlug: string | null; errorMsg: string | null; createdAt: Date }> =
      await delegate.findMany({
        where: { type: "error", ...rangeWhere },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, toolSlug: true, errorMsg: true, createdAt: true },
      });

    const errorLogs: ErrorLogItem[] = errorLogsRaw.map((err) => ({
      id: err.id,
      toolSlug: err.toolSlug || undefined,
      errorMsg: err.errorMsg || "Unknown client error",
      createdAt: err.createdAt.toISOString(),
    }));

    const totalErrors: number = await delegate.count({
      where: { type: "error", ...rangeWhere },
    });

    // Error rate per tool
    const errorsPerToolRaw: Array<{ toolSlug: string | null; _count: { toolSlug: number } }> = await delegate.groupBy({
      by: ["toolSlug"],
      where: { type: "error", toolSlug: { not: null }, ...rangeWhere },
      _count: { toolSlug: true },
    });

    const toolErrorRates = errorsPerToolRaw.map((item) => {
      const slug = item.toolSlug!;
      const errors = item._count.toolSlug;
      const uses = usageMap[slug] || 0;
      const errorRate = uses > 0 ? parseFloat(((errors / uses) * 100).toFixed(1)) : 100;
      return { slug, errors, uses, errorRate };
    });

    // ── 5. Feedback Queries ─────────────────────────────────────────────────
    const feedbackRaw: Array<{ id: string; toolSlug: string | null; isHelpful: boolean | null; comment: string | null; createdAt: Date }> =
      await delegate.findMany({
        where: { type: "feedback", toolSlug: { not: null }, ...rangeWhere },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, toolSlug: true, isHelpful: true, comment: true, createdAt: true },
      });

    const feedback: StoredFeedback[] = feedbackRaw.map((f) => ({
      id: f.id,
      toolSlug: f.toolSlug!,
      isHelpful: !!f.isHelpful,
      comment: f.comment || undefined,
      createdAt: f.createdAt.toISOString(),
    }));

    return {
      traffic: {
        todayViews,
        sevenDaysViews,
        thirtyDaysViews,
        allTimeViews,
        rangeViews,
        rangeUniqueVisitors,
        topPages,
        dailyTraffic,
      },
      tools: {
        usageMap,
        topTools,
        deadWeightTools,
      },
      searches: {
        topQueries,
        unmappedSearches,
      },
      health: {
        totalErrors,
        errorLogs,
        toolErrorRates,
      },
      feedback,
    };
  } catch (err) {
    console.error("Failed to fetch analytics from database:", err);
    return {
      traffic: {
        todayViews: 0,
        sevenDaysViews: 0,
        thirtyDaysViews: 0,
        allTimeViews: 0,
        rangeViews: 0,
        rangeUniqueVisitors: 0,
        topPages: [],
        dailyTraffic: [],
      },
      tools: { usageMap: {}, topTools: [], deadWeightTools: [] },
      searches: { topQueries: [], unmappedSearches: [] },
      health: { totalErrors: 0, errorLogs: [], toolErrorRates: [] },
      feedback: [],
    };
  }
}
