import * as userController from "../controllers/user/user.controller.js";

import * as userQuery from "../controllers/user/user.query.js";
import prisma from "../lib/prisma.js"
import cookieParser from "cookie-parser";

import { Router } from "express";
import {
  authenticateToken,
  authorizeRole,
} from "../middleware/auth.middleware.js";

const router = Router();
router.use(cookieParser());

router.post(
  "/login",
  userController.loginUser
);

// User Registration
router.post(
  "/",
  userController.createUser
);

router.post("/verification",
  authenticateToken,
  (req, res, next) => { console.log("/verification body=>", req.body); next() },
  userController.sendVerify
)
router.get("/verification",
  authenticateToken,
  userController.checkVerified
)
router.get("/getStats",
  authenticateToken,
  authorizeRole("admin"),
  userController.getStats
)

router.patch("/verification/:userId",
  authenticateToken,
  authorizeRole("admin"),
  userController.verifyUser
)
router.get("/checkPostCount", authenticateToken, userQuery.getPostCount)

router.get("/me", authenticateToken, userQuery.getMe)

router.post("/refresh", userController.refreshToken);

router.patch(
  "/:id",
  authenticateToken,
  async (req, res, next) => {
    const loggedInUserId = req.user?.userId
    const targetUserId = req.params.id
    if (process.env.NODE_ENV === "development") console.log(`PATCHING loggedInUserId ${loggedInUserId}. targetUserId ${targetUserId}`)


    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(loggedInUserId) },
        select: {
          type: true,
          id: true
        }
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }
      if (process.env.NODE_ENV === "development") console.log(`PATCHING userId ${user.id}`)
      if (user.type === "admin") {
        return next()
      }
      if (parseInt(loggedInUserId) === parseInt(targetUserId)) {
        return next()
      }
      if (process.env.NODE_ENV === "development") console.log(`whats next?`)
      return res.status(403).json({ error: "Forbidden" });
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.log(err)
      return res.status(500).json({ error: "Something went wrong upon updating the profile" })
    }
  },
  userController.updateUserById
);
// In your users router
router.get("/:id/photo", authenticateToken, userController.getUserPhoto);
router.patch("/:id/photo", authenticateToken, userController.updateUserPhoto);

router.post("/:id/change-password", authenticateToken, userController.changePassword);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  userController.deleteUserById
);
router.get("/", authenticateToken, userQuery.getAllUsers);
router.get("/:id", authenticateToken, userQuery.getUserById);

export default router;
