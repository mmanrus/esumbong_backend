import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const baseUrl = process.env.FRONTEND_URL;

export const createFeedback = async (data, userId) => {
    const newFeedback = await prisma.feedBack.create({
        data: {
            content: data.content,
            userId: userId,
            title: data.title,
            suggestions: data.suggestions,
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
    })
    const url = `${baseUrl}/feedback/${newConcern.id}`;
    const message = `${newFeedback.user.fullname} has a feedback.`;
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
                    type: "feedback",
                    userId: official.id,
                },
            });
        })
    );
    return newFeedback;
}
export const getFeedbackByUserId = async (userId) => {
    return await prisma.feedback.findMany({
        where: {
            userId
        }
    })
}

export const getAllFeedbacks = async () => {
    return await prisma.feedback.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export const updateFeedbackStatus = async (feedbackId, status) => {
    prisma.feedback.update({
        
    })
}