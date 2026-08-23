import { prisma } from "@/lib/prisma";
import { TOOLS } from "@/lib/tools-registry";
import { searchTools } from "@/lib/search-engine";

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
  const defaultSummary: AnalyticsSummary = {
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

  try {
    const delegate = dbAnalytics();
    if (!delegate) return defaultSummary;

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

    // ── 1. Traffic Queries (Isolate errors with fallback) ───────────────────
    let todayViews = 0;
    let sevenDaysViews = 0;
    let thirtyDaysViews = 0;
    let allTimeViews = 0;
    let rangeViews = 0;
    let rangeUniqueVisitors = 0;
    let topPages: { path: string; views: number }[] = [];
    let dailyTraffic: DailyTrafficPoint[] = [];

    try {
      [todayViews, sevenDaysViews, thirtyDaysViews, allTimeViews, rangeViews] = await Promise.all([
        delegate.count({ where: { type: "pageview", createdAt: { gte: todayStart } } }).catch(() => 0),
        delegate.count({ where: { type: "pageview", createdAt: { gte: sevenDaysStart } } }).catch(() => 0),
        delegate.count({ where: { type: "pageview", createdAt: { gte: thirtyDaysStart } } }).catch(() => 0),
        delegate.count({ where: { type: "pageview" } }).catch(() => 0),
        delegate.count({ where: { type: "pageview", ...rangeWhere } }).catch(() => 0),
      ]);

      // Unique visitors
      try {
        const uniqueRaw: Array<{ sessionId: string | null }> = await delegate.groupBy({
          by: ["sessionId"],
          where: { type: "pageview", sessionId: { not: null }, ...rangeWhere },
        });
        rangeUniqueVisitors = uniqueRaw.length;
      } catch {
        const rawSessions = await delegate.findMany({
          where: { type: "pageview", sessionId: { not: null }, ...rangeWhere },
          select: { sessionId: true },
        });
        const set = new Set(rawSessions.map((s: any) => s.sessionId).filter(Boolean));
        rangeUniqueVisitors = set.size;
      }

      // Top pages
      try {
        const topPagesRaw: Array<{ path: string | null; _count: { path: number } }> = await delegate.groupBy({
          by: ["path"],
          where: { type: "pageview", path: { not: null }, ...rangeWhere },
          _count: { path: true },
          orderBy: { _count: { path: "desc" } },
          take: 10,
        });
        topPages = topPagesRaw.map((p) => ({
          path: p.path || "/",
          views: p._count?.path ?? 1,
        }));
      } catch {
        const pageEvents = await delegate.findMany({
          where: { type: "pageview", path: { not: null }, ...rangeWhere },
          select: { path: true },
          take: 1000,
        });
        const pageCounts: Record<string, number> = {};
        pageEvents.forEach((p: any) => {
          const path = p.path || "/";
          pageCounts[path] = (pageCounts[path] || 0) + 1;
        });
        topPages = Object.entries(pageCounts)
          .map(([path, views]) => ({ path, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);
      }

      // 30-day Daily Traffic Chart
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

      dailyTraffic = Object.entries(dailyMap).map(([date, data]) => ({
        date,
        views: data.views,
        visitors: data.sessions.size,
      }));
    } catch (trafficErr) {
      console.warn("[analytics-db] Traffic query error:", trafficErr);
    }

    // ── 2. Tool Popularity Queries (Resilient with in-memory fallback) ────────
    let usageMap: Record<string, number> = {};
    let topTools: { slug: string; count: number }[] = [];
    let deadWeightTools: { slug: string; count: number }[] = [];

    try {
      // First attempt groupBy
      try {
        const toolUsageRaw: Array<{ toolSlug: string | null; _count: { toolSlug: number } }> = await delegate.groupBy({
          by: ["toolSlug"],
          where: { type: "tool_use", toolSlug: { not: null }, ...rangeWhere },
          _count: { toolSlug: true },
        });

        toolUsageRaw.forEach((t) => {
          if (t.toolSlug) {
            usageMap[t.toolSlug] = t._count?.toolSlug ?? 0;
          }
        });
      } catch (groupErr) {
        // Fallback: fetch tool_use records and aggregate in memory
        const rawToolUses = await delegate.findMany({
          where: { type: "tool_use", toolSlug: { not: null }, ...rangeWhere },
          select: { toolSlug: true },
          take: 5000,
        });

        rawToolUses.forEach((t: any) => {
          if (t.toolSlug) {
            usageMap[t.toolSlug] = (usageMap[t.toolSlug] || 0) + 1;
          }
        });
      }

      // Also check UsageLog table if available for legacy/registered user logs
      try {
        const usageLogDelegate = (prisma as any).usageLog;
        if (usageLogDelegate) {
          const userLogs = await usageLogDelegate.findMany({
            where: startDate ? { createdAt: { gte: startDate } } : {},
            select: { toolSlug: true },
            take: 2000,
          });
          userLogs.forEach((l: any) => {
            if (l.toolSlug) {
              usageMap[l.toolSlug] = (usageMap[l.toolSlug] || 0) + 1;
            }
          });
        }
      } catch {}

      topTools = Object.entries(usageMap)
        .map(([slug, count]) => ({ slug, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      deadWeightTools = TOOLS.map((t) => ({
        slug: t.slug,
        count: usageMap[t.slug] || 0,
      }))
        .filter((t) => t.count < 3)
        .sort((a, b) => a.count - b.count);
    } catch (toolsErr) {
      console.warn("[analytics-db] Tool popularity query error:", toolsErr);
    }

    // ── 3. Search Queries & Search Gaps ──────────────────────────────────────
    let topQueries: { query: string; count: number }[] = [];
    let unmappedSearches: { query: string; count: number }[] = [];

    try {
      const searchCounts: Record<string, number> = {};

      try {
        const searchesRaw: Array<{ query: string | null; _count: { query: number } }> = await delegate.groupBy({
          by: ["query"],
          where: { type: "search", query: { not: null }, ...rangeWhere },
          _count: { query: true },
        });

        searchesRaw.forEach((s) => {
          if (s.query) {
            searchCounts[s.query.trim().toLowerCase()] = s._count?.query ?? 0;
          }
        });
      } catch {
        const searchEvents = await delegate.findMany({
          where: { type: "search", query: { not: null }, ...rangeWhere },
          select: { query: true },
          take: 3000,
        });

        searchEvents.forEach((s: any) => {
          if (s.query) {
            const q = s.query.trim().toLowerCase();
            searchCounts[q] = (searchCounts[q] || 0) + 1;
          }
        });
      }

      topQueries = Object.entries(searchCounts)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);

      // Accurate Unmapped Searches (True Search Gaps: queries yielding 0 matches in search engine)
      unmappedSearches = topQueries.filter((q) => {
        const qTrimmed = q.query.trim();
        if (qTrimmed.length < 2) return false;
        const matches = searchTools(qTrimmed, 1);
        return matches.length === 0;
      });
    } catch (searchErr) {
      console.warn("[analytics-db] Search query error:", searchErr);
    }

    // ── 4. Tech Health & Error Tracking ─────────────────────────────────────
    let errorLogs: ErrorLogItem[] = [];
    let totalErrors = 0;
    let toolErrorRates: { slug: string; errors: number; uses: number; errorRate: number }[] = [];

    try {
      const errorLogsRaw: Array<{ id: string; toolSlug: string | null; errorMsg: string | null; createdAt: Date }> =
        await delegate.findMany({
          where: { type: "error", ...rangeWhere },
          orderBy: { createdAt: "desc" },
          take: 30,
          select: { id: true, toolSlug: true, errorMsg: true, createdAt: true },
        });

      errorLogs = errorLogsRaw.map((err) => ({
        id: err.id,
        toolSlug: err.toolSlug || undefined,
        errorMsg: err.errorMsg || "Unknown client error",
        createdAt: err.createdAt.toISOString(),
      }));

      totalErrors = await delegate.count({
        where: { type: "error", ...rangeWhere },
      }).catch(() => errorLogs.length);

      const errorsPerToolMap: Record<string, number> = {};
      errorLogs.forEach((err) => {
        if (err.toolSlug) {
          errorsPerToolMap[err.toolSlug] = (errorsPerToolMap[err.toolSlug] || 0) + 1;
        }
      });

      toolErrorRates = Object.entries(errorsPerToolMap).map(([slug, errors]) => {
        const uses = usageMap[slug] || 0;
        const errorRate = uses > 0 ? parseFloat(((errors / uses) * 100).toFixed(1)) : 100;
        return { slug, errors, uses, errorRate };
      });
    } catch (healthErr) {
      console.warn("[analytics-db] Tech health query error:", healthErr);
    }

    // ── 5. Feedback Queries ─────────────────────────────────────────────────
    let feedback: StoredFeedback[] = [];
    try {
      const feedbackRaw: Array<{ id: string; toolSlug: string | null; isHelpful: boolean | null; comment: string | null; createdAt: Date }> =
        await delegate.findMany({
          where: { type: "feedback", toolSlug: { not: null }, ...rangeWhere },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: { id: true, toolSlug: true, isHelpful: true, comment: true, createdAt: true },
        });

      feedback = feedbackRaw.map((f) => ({
        id: f.id,
        toolSlug: f.toolSlug!,
        isHelpful: !!f.isHelpful,
        comment: f.comment || undefined,
        createdAt: f.createdAt.toISOString(),
      }));
    } catch (feedbackErr) {
      console.warn("[analytics-db] Feedback query error:", feedbackErr);
    }

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
    return defaultSummary;
  }
}
