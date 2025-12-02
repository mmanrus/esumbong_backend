import PrismaClient from "@prisma/client";

const prisma = new PrismaClient();

export const createCategory = async (categories) => {
  return await prisma.category.createMany({
    data: categories.map((category) => ({
      name: category.name,
      description: category.description,
    })),
    skipDuplicates: true,
  });
};

export const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: {
      id,
    },
  });
};

export const getAllCategory = async () => {
  return await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
};
