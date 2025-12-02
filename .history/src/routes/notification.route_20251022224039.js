
import {Router} from "express"
import { authenticateToken } from "../middleware/auth.middleware.js"
import * as notificationQuery from "../controllers/notification/notification.query.js"
import * as notificationPost from "../controllers/notification/notification.post.js"
const router = new Router()

router.get("/", authenticateToken, notificationQuery.getUserNotifications)


router.get("/delete/", authenticateToken, notificationPost.deleteNotification)


router.get("/deleteAll/", authenticateToken, notificationPost.deleteAllUserNotifications)

export default router