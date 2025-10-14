import * as userController from "../controllers/user/user.controller.js";

import * as userQuery from "../controllers/user/user.query.js";

import { Router } from "express";
import {
  authenticateToken,
  authorizeRole,
} from "../middleware/auth.middleware.js";
