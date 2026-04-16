// middleware/superAdmin.middleware.js
export const requireSuperAdmin = (req, res, next) => {
  try {
    console.log("req.user:", req.user); // add this
    if (!req.user || req.user.type !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. SuperAdmin only.",
      });
    }
    if (!req.user || req.user.type !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. SuperAdmin only.",
      });
    }
    next();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("SuperAdmin middleware error:", error);
    }
    return res.status(500).json({
      error: "An internal server error has occurred.",
    });
  }
};



export const barangayScope = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    // superAdmin has no barangayId — they operate across all barangays
    if (req.user.type === "superAdmin") {
      req.barangayId = null;
      return next();
    }

    if (!req.user.barangayId) {
      return res.status(403).json({
        error: "User is not assigned to any barangay.",
      });
    }

    req.barangayId = req.user.barangayId;
    next();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Barangay scope middleware error:", error);
    }
    return res.status(500).json({
      error: "An internal server error has occurred.",
    });
  }
};