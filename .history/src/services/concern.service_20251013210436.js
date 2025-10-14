import PrismaClient from "@prisma/client";

const prisma = new PrismaClient();

export const createConcern = async (data, categoryId, userId) => {
  const concernData = {
     title: data.title,
     details: data.title,
     userId,
     ...(categoryId && { categoryId})
  }
  const newConcern = await prisma.concern.create({
    data: concernData,
  });

  await prisma.notification.create({
     data: {
          type: "concern",
     }
  })
};
