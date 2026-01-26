
import { Router } from "express";

import serverless from "serverless-http";
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
  (req, res, next) => {
    console.log("Incoming request:", req.body);
    next();
  },
  authenticateToken,
  authorizeRole("resident"),
  concernPost.createConcern
);

router.delete(
  "/:id",
  (req, res, next) => {
    console.log("Incoming request Deleting Concern:", req.params);
    next();
  },
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
  (req, _, next) => {
    console.log("Incoming request:", req.params);
    next();
  },
  authenticateToken,
  concernQuery.getConcernById
);
router.patch("/archive/:id",
  (req, _, next) => {
    console.log("Incoming request Archiving:", req.params);
    next();
  },
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

export default router;
