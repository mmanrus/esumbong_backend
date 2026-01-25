import prisma from "../lib/prisma.js"
import { transporter } from "../lib/email.js";
const baseUrl = process.env.FRONTEND_URL;

export const createConcern = async (data, categoryId, userId) => {
  const newConcern = await prisma.concern.create({
    data: {
      title: data.title,
      details: data.details,
      needsBarangayAssistance: data.needsBarangayAssistance,
      userId,
      ...(categoryId && { categoryId }),
      media: {
        create:
          data.files?.map((file) => ({
            url: `${process.env.BASE_URL}${file.url}`,
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
          itemId: newConcern.id,
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
         ${data.files?.length
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
  console.log("Fetching concern with ID:", concernId);
  const concern = await prisma.concern.findFirst({
    where: {
      id: parseInt(concernId),
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
          type: true,
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
      validation: true,
      details: true,
      issuedAt: true,
      needsBarangayAssistance: true,
      updatedAt: true,
    },
  });
  console.log("Fetched concern:", concern);
  return concern;
};
export const getAllConcerns = async ({ search, status, archived, validation }) => {
  return prisma.concern.findMany({
    where: {
      AND: [
        // 🔹 Validation filter
        ["approved", "pending", "rejected"].includes(status)
          ? { validation: status }
          : {},

        // 🔹 Status filter
        ["assigned", "resolved", "validated"].includes(status)
          ? { status }
          : {},

        // 🔹 Search filter
        search
          ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { details: { contains: search, mode: "insensitive" } },
              {
                user: {
                  fullname: { contains: search, mode: "insensitive" },
                },
              },
              {
                category: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
          : {},
        archived !== undefined ? {
          isArchived: archived
        } : {},
        validation !== undefined ? {
          validation: validation
        } : {},
      ],
    },
    select: {
      id: true,
      validation: true,
      validatedBy: {
        select: {
          id: true,
          fullname: true,
        },
      },
      archivedOn: true,
      issuedAt: true,
      title: true,
      details: true,
      status: true,
      isArchived: true,
      needsBarangayAssistance: true,
      user: {
        select: {
          id: true,
          fullname: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      other: true,
    },
    orderBy: {
      issuedAt: "desc",
    },
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

export const validateConcern = async (concernId, action, userId) => {
  const now = new Date();

  // 1️⃣ Update the concern with validation info
  await prisma.concernUpdate.create({
    data: {
      updateMessage: `Concern has been ${action} by the barangay official.`,
      status: action,
      concernId
    }
  })
  const updatedConcern = await prisma.concern.update({
    where: { id: concernId },
    data: {
      validation: action,
      validatedById: userId,
      validatedAt: now,
      status: "inProgress"
    },
    include: {
      user: true, // to get the resident
    },
  });


  const url = `${baseUrl}/concern/${updatedConcern.id}`;
  const message = `Your concern "${updatedConcern.title}" has been ${action}.`;

  // 2️⃣ Notify the resident
  await prisma.notification.create({
    data: {
      url,
      itemId: updatedConcern.id,
      message,
      type: "concern",
      userId: updatedConcern.user.id, // resident who filed it
    },
  });

  await transporter.sendMail({
    from: `"eSumbong" <${process.env.EMAIL_USER}>`,
    to: updatedConcern.user.email,
    subject: `Concern ${action}: ${updatedConcern.title}`,
    html: `
      <p>Hello ${updatedConcern.user.fullname},</p>
      <p>Your concern "${updatedConcern.title}" has been <strong>${action}</strong>.</p>
      <p>Details: ${updatedConcern.details}</p>
      <a href="${url}">View Concern</a>
    `,
  });

  // 3️⃣ Notify all barangay officials (similar to createConcern)
  const officials = await prisma.user.findMany({
    where: { type: "barangay_official" },
    select: { id: true, email: true, fullname: true },
  });
  await Promise.all(
    officials.map(async (official) => {
      await prisma.notification.create({
        data: {
          url,
          itemId: updatedConcern.id,
          message: `${updatedConcern.user.fullname}'s concern has been ${action}.`,
          type: "concern",
          userId: official.id,
        },
      });

      await transporter.sendMail({
        from: `"eSumbong" <${process.env.EMAIL_USER}>`,
        to: official.email,
        subject: `Concern ${action}: ${updatedConcern.title}`,
        html: `
          <p>Hello ${official.fullname},</p>
          <p>The concern "${updatedConcern.title}" by ${updatedConcern.user.fullname} has been <strong>${action}</strong>.</p>
          <p>Details: ${updatedConcern.details}</p>
          <a href="${url}">View Concern</a>
        `,
      });
    })
  );

  return;
};

export const archiveConcern = async (concernId, userId) => {
  const concern = await prisma.concern.findFirst({
    where: {
      id: concernId
    },
    select: {
      isArchived: true
    }
  })
  return await prisma.concern.update({
    where: {
      id: concernId
    },
    data: {
      isArchived: !concern.isArchived,
      ArchivedById: userId,
      archivedOn: new Date()
    }
  })
}

export const getConcernUpdatesById = async (concernId) => {
  return await prisma.concernUpdate.findMany({
    where: {
      concernId
    }
  })
}

export const deleteConcern = async (concernId, userId) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId
    },
    select: {
      id: true,
      fullname: true,
      email: true,
    }
  })
  const concern = await prisma.concern.findFirst({
    where: { id: concernId },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
        }
      }
    }
  })
  const message = `Your concern "${concern.title}" has been deleted.`;

  // 2️⃣ Notify the resident
  await prisma.notification.create({
    data: {
      url: "",
      message,
      type: "concern",
      userId: concern.user.id, // resident who filed it
    },
  });

  await transporter.sendMail({
    from: `"eSumbong" <${process.env.EMAIL_USER}>`,
    to: concern.user.email,
    subject: `Concern has been deleted: ${concern.title}`,
    html: `
      <p>Hello ${concern.user.fullname},</p>
      <p>Your concern "${concern.title}" has been <strong>Deleted</strong>.</p>
      <p>Deleted by: ${user.fullname} email: ${user.email}</p>
      <p>Details: ${concern.details}</p>
    `,
  })

  const officials = await prisma.user.findMany({
    where: {
      type: "barangay_official"
    },
    select: {
      id: true,
      email: true,
      fullname: true,
    }
  })

  await Promise.all(
    officials.map(async (official) => {
      await prisma.notification.create({
        data: {
          url,
          itemId: concern.id,
          message: `${concern.user.fullname}'s concern has been deleted by ${user.fullname === concern.user.fullname ? "the concern compliant" : user.fullname}.`,
          type: "concern",
          userId: official.id,
        },
      });

      await transporter.sendMail({
        from: `"eSumbong" <${process.env.EMAIL_USER}>`,
        to: official.email,
        subject: `Concern deletion: ${concern.title}`,
        html: `
          <p>Hello ${official.fullname},</p>
          <p>The concern "${concern.title}" by ${concern.user.fullname} has been <strong>Deleted</strong>.</p>
          <p>Deleted by: ${user.fullname === concern.user.fullname ? "the concern compliant" : user.fullname}.</p>
        `,
      });
    })
  )
  await prisma.concern.delete({
    where: {
      id: concernId
    }
  })
  return
}