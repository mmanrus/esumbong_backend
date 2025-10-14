import PrismaClient from "@prisma/client";

const prisma = new PrismaClient();

export const createConcern = async (data, categoryId, userId) => {
  await prisma.concern.create({
    data: {
      title: data.title,
    },
  });
};
