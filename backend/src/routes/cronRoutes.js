import express from "express";
import crypto from "crypto";
import { checkAndSendDeadlineReminders } from "../services/schedulerService.js";

const router = express.Router();

/**
 * Constant-time comparison between provided and expected secrets
 * to prevent timing attacks.
 */
function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Middleware: Verify x-cron-secret header against process.env.CRON_SECRET.
 * Isolated from user JWT / admin session authentication.
 */
function requireCronSecret(req, res, next) {
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = req.headers["x-cron-secret"];

  // Ensure CRON_SECRET is configured and header matches securely
  if (!cronSecret || !providedSecret || !safeCompare(providedSecret, cronSecret)) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or missing cron secret."
      }
    });
  }

  next();
}

/**
 * POST /api/cron/deadline-reminders
 *
 * Dedicated route for external cron triggers (Render cron, cron-job.org, etc.)
 * Triggers daily deadline reminder notifications.
 */
router.post("/deadline-reminders", requireCronSecret, async (req, res) => {
  try {
    const result = await checkAndSendDeadlineReminders();

    if (result && result.status === "error") {
      console.error("[Cron Route] Deadline reminder job error:", result.error);
      return res.status(500).json({
        success: false,
        message: "Deadline reminder job encountered an error during execution."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deadline reminders job executed successfully.",
      result: result || { status: "success", count: 0 }
    });
  } catch (error) {
    console.error("[Cron Route] Error executing deadline reminders:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while processing deadline reminders."
    });
  }
});

export default router;
