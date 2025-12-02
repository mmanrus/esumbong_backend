import Prisma from "@prisma/client";

const prisma = new Prisma();

export const createCategory = async (categories) => {
  return await prisma.category.createMany({
    data: categories.map((category) => ({
      name: category.name,
      description: category.description,
    })),
    skipDuplicates: true,
  });
};
