import prisma from "../../lib/prisma.js";

// GET /api/geography/island-groups
export const getIslandGroups = async (req, res) => {
    try {
        const islandGroups = await prisma.islandGroup.findMany({
            include: { _count: { select: { regions: true } } },
            orderBy: { name: "asc" },
        });
        return res.status(200).json(islandGroups);
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error fetching island groups:", error);
        }
        return res.status(500).json({ error: "An internal server error has occurred." });
    }
};

// POST /api/geography/municipality
export const createMunicipality = async (req, res) => {
    try {
        const { name, provinceId } = req.body;
        if (!name || !provinceId) {
            return res.status(400).json({ error: "name and provinceId are required." });
        }

        const province = await prisma.province.findUnique({ where: { id: parseInt(provinceId) } });
        if (!province) return res.status(404).json({ error: "Province not found." });

        const existing = await prisma.municipality.findFirst({
            where: { name: { equals: name.trim(), mode: "insensitive" }, provinceId: parseInt(provinceId) },
        });
        if (existing) {
            return res.status(409).json({ error: "A municipality with that name already exists in this province." });
        }

        const municipality = await prisma.municipality.create({
            data: { name: name.trim(), provinceId: parseInt(provinceId) },
            include: { _count: { select: { barangays: true } } },
        });

        return res.status(201).json(municipality);
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("Error creating municipality:", error);
        return res.status(500).json({ error: "An internal server error has occurred." });
    }
};

// GET /api/geography/regions?islandGroupId=1
export const getRegions = async (req, res) => {
    try {
        const { islandGroupId } = req.query;

        const regions = await prisma.region.findMany({
            where: islandGroupId ? { islandGroupId: parseInt(islandGroupId) } : undefined,
            include: {
                islandGroup: { select: { name: true } },
                _count: { select: { provinces: true } },
            },
            orderBy: { name: "asc" },
        });

        return res.status(200).json(regions);
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error fetching regions:", error);
        }
        return res.status(500).json({ error: "An internal server error has occurred." });
    }
};

// GET /api/geography/provinces?regionId=1
export const getProvinces = async (req, res) => {
    try {
        const { regionId } = req.query;

        const provinces = await prisma.province.findMany({
            where: regionId ? { regionId: parseInt(regionId) } : undefined,
            include: {
                region: { select: { name: true, code: true } },
                _count: { select: { municipalities: true } },
            },
            orderBy: { name: "asc" },
        });

        return res.status(200).json(provinces);
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error fetching provinces:", error);
        }
        return res.status(500).json({ error: "An internal server error has occurred." });
    }
};

// GET /api/geography/municipalities?provinceId=1
export const getMunicipalities = async (req, res) => {
    try {
        const { provinceId } = req.query;

        const municipalities = await prisma.municipality.findMany({
            where: provinceId ? { provinceId: parseInt(provinceId) } : undefined,
            include: {
                province: { select: { name: true } },
                _count: { select: { barangays: true } },
            },
            orderBy: { name: "asc" },
        });

        return res.status(200).json(municipalities);
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error fetching municipalities:", error);
        }
        return res.status(500).json({ error: "An internal server error has occurred." });
    }
};

// GET /api/geography/barangays?municipalityId=1
export const getBarangays = async (req, res) => {
    try {
        const { municipalityId } = req.query;

        const barangays = await prisma.barangay.findMany({
            where: municipalityId ? { municipalityId: parseInt(municipalityId) } : undefined,
            include: {
                municipality: {
                    select: {
                        name: true,
                        province: { select: { name: true } },
                    },
                },
                _count: { select: { users: true, concerns: true } },
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


export const createBarangay = async (req, res) => {
    try {
        const { name, municipalityId } = req.body;

        if (!name || !municipalityId) {
            return res.status(400).json({ error: "name and municipalityId are required." });
        }

        const municipality = await prisma.municipality.findUnique({
            where: { id: parseInt(municipalityId) },
        });
        if (!municipality) {
            return res.status(404).json({ error: "Municipality not found." });
        }

        const existing = await prisma.barangay.findFirst({
            where: { name: { equals: name.trim(), mode: "insensitive" }, municipalityId: parseInt(municipalityId) },
        });
        if (existing) {
            return res.status(409).json({ error: "A barangay with that name already exists in this municipality." });
        }

        const barangay = await prisma.barangay.create({
            data: { name: name.trim(), municipalityId: parseInt(municipalityId) },
            include: { _count: { select: { users: true, concerns: true } } },
        });

        return res.status(201).json(barangay);
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("Error creating barangay:", error);
        return res.status(500).json({ error: "An internal server error has occurred." });
    }
};

// DELETE /api/geography/barangay/:id
export const deleteBarangay = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid barangay ID." });

        const barangay = await prisma.barangay.findUnique({ where: { id } });
        if (!barangay) return res.status(404).json({ error: "Barangay not found." });

        // Safety check — don't delete if it has active users or concerns
        const userCount = await prisma.user.count({ where: { barangayId: id } });
        if (userCount > 0) {
            return res.status(409).json({
                error: `Cannot delete — this barangay has ${userCount} registered user(s). Reassign or remove them first.`,
            });
        }

        await prisma.barangay.delete({ where: { id } });
        return res.status(204).send();
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("Error deleting barangay:", error);
        return res.status(500).json({ error: "An internal server error has occurred." });
    }
};