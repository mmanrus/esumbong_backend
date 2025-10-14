import * as notificationService from "../../services/notification.service.js"

export const getUserNotifications = async (req, res) => {
     const userId = req.user.userId
     
     try {
          const notifications = await notificationService.getUserNotifications(userId)
          return res.status(200).json(notification)
     } catch (error) {
          
     }
}