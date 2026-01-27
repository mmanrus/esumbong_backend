
import { Router } from "express";

const router = new Router();

import * as concernPost from "../controllers/concern/concern.post.js";
import * as concernQuery from "../controllers/concern/concern.Query.js";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/auth.middleware.js";

router.post(
  "/",
  authenticateToken,
  authorizeRole("resident"),
  concernPost.createConcern
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["resident", "barangay_official"]),
  concernPost.deleteConcern
)

router.get("/",
  authenticateToken,
  authorizeRole("barangay_official"),
  concernQuery.getAllConcern
)

router.get(
  "/:id",
  authenticateToken,
  concernQuery.getConcernById
);
router.patch("/archive/:id",
  authenticateToken,
  authorizeRole("barangay_official"),
  concernPost.archiveConcern
)
router.patch("/validate/:id",
  authenticateToken,
  authorizeRole("barangay_official"),
  concernPost.validateConcern
)

router.get("/updates/:id",
  authenticateToken,
  concernQuery.getConcernUpdatesById
)

router.get("/user/:id", authenticateToken,
   concernQuery.getConcernsByUserId)
export default router;
