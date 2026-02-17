import prisma from "../lib/prisma.js"
import { AppError } from "../lib/error.js";
import { sendConcernEmail } from "../lib/email.js";
import { sendToUser } from "../lib/ws.js"
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
          data.media?.map((m) => ({
            url: m.url,
            name: m.name ?? null,
            fileSize: m.size ?? null,
            fileType: m.type ?? null,
            type: m.type?.startsWith("image")
              ? "photo"
              : m.type?.startsWith("video")
                ? "video"
                : "file",
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
      sendToUser(official.id, {
        type: "NEW_NOTIFICATION",
        notification: { url, message, itemId: newConcern.id, type: "concern" }
      })
      if (!process.env.RESEND_API_KEY) return; // Skip email if API key is not set
      await sendConcernEmail(
        official.email,
        official.fullname,
        data.title,
        "filed",
        data.details,
        url,
        data.files
      );
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
    throw new AppError("Unauthorized", 401)
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
  sendToUser(resident.user.userId, {
    type: "NEW_NOTIFICATION",
    notification: { url, message: `Your concern has been ${data.status}`, type: "concern" }
  })
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
      id: true,
      user: {
        select: {
          id: true,
          fullname: true,
          contactNumber: true,
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
      other: true,
      status: true,
      validation: true,
      details: true,
      issuedAt: true,
      needsBarangayAssistance: true,
      updatedAt: true,
    },
  });
  return concern;
};
export const getAllConcerns = async ({ search, status, archived, validation, recent }) => {
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

        // 🔹 Recent filter
        recent !== undefined ? { updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } : {},

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
  const user = await prisma.user.findFirst({
    where: {
      id: userId
    }
  })
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return await prisma.concern.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      updatedAt: 'desc'
    }
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

  sendToUser(updatedConcern.user.id, {
    type: "NEW_NOTIFICATION",
    notification: { url, message, itemId: updatedConcern.id, type: "concern" }
  })

  if (process.env.RESEND_API_KEY) {
    await sendConcernEmail(
      updatedConcern.user.email,  // to
      updatedConcern.user.fullname, // fullname
      updatedConcern.title,        // title
      action,                      // action (e.g., "approved", "rejected")
      updatedConcern.details,      // details
      url                           // link to concern
    );
  }



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
      if (process.env.RESEND_API_KEY) {
        await sendConcernEmail(
          official.email,             // to
          official.fullname,          // fullname
          updatedConcern.title,       // title
          action,                     // action (e.g., "approved", "rejected")
          updatedConcern.details,     // details
          url                         // link to concern
        );
      }
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
  sendToUser(concern.user.id, {
    type: "NEW_NOTIFICATION",
    notification: {  message, type: "concern", userId: concern.user.id }
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

    })
  )
  await prisma.concern.delete({
    where: {
      id: concernId
    }
  })
  return
}


export const getUpdatedConcerns = async (userId) => {

  const user = await prisma.user.findFirst({
    where: {
      id: userId
    },
    select: {
      id: true,
    }
  })
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const id = user.id;
  const concernHistories = await prisma.concernUpdate.findMany({
    where: {
      concern: {
        userId: id,
      }
    },
    select: {
      concernId: true,
      createdAt: true,
      status: true,
      concern: {
        select: {
          title: true,
          other: true,
          category: {
            select: {
              name: true,
            }
          }
        }
      }
    }
  })
  console.log("Concern histories fetched:", concernHistories)
  return concernHistories;
}