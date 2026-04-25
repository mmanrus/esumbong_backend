import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getHotlines = async (req, res) => {
  const barangayId = parseInt(req.query.barangayId);
  if (!barangayId) {
    return res.status(400).json({ error: "barangayId is required" });
  }
  try {
    const hotlines = await prisma.hotline.findMany({
      where: { barangayId },
      orderBy: { order: "asc" },
    });
    return res.json(hotlines);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch hotlines" });
  }
};

export const createHotline = async (req, res) => {
  const { label, number, icon, bgColor, borderColor, textColor, iconBg } = req.body;
  const barangayId = parseInt(req.user.barangayId);

  if (!barangayId) return res.status(400).json({ error: "No barangay assigned" });
  if (!label || !number || !icon) {
    return res.status(400).json({ error: "label, number, and icon are required" });
  }

  try {
    // Put new hotline at the end
    const count = await prisma.hotline.count({ where: { barangayId } });
    const hotline = await prisma.hotline.create({
      data: {
        label, number, icon,
        bgColor: bgColor || "bg-blue-50",
        borderColor: borderColor || "border-blue-200",
        textColor: textColor || "text-blue-700",
        iconBg: iconBg || "bg-blue-500",
        order: count,
        barangayId,
      },
    });
    return res.status(201).json(hotline);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create hotline" });
  }
};

export const updateHotline = async (req, res) => {
  const id = parseInt(req.params.id);
  const barangayId = parseInt(req.user.barangayId);
  const { label, number, icon, bgColor, borderColor, textColor, iconBg } = req.body;

  try {
    // Make sure the hotline belongs to this barangay
    const existing = await prisma.hotline.findFirst({ where: { id, barangayId } });
    if (!existing) return res.status(404).json({ error: "Hotline not found" });

    const updated = await prisma.hotline.update({
      where: { id },
      data: { label, number, icon, bgColor, borderColor, textColor, iconBg },
    });
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update hotline" });
  }
};

export const deleteHotline = async (req, res) => {
  const id = parseInt(req.params.id);
  const barangayId = parseInt(req.user.barangayId);

  try {
    const existing = await prisma.hotline.findFirst({ where: { id, barangayId } });
    if (!existing) return res.status(404).json({ error: "Hotline not found" });

    await prisma.hotline.delete({ where: { id } });
    return res.json({ message: "Hotline deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete hotline" });
  }
};

export const reorderHotlines = async (req, res) => {
  // orderedIds: [{ id: number, order: number }]
  const { orderedIds } = req.body;
  const barangayId = parseInt(req.user.barangayId);

  try {
    await Promise.all(
      orderedIds.map(({ id, order }) =>
        prisma.hotline.updateMany({
          where: { id, barangayId },
          data: { order },
        })
      )
    );
    return res.json({ message: "Reordered" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to reorder" });
  }
};