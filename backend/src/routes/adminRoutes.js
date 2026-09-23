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

router.get("/api/admin/stats", requireAdminOrSuper, getAdminStats);
router.get("/api/admin/users", requireAdminOrSuper, getAdminUsers);
router.get("/api/admin/users/:id", requireAdminOrSuper, getUserProfile);
router.post("/api/admin/users/:id/block", requireAdminOrSuper, blockUser);
router.post("/api/admin/users/:id/unblock", requireAdminOrSuper, unblockUser);

// Admin Notification broadcasting
router.post("/api/admin/notifications/preview", requireAdminOrSuper, previewNotificationRecipients);
router.post("/api/admin/notifications/send", requireAdminOrSuper, sendAdminNotification);
router.get("/api/admin/notifications/history", requireAdminOrSuper, getNotificationHistory);

// Scholarship & Portal Administration (Admin & Super Admin)
router.post("/api/admin/scholarships", requireAdminOrSuper, createScholarship);
router.put("/api/admin/scholarships/:id", requireAdminOrSuper, updateScholarship);
router.delete("/api/admin/scholarships/:id", requireAdminOrSuper, deleteScholarship);

router.get("/api/admin/portals", requireAdminOrSuper, getAdminPortals);
router.post("/api/admin/portals", requireAdminOrSuper, createAdminPortal);
router.put("/api/admin/portals/:id", requireAdminOrSuper, updateAdminPortal);
router.patch("/api/admin/portals/:id/status", requireAdminOrSuper, toggleAdminPortalStatus);
router.delete("/api/admin/portals/:id", requireAdminOrSuper, deleteAdminPortal);

// Super Admin Only routes (Rule 1, Rule 3)
const requireSuperAdmin = requireRole("super_admin");

router.post("/api/admin/users/:id/promote", requireSuperAdmin, promoteUser);
router.post("/api/admin/users/:id/demote", requireSuperAdmin, demoteUser);
router.get("/api/admin/audit-log", requireSuperAdmin, getAuditLogs);

export default router;
