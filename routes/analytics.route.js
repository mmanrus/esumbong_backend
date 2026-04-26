import { Router } from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.middleware.js";
import * as analyticsController from "../controllers/analytics/analytics.controller.js";

const router = new Router();

// GET /api/analytics/concerns — concern breakdown, trends, categories
router.get(
  "/concerns",
  authenticateToken,
  authorizeRole(["admin", "barangay_official"]),
  analyticsController.getConcernAnalytics
);

// GET /api/analytics/overview — high-level KPIs
router.get(
  "/overview",
  authenticateToken,
  authorizeRole(["admin", "barangay_official"]),
  analyticsController.getOverview
);

export default router;