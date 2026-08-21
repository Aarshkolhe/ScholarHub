import express from "express";
import { sendDeadlineAlert } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/api/notifications/send-deadline-alert", sendDeadlineAlert);

export default router;
