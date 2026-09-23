import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendDeadlineAlert,
} from "../controllers/notificationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / User authenticated notification endpoints
router.get("/api/notifications", authenticateToken, getUserNotifications);
router.patch("/api/notifications/:id/read", authenticateToken, markNotificationAsRead);
router.post("/api/notifications/read-all", authenticateToken, markAllNotificationsAsRead);

// Deadline email alert trigger
router.post("/api/notifications/send-deadline-alert", sendDeadlineAlert);

export default router;
