import * as NotificationService from "../../services/notification.service.js"

export const deleteNotification = async (req, res) => {
     try {
          const { id } = req.body
          const deleted = await NotificationService.deleteNotification(id)
          return res.status(200).json(deleted)
     }catch (error) {
          console.error("Error uppon deleting a notification")
          return res.status(500).json({
               error: "An server error has occured."
          })
     }
}

export const deleteAllUserNotifications = async (req, res) => {
     const userId = req.user?.userId
     try {
          const count = await NotificationService.deleteAllUserNotifications(userId)
          return res.status(200).json(count)
     } catch (error) {
          console.error("Error upon deleting all notifications")
          return res.status(500).json({
               error: "A server error has occured."
          })
     }

}