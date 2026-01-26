import "dotenv/config";
import express from "express";
import cors from "cors";
//! ROUTES
import notificationRouter from "./routes/notification.route.js";
import userRouter from "./routes/user.routes.js";
import concernRouter from "./routes/concern.route.js";
import categoryRouter from "./routes/category.route.js";
import multer from "multer"
import announcementRouter from "./routes/announcement.route.js";
import path from "path"
import summonRouter from "./routes/summon.route.js";
import { startListener } from "./lib/notificationListener.js"
console.log("DATABASE_URL:", process.env.DATABASE_URL_NEON);

await startListener()

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is Missing")
}
const PORT = process.env.PORT || 3005;

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
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


app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message.includes("Invalid file type")) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

app.use("/api/announcements/", announcementRouter);



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("JWT_SECRET from env:", JWT_SECRET);
  console.log("Endpoints:");
  const basePath = "/api/";
});
