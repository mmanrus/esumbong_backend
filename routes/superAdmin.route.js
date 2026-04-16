import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireSuperAdmin } from "../middleware/superAdmin.middleware.js";
import * as superAdminController from "../controllers/superAdmin/superAdmin.controller.js";

const router = Router();

// All routes below require a valid JWT + superAdmin type
router.use(authenticateToken, requireSuperAdmin);

router.get("/dashboard", superAdminController.getDashboardStats);

router.get("/barangays", superAdminController.getAllBarangays);
router.get("/barangays/:id/stats", superAdminController.getBarangayStats);

router.get("/admins", superAdminController.getAllAdmins);
router.post("/admins/assign", superAdminController.assignAdmin);
router.patch("/admins/:id/reassign", superAdminController.reassignAdmin);
router.patch("/admins/:id/deactivate", superAdminController.deactivateAdmin);

export default router;