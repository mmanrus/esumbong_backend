import serverless from "serverless-http";

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
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server is running!" });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users/", userRouter);

app.use("/concern/", concernRouter);

app.use("/category/", categoryRouter);
app.use("/summon/", summonRouter);

app.use("/notification/", notificationRouter);

app.use("/announcements/", announcementRouter);

export default serverless(app);