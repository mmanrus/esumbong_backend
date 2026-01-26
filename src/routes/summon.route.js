

import { Router } from "express";
const router = new Router();
import * as summonPost from "../controllers/summon/summon.post.js"

import {
    authenticateToken,
    authorizeRole,
    authorizeUser,
} from "../middleware/auth.middleware.js";

router.post(
    "/:id",
    (req, res, next) => {
        console.log("Incoming Summon request:", req.body);
        next();
    },
    authenticateToken,
    authorizeRole("barangay_official"),
    summonPost.summonResident
);


export default router