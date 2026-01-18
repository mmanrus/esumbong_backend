
import prisma from "../lib/prisma.js"
const baseUrl = process.env.FRONTEND_URL;

export const createAnnouncement = async (data, userId) => {


    const newAnnouncement = await prisma.announcement.create({
        data: {
            title: data.title,
            content: data.content,
            userId: userId
        }
    })
    const message = `New announcement posted: ${data.title}`
    const url = `${baseUrl}/announcements/${newAnnouncement.id}`;
    const users = await prisma.user.findMany()
    await Promise.all(users.map(async (user) => {
        await prisma.notification.create({
            data: {
                url,
                type: "announcement",
                message,
                userId: user.id
            }
        })
    }))
}




export const updateAnnouncement = async (data, id, userId) => {


    await prisma.createAnnouncement.update({
        where: { id },
        data: {
            title: data.title,
            content: data.content,
            userId: userId,
            updatedAt: new Date()
        }
    })
}

export const deleteAnnouncement = async (id) => {
    await prisma.announcement.delete({
        where: { id }
    })
}
export const getAnnouncementById = async (id) => {
    return await prisma.announcement.findUnique({
        where: { id }
    })
}

export const getAllAnnouncements = async () => {
    return await prisma.announcement.findMany({
        orderBy: { createdAt: "desc" }
    })
}