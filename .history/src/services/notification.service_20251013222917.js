import PrismaClient from "@prisma/client";

const prisma = new PrismaClient();

export const getNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId: parseInt(userId) },
    select: {
      id: true,
      url: true,
      message: true,
      createdAt: true,
    },
    orderBy: {
     createdAt: "desc"
    }
  });
};

export const deleteNotification = async (id) => {
  return await prisma.notification.delete({
    where: parseInt(id),
  });
};
