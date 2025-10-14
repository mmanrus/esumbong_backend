import multer from "multer";
import path from "path";
import { Router } from "express";
const router = new Router();
import * as concernPost from "../controllers/concern/concern.post.js";

import * as concernQuery from "../controllers/concern/concern.query.js";

import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/auth.middleware.js";

const storage = multer.diskStorage({
  destination: "./uploads/concerns",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

router.post(
  "/",
  (req, res, next) => {
    console.log("Incoming request:", req.body);
    next();
  },
  authenticateToken,
  concernPost.createConcern
);

router.get(
  "/:id",
  (req, res, next) => {
    console.log("Incoming request:", req.body);
    next();
  },
  authenticateToken(),
  concernPost.getConcernById()
);

export const upload = multer({ storage });
