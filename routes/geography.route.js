import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireSuperAdmin } from "../middleware/superAdmin.middleware.js";
import * as geographyController from "../controllers/geography/geography.controller.js";

const router = Router();


router.get("/island-groups", geographyController.getIslandGroups);
router.get("/regions", geographyController.getRegions);
router.get("/provinces", geographyController.getProvinces);
router.get("/municipalities", geographyController.getMunicipalities);

router.get("/barangays", geographyController.getBarangays);
router.post("/municipality", authenticateToken, requireSuperAdmin, geographyController.createMunicipality);
//router.delete("/municipality/:id", geographyController.deleteMunicipality);
router.post("/barangay", authenticateToken, requireSuperAdmin, geographyController.createBarangay);
router.delete("/barangay/:id", authenticateToken, requireSuperAdmin, geographyController.deleteBarangay);


export default router;