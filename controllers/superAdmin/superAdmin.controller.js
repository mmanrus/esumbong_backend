import  prisma  from "../../lib/prisma.js";
import bcrypt from "bcrypt";

// GET /api/super-admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const [totalBarangays, totalUsers, totalConcerns, totalFeedback, pendingVerifications] =
      await Promise.all([
        prisma.barangay.count(),
        prisma.user.count({ where: { type: { not: "superAdmin" } } }),
        prisma.concern.count(),
        prisma.feedback.count(),
        prisma.user.count({ where: { isVerified: false, type: "resident" } }),
      ]);

    return res.status(200).json({
      totalBarangays,
      totalUsers,
      totalConcerns,
      totalFeedback,
      pendingVerifications,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching dashboard stats:", error);
    }
    return res.status(500).json({ error: "An internal server error has occurred." });
  }
};

// GET /api/super-admin/barangays
export const getAllBarangays = async (req, res) => {
  try {
    const barangays = await prisma.barangay.findMany({
      include: {
        municipality: {
          include: {
            province: {
              include: { region: { include: { islandGroup: true } } },
            },
          },
        },
        _count: {
          select: { users: true, concerns: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return res.status(200).json(barangays);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching barangays:", error);
    }
    return res.status(500).json({ error: "An internal server error has occurred." });
  }
};

// GET /api/super-admin/barangays/:id/stats
export const getBarangayStats = async (req, res) => {
  try {
    const { id } = req.params;
    const barangayId = parseInt(id);

    if (isNaN(barangayId)) {
      return res.status(400).json({ error: "Invalid barangay ID." });
    }

    const barangay = await prisma.barangay.findUnique({
      where: { id: barangayId },
    });

    if (!barangay) {
      return res.status(404).json({ error: "Barangay not found." });
    }

    const [users, concerns, feedback, assignedAdmin] = await Promise.all([
      prisma.user.count({ where: { barangayId } }),
      prisma.concern.groupBy({
        by: ["status"],
        where: { barangayId },
        _count: { status: true },
      }),
      prisma.feedback.count({ where: { barangayId } }),
      prisma.user.findFirst({
        where: { barangayId, type: "admin" },
        select: { id: true, fullname: true, email: true, isActive: true },
      }),
    ]);

    return res.status(200).json({
      barangay,
      assignedAdmin,
      stats: {
        totalUsers: users,
        totalFeedback: feedback,
        concernsByStatus: concerns,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching barangay stats:", error);
    }
    return res.status(500).json({ error: "An internal server error has occurred." });
  }
};

// GET /api/super-admin/admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { type: "admin" },
      select: {
        id: true,
        fullname: true,
        email: true,
        contactNumber: true,
        isActive: true,
        isVerified: true,
        createAt: true,
        barangayId: true,
        barangay: {
          select: {
            id: true,
            name: true,
            municipality: { select: { name: true } },
          },
        },
      },
      orderBy: { createAt: "desc" },
    });

    return res.status(200).json(admins);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching admins:", error);
    }
    return res.status(500).json({ error: "An internal server error has occurred." });
  }
};

// POST /api/super-admin/admins/assign
// Creates a new admin user and assigns them to a barangay
export const assignAdmin = async (req, res) => {
  try {
    const { fullname, email, password, contactNumber, address, barangayId } = req.body;

    if (!fullname || !email || !password || !contactNumber || !address || !barangayId) {
      return res.status(400).json({
        error: "fullname, email, password, contactNumber, address, and barangayId are required.",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already in use." });
    }

    const barangay = await prisma.barangay.findUnique({ where: { id: parseInt(barangayId) } });
    if (!barangay) {
      return res.status(404).json({ error: "Barangay not found." });
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { barangayId: parseInt(barangayId), type: "admin" },
    });
    if (existingAdmin) {
      return res.status(409).json({
        error: "This barangay already has an assigned admin. Reassign or deactivate them first.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
        contactNumber,
        address,
        type: "admin",
        isVerified: true,
        barangayId: parseInt(barangayId),
        managedById: req.user.id,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        contactNumber: true,
        barangayId: true,
        type: true,
        createAt: true,
      },
    });

    return res.status(201).json(newAdmin);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error assigning admin:", error);
    }
    return res.status(500).json({ error: "An internal server error has occurred." });
  }
};

// PATCH /api/super-admin/admins/:id/reassign
export const reassignAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { barangayId } = req.body;
    const adminId = parseInt(id);

    if (isNaN(adminId) || !barangayId) {
      return res.status(400).json({ error: "Valid admin ID and barangayId are required." });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.type !== "admin") {
      return res.status(404).json({ error: "Admin not found." });
    }

    const barangay = await prisma.barangay.findUnique({ where: { id: parseInt(barangayId) } });
    if (!barangay) {
      return res.status(404).json({ error: "Target barangay not found." });
    }

    const conflictingAdmin = await prisma.user.findFirst({
      where: {
        barangayId: parseInt(barangayId),
        type: "admin",
        id: { not: adminId },
      },
    });
    if (conflictingAdmin) {
      return res.status(409).json({
        error: "Target barangay already has an admin assigned.",
      });
    }

    const updated = await prisma.user.update({
      where: { id: adminId },
      data: { barangayId: parseInt(barangayId) },
      select: { id: true, fullname: true, email: true, barangayId: true },
    });

    return res.status(200).json(updated);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error reassigning admin:", error);
    }
    return res.status(500).json({ error: "An internal server error has occurred." });
  }
};

// PATCH /api/super-admin/admins/:id/deactivate
export const deactivateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = parseInt(id);

    if (isNaN(adminId)) {
      return res.status(400).json({ error: "Invalid admin ID." });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.type !== "admin") {
      return res.status(404).json({ error: "Admin not found." });
    }

    const updated = await prisma.user.update({
      where: { id: adminId },
      data: { isActive: false },
      select: { id: true, fullname: true, email: true, isActive: true },
    });

    return res.status(200).json(updated);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error deactivating admin:", error);
    }
    return res.status(500).json({ error: "An internal server error has occurred." });
  }
};