import PrismaClient from "@prisma/client";

const prisma = new PrismaClient();

export const getNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId: parseInt(userId) },
    select: {
          id: true,
          url: true,
          message: true,
          createdAt: true
    }
  });
};
