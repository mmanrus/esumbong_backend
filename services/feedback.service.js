import prisma from "../lib/prisma.js"
const baseUrl = process.env.FRONTEND_URL;
import { UserType } from "@prisma/client";


export const createFeedback = async (data, userId) => {
    const newFeedback = await prisma.feedback.create({
        data: {
            userId: userId,
            title: data.title,
            feedback: data.feedback,
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
    })
    const url = `${baseUrl}/feedback/${newFeedback.id}`;
    const message = `${newFeedback.user.fullname} has a feedback.`;
    console.log("finding users")
    const users = await prisma.user.findMany({
        where: {
            type: {
                in: [UserType.barangay_official, UserType.admin],
            },
        },
    });


    await Promise.all(
        users.map((u) => {
            prisma.notification.create({
                data: {
                    url,
                    message,
                    type: "feedback",
                    userId: u.id,
                },
            });
        })

    );
    return newFeedback;
}
export const getFeedbackById = async (id) => {
    return await prisma.feedback.findUnique({
        where: {
            id: id
        },
        
        select: {
            id: true,
            title: true,
            feedback: true,
            issuedAt: true,
            media: true,
            user: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    contactNumber: true
                }
            }
        }
    })
}

export const getFeedbackByUserOrAll = async (me, userId = 0) => {
    if (me === "true") {
        return await prisma.feedback.findMany({
            where: {
                id: userId
            },
            select: {
                id: true,
                title: true,
                issuedAt: true,
            },
            orderBy: {
                issuedAt: 'desc'
            }
        })
    }

    return await prisma.feedback.findMany({
        orderBy: {
            issuedAt: 'desc'

        },
        select: {
            id: true,
            title: true,
            issuedAt: true,
        },
    })
}

export const updateFeedbackStatus = async (feedbackId, title, feedback) => {
    await prisma.feedback.update({
        where: {
            id: feedbackId
        },
        data: {
            title: title,
            feedback: feedback
        }
    })
    return
}

export const deleteFeedback = async (feedbackId) => {
    return await prisma.feedback.delete({
        where: {
            id: feedbackId
        }
    })
}