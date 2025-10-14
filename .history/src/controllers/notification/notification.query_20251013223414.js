import * as notificationService from "../../services/notification.service.js"

export const getUserNotifications = async (req, res) => {
     const userId = req.user.userId

     try {
          const notifications = await notificationService.getUserNotifications(userId)
          return res.status(200).json(notifications)
     } catch (error) {
          console.error("Error retrieving user notifications", error)
          return res.status(500).json({error: "An internal server error has occured while getting notifications"})
     }
}