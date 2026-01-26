import "dotenv/config";
import express from "express";
import cors from "cors";
//! ROUTES
import notificationRouter from "./routes/notification.route.js";
import userRouter from "./routes/user.routes.js";
import concernRouter from "./routes/concern.route.js";
import categoryRouter from "./routes/category.route.js";
import announcementRouter from "./routes/announcement.route.js";

import summonRouter from "./routes/summon.route.js";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is Missing")
}

// Add these middlewares BEFORE your routes
app.use(cors({
  origin: `${process.env.FRONTEND_URL}`,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users/", userRouter);

app.use("/api/concern/", concernRouter);

app.use("/api/category/", categoryRouter);
app.use("/api/summon/", summonRouter);

app.use("/api/notification/", notificationRouter);

app.use("/api/announcements/", announcementRouter);

export default app;