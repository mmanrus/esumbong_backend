
import {Router} from "express"
import { authenticateToken } from "../middleware/auth.middleware.js"
import * as notificationQuery from "../controllers/notification/notification.query.js"
const router = new Router()

router.get("/", authenticateToken, notificationQuery.getUserNotifications)

export default router