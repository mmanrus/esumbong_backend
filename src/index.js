import "dotenv/config";
import express from "express";
import cors from "cors";
//! ROUTES
import notificationRouter from "./routes/notification.route.js";
import userRouter from "./routes/user.routes.js";
import concernRouter from "./routes/concern.route.js";
import categoryRouter from "./routes/category.route.js";
//import multer from "multer"
import announcementRouter from "./routes/announcement.route.js";

import summonRouter from "./routes/summon.route.js";
//import { startListener } from "./lib/notificationListener.js"

//await startListener()

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is Missing")
}

// Add these middlewares BEFORE your routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users/", userRouter);

app.use("/api/concern/", concernRouter);

app.use("/api/category/", categoryRouter);
app.use("/api/summon/", summonRouter);

app.use("/api/notification/", notificationRouter);
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});
app.use("/api/announcements/", announcementRouter);

export default app;