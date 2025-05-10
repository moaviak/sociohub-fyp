import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import {
  getNotifications,
  readNotification,
  readAllNotifications,
  removeNotification,
} from "../controllers/notification.controller";

const router = Router();

router.use(verifyJWT);

// Get all notifications for the logged-in user
router.get("/", getNotifications);

// Mark a notification as read
router.patch("/:id/read", readNotification);

// Mark all notifications as read
router.patch("/read-all", readAllNotifications);

// Delete a notification (soft delete)
router.delete("/:id", removeNotification);

export default router;
