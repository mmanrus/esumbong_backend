import prisma from "../../lib/prisma.js";

/**
 * GET /api/analytics/concerns
 * Returns concern analytics for the authenticated official's barangay.
 * Query params:
 *   range: "7d" | "30d" | "90d" | "1y"  (default: "30d")
 */
export const getConcernAnalytics = async (req, res) => {
  const barangayId = parseInt(req.user.barangayId);
  if (!barangayId) return res.status(400).json({ error: "No barangay assigned" });

  const range = req.query.range ?? "30d";
  const now = new Date();
  const rangeMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
  const days = rangeMap[range] ?? 30;
  const since = new Date(now);
  since.setDate(since.getDate() - days);

  try {
    // ── 1. Status breakdown ──────────────────────────────────────────
    const statusGroups = await prisma.concern.groupBy({
      by: ["status"],
      where: { barangayId, isArchived: false },
      _count: { status: true },
    });
    const statusBreakdown = statusGroups.reduce((acc, g) => {
      acc[g.status] = g._count.status;
      return acc;
    }, {});

    // ── 2. Daily trend within range ──────────────────────────────────
    const concernsInRange = await prisma.concern.findMany({
      where: {
        barangayId,
        isArchived: false,
        issuedAt: { gte: since },
      },
      select: { issuedAt: true, status: true },
      orderBy: { issuedAt: "asc" },
    });

    // Build a daily bucket map
    const bucketCount = range === "1y" ? 12 : days; // monthly for 1y, daily otherwise
    const buckets = [];
    if (range === "1y") {
      // monthly buckets
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        buckets.push({
          label: d.toLocaleDateString("en-PH", { month: "short", year: "2-digit" }),
          year: d.getFullYear(),
          month: d.getMonth(),
          total: 0,
          resolved: 0,
        });
      }
      for (const c of concernsInRange) {
        const d = new Date(c.issuedAt);
        const bucket = buckets.find(
          (b) => b.year === d.getFullYear() && b.month === d.getMonth()
        );
        if (bucket) {
          bucket.total++;
          if (c.status === "resolved") bucket.resolved++;
        }
      }
    } else {
      // daily buckets
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        buckets.push({
          label: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
          dateStr: d.toISOString().slice(0, 10),
          total: 0,
          resolved: 0,
        });
      }
      for (const c of concernsInRange) {
        const dateStr = new Date(c.issuedAt).toISOString().slice(0, 10);
        const bucket = buckets.find((b) => b.dateStr === dateStr);
        if (bucket) {
          bucket.total++;
          if (c.status === "resolved") bucket.resolved++;
        }
      }
    }
    const trend = buckets.map(({ label, total, resolved }) => ({ label, total, resolved }));

    // ── 3. Category breakdown ────────────────────────────────────────
    const categoryGroups = await prisma.concern.groupBy({
      by: ["categoryId"],
      where: { barangayId, isArchived: false },
      _count: { categoryId: true },
    });
    // Fetch category names
    const categoryIds = categoryGroups
      .map((g) => g.categoryId)
      .filter((id) => id !== null);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    const categoryBreakdown = categoryGroups.map((g) => ({
      name: g.categoryId ? (categoryMap[g.categoryId] ?? "Unknown") : "Other",
      count: g._count.categoryId,
    })).sort((a, b) => b.count - a.count).slice(0, 8);

    // ── 4. Resolution rate ───────────────────────────────────────────
    const total = await prisma.concern.count({ where: { barangayId, isArchived: false } });
    const resolved = statusBreakdown["resolved"] ?? 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // ── 5. Avg resolution time (days) ───────────────────────────────
    // Use concerns that have a validatedAt and status=resolved
    const resolvedConcerns = await prisma.concern.findMany({
      where: { barangayId, status: "resolved", validatedAt: { not: null } },
      select: { issuedAt: true, validatedAt: true },
    });
    let avgResolutionDays = null;
    if (resolvedConcerns.length > 0) {
      const totalMs = resolvedConcerns.reduce((sum, c) => {
        return sum + (new Date(c.validatedAt) - new Date(c.issuedAt));
      }, 0);
      avgResolutionDays = +(totalMs / resolvedConcerns.length / 86400000).toFixed(1);
    }

    // ── 6. Anonymous vs named ────────────────────────────────────────
    const anonymousCount = await prisma.concern.count({
      where: { barangayId, isAnonymous: true, isArchived: false },
    });
    const namedCount = total - anonymousCount;

    // ── 7. Spam count ────────────────────────────────────────────────
    const spamCount = await prisma.concern.count({
      where: { barangayId, isSpam: true },
    });

    // ── 8. Needs barangay assistance ─────────────────────────────────
    const needsAssistanceCount = await prisma.concern.count({
      where: { barangayId, needsBarangayAssistance: true, isArchived: false },
    });

    return res.json({
      statusBreakdown,
      trend,
      categoryBreakdown,
      resolutionRate,
      avgResolutionDays,
      anonymousCount,
      namedCount,
      spamCount,
      needsAssistanceCount,
      total,
      range,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

/**
 * GET /api/analytics/overview
 * High-level KPI snapshot for the barangay.
 */
export const getOverview = async (req, res) => {
  const barangayId = parseInt(req.user.barangayId);
  if (!barangayId) return res.status(400).json({ error: "No barangay assigned" });

  try {
    const [totalConcerns, totalFeedback, totalResidents, activeUsers, pendingConcerns] =
      await Promise.all([
        prisma.concern.count({ where: { barangayId, isArchived: false } }),
        prisma.feedback.count({ where: { barangayId } }),
        prisma.user.count({ where: { barangayId, type: "resident" } }),
        prisma.user.count({ where: { barangayId, isActive: true } }),
        prisma.concern.count({ where: { barangayId, status: "pending", isArchived: false } }),
      ]);

    return res.json({
      totalConcerns,
      totalFeedback,
      totalResidents,
      activeUsers,
      pendingConcerns,
    });
  } catch (error) {
    console.error("Overview error:", error);
    return res.status(500).json({ error: "Failed to fetch overview" });
  }
};