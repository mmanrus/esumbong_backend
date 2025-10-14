import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const baseUrl = process.env.FRONTEND_URL;
export const createConcern = async (data, categoryId, userId) => {
  const concernData = {
    title: data.title,
    details: data.details,
    userId,
    ...(categoryId && { categoryId }),
  };
  const newConcern = await prisma.concern.create({
    data: concernData,
    include: {
      user: true,
    },
  });
  const url = `${baseUrl}/concern/${newConcern.id}`;
  const message = `${newConcern.user.fullname} has filed concern.`;
  const officials = await prisma.user.findMany({
    where: {
      type: "barangay_officials",
    },
  });
  const notifications = officials.map((official) => {
    prisma.notification.create({
      data: {
        url,
        message,
        type: "concern",
        userId: official.id,
      },
    });
  });
  await Promise.all(notifications);
};
