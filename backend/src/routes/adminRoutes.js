import express from "express";
import {
  getAdminStats,
  getAdminUsers,
  getUserProfile,
  blockUser,
  unblockUser,
  promoteUser,
  demoteUser,
  getAuditLogs,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  getAdminPortals,
  createAdminPortal,
  updateAdminPortal,
  toggleAdminPortalStatus,
  deleteAdminPortal,
} from "../controllers/adminController.js";
import {
  previewNotificationRecipients,
  sendAdminNotification,
  getNotificationHistory,
} from "../controllers/notificationController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Enforce authentication on all admin routes
router.use(authenticateToken);

// Admin & Super Admin routes
const requireAdminOrSuper = requireRole("admin", "super_admin");

router.get("/stats", requireAdminOrSuper, getAdminStats);
router.get("/users", requireAdminOrSuper, getAdminUsers);
router.get("/users/:id", requireAdminOrSuper, getUserProfile);
router.post("/users/:id/block", requireAdminOrSuper, blockUser);
router.post("/users/:id/unblock", requireAdminOrSuper, unblockUser);

// Admin Notification broadcasting
router.post("/notifications/preview", requireAdminOrSuper, previewNotificationRecipients);
router.post("/notifications/send", requireAdminOrSuper, sendAdminNotification);
router.get("/notifications/history", requireAdminOrSuper, getNotificationHistory);

// Scholarship & Portal Administration
// All admins can view portals; only Super Admins can add, edit, toggle, or delete portals
router.post("/scholarships", requireAdminOrSuper, createScholarship);
router.put("/scholarships/:id", requireAdminOrSuper, updateScholarship);
router.delete("/scholarships/:id", requireAdminOrSuper, deleteScholarship);

router.get("/portals", requireAdminOrSuper, getAdminPortals);

// Super Admin Only routes (Portal Mutations, Promotions, Demotions, Audit Logs)
const requireSuperAdmin = requireRole("super_admin");

router.post("/portals", requireSuperAdmin, createAdminPortal);
router.put("/portals/:id", requireSuperAdmin, updateAdminPortal);
router.patch("/portals/:id/status", requireSuperAdmin, toggleAdminPortalStatus);
router.delete("/portals/:id", requireSuperAdmin, deleteAdminPortal);

router.post("/users/:id/promote", requireSuperAdmin, promoteUser);
router.post("/users/:id/demote", requireSuperAdmin, demoteUser);
router.get("/audit-log", requireSuperAdmin, getAuditLogs);

export default router;
