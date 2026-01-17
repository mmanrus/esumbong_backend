import multer from "multer";
import path from "path";
import { Router } from "express";
const router = new Router();

import * as concernPost from "../controllers/concern/concern.post.js";
import * as concernQuery from "../controllers/concern/concern.Query.js";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/auth.middleware.js";

// 📂 Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/concerns"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

// 🧠 File filter (optional but recommended)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "video/mp4"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, or MP4 allowed."));
  }
};

// ✅ Initialize Multer
const upload = multer({ storage, fileFilter });

router.post(
  "/",
  (req, res, next) => {
    console.log("Incoming request:", req.body);
    next();
  },
  authenticateToken,
  authorizeRole("resident"),
  upload.array("files", 5),
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
