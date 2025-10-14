import * as userController from "../controllers/user/user.controller.js";

import * as userQuery from "../controllers/user/user.query.js";

import { Router } from "express";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/login",
  (req, res, next) => {
    console.log("Incoming request:", req.body);
    next();
  },
  userController.loginUser
);

router.post(
  "/",
  (req, res, next) => {
    console.log("Incoming request:", req.body);
    next();
  },
  userController.createUser
);

router.post("/refresh", userController.refreshAccessToken);

router.put(
  "/:id",
  authenticateToken,
  authorizeUser("user", "id"),
  userController.updateUserById
);
router.delete(
  "/id",
  authenticateToken,
  authorizeUser("user", "id"),
  userController.deleteUserById
);
router.get("/", authenticateToken, userQuery.getAllUsers);

router.get("/:id", authenticateToken, userQuery.getUserById);

router.get("/", authenticateToken, userQuery.queryUsers);

export default router;
