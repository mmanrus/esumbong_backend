import PrismaClient from "@prisma/client";

const prisma = new PrismaClient();
const url = process.env.FRONTEND_URL
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
  const url = ""
  await prisma.notification.create({
     data: {
          type: "concern",
     }
  })
};
