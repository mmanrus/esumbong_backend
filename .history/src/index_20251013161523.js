import dotenv from "dotenv";
import express from "express";
import cors from "cors";
//! ROUTES
import userRouter from "./routes/user.routes.js";
dotenv.config();



// Add these middlewares BEFORE your routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;
app.use("/api/users/", userRouter);
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
});
