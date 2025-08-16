import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import {
  getNotifications,
  readNotification,
  readAllNotifications,
  removeNotification,
  storePushToken,
  getUserPushTokens,
  deletePushToken,
} from "../controllers/notification.controller";

const router = Router();

router.use(verifyJWT);

// Get all notifications for the logged-in user
router.get("/", getNotifications);

// Mark all notifications as read
router.patch("/read-all", readAllNotifications);
router
  .route("/push-token")
  .post(verifyJWT, storePushToken)
  .get(verifyJWT, getUserPushTokens)
  .delete(verifyJWT, deletePushToken);

// Delete a notification (soft delete)
router.delete("/:id", removeNotification);

// Mark a notification as read
router.patch("/:id/read", readNotification);

export default router;
