import { Router } from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.middleware.js";
import * as hotlineController from "../controllers/hotline/hotline.controller.js";

const router = new Router();

// Public — used by landing page (pass barangayId as query param)
router.get("/", hotlineController.getHotlines);

// Admin/official only — manage hotlines
router.post("/",
  authenticateToken,
  authorizeRole("admin", "barangay_official"),
  hotlineController.createHotline
);
router.patch("/:id",
  authenticateToken,
  authorizeRole("admin", "barangay_official"),
  hotlineController.updateHotline
);
router.delete("/:id",
  authenticateToken,
  authorizeRole("admin", "barangay_official"),
  hotlineController.deleteHotline
);
router.patch("/reorder",
  authenticateToken,
  authorizeRole("admin", "barangay_official"),
  hotlineController.reorderHotlines
);

export default router;