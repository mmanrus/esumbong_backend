import "dotenv/config";
import express from "express";
import cors from "cors";
//! ROUTES
import notificationRouter from "./routes/notification.route.js";
import userRouter from "./routes/user.routes.js";
import concernRouter from "./routes/concern.route.js";
import categoryRouter from "./routes/category.route.js";
import { startListener } from "./lib/notificationListener.js"

await startListener()
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is Missing")
}
const PORT = process.env.PORT || 3005;

// Add these middlewares BEFORE your routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users/", userRouter);

app.use("/api/concern/", concernRouter);

app.use("/api/category/", categoryRouter);

app.use("/api/notification/", notificationRouter);
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("JWT_SECRET from env:", JWT_SECRET);
  console.log("Endpoints:");
  const basePath = "/api/";

  console.log("<<=========== User Router =========>>");
  userRouter.stack.forEach((layer) => {
    // Check if the layer is a router and has a route
    if (layer.route) {
      const route = layer.route;
      const methods = Object.keys(route.methods).join(", ").toUpperCase();
      console.log(
        `- ${methods} http://localhost:${PORT}${basePath}users${route.path}`
      );
    }
  });

  console.log("<<=========== Concern Router =========>>");
  concernRouter.stack.forEach((layer) => {
    // Check if the layer is a router and has a route
    if (layer.route) {
      const route = layer.route;
      const methods = Object.keys(route.methods).join(", ").toUpperCase();
      console.log(
        `- ${methods} http://localhost:${PORT}${basePath}concern${route.path}`
      );
    }
  });

  console.log("<<=========== Notification Router =========>>");
  notificationRouter.stack.forEach((layer) => {
    // Check if the layer is a router and has a route
    if (layer.route) {
      const route = layer.route;
      const methods = Object.keys(route.methods).join(", ").toUpperCase();
      console.log(
        `- ${methods} http://localhost:${PORT}${basePath}notification${route.path}`
      );
    }
  });

  console.log("<<=========== Categpry Router =========>>");
  categoryRouter.stack.forEach((layer) => {
    // Check if the layer is a router and has a route
    if (layer.route) {
      const route = layer.route;
      const methods = Object.keys(route.methods).join(", ").toUpperCase();
      console.log(
        `- ${methods} http://localhost:${PORT}${basePath}category${route.path}`
      );
    }
  });
});
