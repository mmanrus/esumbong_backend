import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const baseUrl = process.env.FRONTEND_URL;
export const createConcern = async (data, categoryId, userId) => {
  const newConcern = await prisma.concern.create({
    data: {
      title: data.title,
      details: data.details,
      userId,
      ...(categoryId && { categoryId }),
      media: {
        create: data.files?.map((file) => ({
          url: file.url,
          type: file.type,
        })),
      },
    },
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

  await Promise.all(
    officials.map((official) => {
      prisma.notification.create({
        data: {
          url,
          message,
          type: "concern",
          userId: official.id,
        },
      });
    })
  );
  return newConcern;
};
