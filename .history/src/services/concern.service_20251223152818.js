import { PrismaClient } from "@prisma/client";
import { transporter } from "../lib/email.js";
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
        create:
          data.files?.map((file) => ({
            url: file.url,
            type: file.type,
          })) || [],
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
      type: "barangay_official",
    },
    select: {
      id: true,
      email: true,
      fullname: true,
    },
  });

  await Promise.all(
    officials.map(async (official) => {
      await prisma.notification.create({
        data: {
          url,
          message,
          type: "concern",
          userId: official.id,
        },
      });
      await transporter.sendMail({
        from: `eSumbong" <${process.env.EMAIL_USER}>`,
        to: official.email,
        subject: `${data.title}`,
        html: `
          <p>Hello ${official.fullname}</p>
          <p>${data.details}</p>
         ${
           data.files?.length
             ? `<p>Attachments:</p>
           <ul>
             ${data.files
               .map(
                 (file) =>
                   `<li><a href="${file.url}" target="_blank">${file.type}</a></li>`
               )
               .join("")}
           </ul>`
             : ""
         }
          <a href="${url}">View Concern</>
        `,
      });
    })
  );
  return newConcern;
};
// !Update COncern
export const updateStatusConcern = async (userId, concernId, data) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      type: "barangay_officials",
    },
  });
  if (user?.type !== "barangay_officials") {
    throw new Error("Unauthorized");
  }
  const updatedConcern = await prisma.concern.update({
    where: {
      id: concernId,
    },
    data: {
      status: data.status,
    },
  });
  const url = `${baseUrl}/concern/${updatedConcern.id}`;
  const updateMessage =
    data.updateMessage ||
    `Concern has been updated by the Officials to status: ${data.status}`;
  const resident = await prisma.concern.findFirst({
    where: {
      id: concernId,
    },
    select: {
      user: {
        userId: true,
        fullname: true,
      },
    },
  });
  await prisma.notification.create({
    data: {
      url: url,
      message: `Your concern has been ${data.status}`,
      type: "concern",
      userId: resident.user.userId,
    },
  });
  const concernUpdate = await prisma.concernUpdate.create({
    data: {
      updateMessage: updateMessage,
      concernId: concernId,
      status: data.status,
    },
  });
  return concernUpdate;
};

export const getConcernById = async (concernId) => {
  const concern = await prisma.concern.findFirst({
    where: {
      id: parseInt(concernId),
    },
    select: {
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
          role: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      title: true,
      media: {
        select: {
          id: true,
          url: true,
          type: true,
        },
      },
      details: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return concern;
};

export const getAllConcerns = async (filter) => {
  return await prisma.concern.findMany({
    where: filter || {},
  });
};

export const getResidentConcerns = async (userId) => {
  return await prisma.concern.findMany({
    where: {
      userId,
    },
  });
};

export const getConcernUpdates = async (concernId) => {
  return await prisma.concernUpdate.findMany({
    where: {
      concernId,
    },
  });
};
