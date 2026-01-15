
import multer from "multer";
import path from "path";
import { Router } from "express";
const router = new Router();
import * as summonPost from "../controllers/summon/summon.post.js"
// 📂 Configure Multer storage
import {
    authenticateToken,
    authorizeRole,
    authorizeUser,
} from "../middleware/auth.middleware.js";
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
    const allowed = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Invalid file type. Only JPEG, PNG, PDF, or DOCX allowed."),
            false
        );
    }
};

// ✅ Initialize Multer
const upload = multer({ storage, fileFilter });

router.post(
    "/:id",
    (req, res, next) => {
        console.log("Incoming Summon request:", req.body);
        next();
    },
    authenticateToken,
    authorizeRole("barangay_official"),
    upload.array("files", 5),
    summonPost.summonResident
);


export default router