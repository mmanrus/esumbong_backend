import {PrismaClient} from "@prisma/client";

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
  });
  const url = `${baseUrl}/concern/${newConcern.id}`;
  const message = `${newConcern.user.fullname} has filed concern.`
  await prisma.notification.create({
    data: {
      url,
      message,
      type: "concern",
      prompt: "how to send notifications to all users with type='barangay_official'"
    },
  });
};
