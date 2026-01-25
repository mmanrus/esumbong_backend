import * as userController from "../controllers/user/user.controller.js";

import * as userQuery from "../controllers/user/user.query.js";
import prisma from "../lib/prisma.js"
import cookieParser from "cookie-parser";

import { Router } from "express";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/auth.middleware.js";

const router = Router();
router.use(cookieParser());

router.post(
  "/login",
  (req, res, next) => {
    console.log("Incoming request:", req.body);
    next();
  },
  userController.loginUser
);

// User Registration
router.post(
  "/",
  (req, res, next) => {
    console.log("Incoming request:", req.body);
    next();
  },
  userController.createUser
);



router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    // Verify refresh token
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // Create new access token
    const newAccessToken = jwt.sign(
      { userId: payload.userId, type: payload.type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie and return token
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      maxAge: 3600 * 1000, // 1 hour in ms
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({ access: newAccessToken });
  } catch (err) {
    console.error("Refresh token failed:", err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.patch(
  "/:id",
  authenticateToken,
  async (req, res, next) => {
    const loggedInUserId = req.user.userId
    const targetUserId = req.params.id
    const user = await prisma.user.findUnique({
      where: { id: parseInt(loggedInUserId) },
      select: {
        type: true
      }
    })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    if (user.type === "admin") {
      next()
    }
    if (loggedInUserId === targetUserId) {
      return next()
    }
  },
  userController.updateUserById
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  userController.deleteUserById
);
router.get("/", authenticateToken, userQuery.getAllUsers);
router.get("/me", authenticateToken, userQuery.getMe)
router.get("/:id", authenticateToken, userQuery.getUserById);

export default router;
